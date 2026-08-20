-- =============================================================================
-- Suivi ETG — CFPC Georges Hoareau
-- Migration 03 : consignes du formateur, et fin des series en double
-- Copyright (c) 2025 Haussmann Begue & Georges Hoareau. Tous droits reserves.
--
-- A COLLER TEL QUEL dans Supabase > SQL Editor, puis "Run".
--
-- Ce script est IDEMPOTENT : le rejouer autant de fois qu'on veut ne change
-- rien de plus. Il ne supprime aucune donnee. Le nettoyage des doublons deja
-- presents fait l'objet d'un second script, separe et volontaire.
--
-- Il apporte deux choses :
--   1. la table `consignes` : le message qu'un formateur adresse a un
--      stagiaire, affiche en tete de son ecran "Aujourd'hui" ;
--   2. la fin des series enregistrees deux fois.
-- =============================================================================


-- =============================================================================
-- 1. CONSIGNES DU FORMATEUR
-- =============================================================================
create table if not exists public.consignes (
  id            uuid primary key default gen_random_uuid(),
  stagiaire_id  uuid not null references public.profiles(id) on delete cascade,
  formateur_id  uuid          references public.profiles(id) on delete set null,
  texte         text not null,
  theme         text,                       -- etiquette courte : "Distances", "Methode"...
  created_at    timestamptz not null default now(),
  lue_at        timestamptz                 -- null tant que le stagiaire ne l'a pas lue
);

-- L'ecran "Aujourd'hui" lit toujours la derniere consigne d'un stagiaire :
-- c'est exactement ce que sert cet index.
create index if not exists consignes_stagiaire_idx
  on public.consignes (stagiaire_id, created_at desc);

alter table public.consignes enable row level security;

drop policy if exists "consignes_select" on public.consignes;
drop policy if exists "consignes_insert" on public.consignes;
drop policy if exists "consignes_update" on public.consignes;
drop policy if exists "consignes_delete" on public.consignes;

-- Le stagiaire lit les siennes, le formateur lit tout.
create policy "consignes_select" on public.consignes
  for select to authenticated
  using ( stagiaire_id = auth.uid() or public.is_formateur() );

-- Ecrire, corriger, supprimer une consigne : formateur uniquement.
--
-- Le stagiaire n'a DELIBEREMENT aucun droit d'ecriture ici. Lui accorder un
-- droit de mise a jour sur ses propres lignes, meme dans l'intention de le
-- laisser marquer une consigne comme lue, lui permettrait aussi d'en reecrire
-- le texte. Le marquage "lue" passe donc par la fonction dediee plus bas, qui
-- ne touche qu'a la date de lecture.
create policy "consignes_insert" on public.consignes
  for insert to authenticated
  with check ( public.is_formateur() );

create policy "consignes_update" on public.consignes
  for update to authenticated
  using ( public.is_formateur() )
  with check ( public.is_formateur() );

create policy "consignes_delete" on public.consignes
  for delete to authenticated
  using ( public.is_formateur() );

-- Marquage "lue" : la seule ecriture permise au stagiaire, et elle ne peut
-- porter que sur sa propre ligne et que sur la date de lecture.
create or replace function public.consigne_marquer_lue(p_id uuid)
returns timestamptz
language sql
security definer
set search_path = public
as $$
  update public.consignes
     set lue_at = coalesce(lue_at, now())
   where id = p_id
     and stagiaire_id = auth.uid()
  returning lue_at;
$$;

revoke all on function public.consigne_marquer_lue(uuid) from public;
grant execute on function public.consigne_marquer_lue(uuid) to authenticated;


-- =============================================================================
-- 2. FIN DES SERIES ENREGISTREES DEUX FOIS
--
-- Constat du 20/08/2026 sur la base reelle : 1 000 series enregistrees,
-- 623 apres dedoublonnage — soit 377 doublons, 37,7 % de la table. 273 des
-- 281 paires ont ete creees a moins de deux minutes d'ecart : ce sont des
-- doubles envois, pas de vraies secondes series.
--
-- LA BASE ETAIT DEJA PRETE. La colonne `client_uid` (type uuid) et son index
-- unique `series_client_uid_uniq` existent depuis le script de base : c'est
-- l'application qui ne les utilisait pas. Rien n'est donc a ajouter ici, et ce
-- bloc se contente de VERIFIER leur presence — poser un second index identique
-- ne ferait que doubler le travail d'ecriture de la base a chaque serie.
--
-- Le correctif est du cote de l'application (version 4.4) : chaque serie recoit
-- son identifiant des sa creation et le conserve s'il faut la renvoyer.
--
-- Le filet reste celui-ci : les valeurs NULL ne se genent pas entre elles dans
-- un index unique PostgreSQL, donc les lignes anciennes restent en place, mais
-- deux envois portant le meme identifiant ne peuvent pas coexister.
--
-- Le "if not exists" ci-dessous ne sert qu'aux bases qui n'auraient pas recu le
-- script de base a jour. Sur la votre, les deux lignes ne feront rien.
-- =============================================================================
alter table public.series add column if not exists client_uid uuid;

create unique index if not exists series_client_uid_uniq
  on public.series (client_uid);


-- =============================================================================
-- 3. CONTROLE — doit renvoyer 5 lignes, toutes en "OK"
-- =============================================================================
select 'table consignes' as controle,
       case when to_regclass('public.consignes') is not null
            then 'OK' else 'MANQUANTE' end as etat
union all
select 'regles d''acces consignes',
       case when (select count(*) from pg_policies
                   where schemaname='public' and tablename='consignes') = 4
            then 'OK (4 regles)'
            else 'INCOMPLET (' || (select count(*) from pg_policies
                   where schemaname='public' and tablename='consignes') || ' regles)' end
union all
select 'fonction consigne_marquer_lue',
       case when to_regprocedure('public.consigne_marquer_lue(uuid)') is not null
            then 'OK' else 'MANQUANTE' end
union all
select 'colonne series.client_uid (uuid)',
       coalesce((select case when data_type='uuid' then 'OK'
                             else 'TYPE INATTENDU : ' || data_type end
                   from information_schema.columns
                  where table_schema='public' and table_name='series'
                    and column_name='client_uid'), 'MANQUANTE')
union all
select 'index unique series.client_uid',
       case when exists (select 1 from pg_indexes
                          where schemaname='public' and indexname='series_client_uid_uniq')
            then 'OK' else 'MANQUANT' end;
