-- Storage buckets. Run after schema.sql (or create them in Storage in the dashboard).
insert into storage.buckets (id, name, public) values ('property-photos', 'property-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('cleaning-photos', 'cleaning-photos', false)
  on conflict (id) do nothing;

-- property-photos is a public bucket: files are served by their public URL with
-- no storage.objects policy needed, and only the service role writes (admin
-- uploads). No SELECT policy, so the bucket's contents cannot be listed.
