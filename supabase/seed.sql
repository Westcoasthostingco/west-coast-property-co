-- Sample rows for local/staging. Run after schema.sql.
insert into owners (id, name, email, payouts_enabled, fee_percent) values
  ('11111111-1111-1111-1111-111111111111', 'Dana Whitfield', 'dana@example.com', true, 18),
  ('22222222-2222-2222-2222-222222222222', 'Marcus Lee', 'marcus@example.com', false, 20);

insert into properties (id, owner_id, slug, name, city, region, bedrooms, bathrooms, max_guests, nightly_rate_cents, cleaning_fee_cents, summary, amenities, published) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'pacific-bluff-cottage', 'Pacific Bluff Cottage', 'Pismo Beach', 'CA', 2, 2, 5, 28500, 12000, 'Ocean-view cottage a short walk from the sand, with a fire pit and outdoor shower.', '{"Ocean view","Fire pit","Wi-Fi","Pet friendly","Smart lock"}', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'harbor-loft', 'Harbor Loft', 'San Diego', 'CA', 1, 1, 3, 21000, 8500, 'Bright downtown loft steps from the waterfront, dining and transit.', '{"Walkable","Wi-Fi","Washer/dryer","Smart lock"}', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'redwood-retreat', 'Redwood Retreat', 'Santa Cruz', 'CA', 3, 2, 7, 34000, 15000, 'Family-sized cabin among the redwoods with a hot tub and game room.', '{"Hot tub","Game room","Wi-Fi","EV charger"}', true);

insert into bookings (id, property_id, guest_name, check_in, check_out, source, status, total_cents) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'A. Rivera', '2026-10-09', '2026-10-13', 'direct', 'confirmed', 126000),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', 'J. Chen', '2026-10-04', '2026-10-07', 'airbnb', 'confirmed', 71500),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', 'S. Patel', '2026-09-20', '2026-09-25', 'vrbo', 'completed', 185000);

insert into reviews (property_id, booking_id, guest_name, rating, body, published) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'A. Rivera', 5, 'Spotless, great location, and check-in was effortless.', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000003', 'S. Patel', 5, 'Perfect for the whole family. The hot tub was a hit.', false);

insert into payouts (owner_id, booking_id, gross_cents, fee_cents, net_cents, release_on, status) values
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000003', 185000, 37000, 148000, '2026-09-26', 'paid'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000002', 71500, 12900, 58600, '2026-10-05', 'scheduled'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000001', 126000, 22700, 103300, '2026-10-10', 'scheduled');
