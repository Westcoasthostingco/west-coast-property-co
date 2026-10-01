-- Storage buckets. Run after schema.sql (or create them in Storage in the dashboard).
insert into storage.buckets (id, name, public) values ('property-photos', 'property-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('cleaning-photos', 'cleaning-photos', false)
  on conflict (id) do nothing;

-- Anyone may view property photos; only the service role writes (admin uploads).
create policy "public read property photos" on storage.objects for select
  using (bucket_id = 'property-photos');
