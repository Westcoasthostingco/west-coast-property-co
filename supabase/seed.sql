-- Sample rows for local/staging. Run after schema.sql.
insert into owners (id, name, email, payouts_enabled, fee_percent) values
  ('11111111-1111-1111-1111-111111111111', 'Dana Whitfield', 'dana@example.com', true, 18),
  ('22222222-2222-2222-2222-222222222222', 'Marcus Lee', 'marcus@example.com', false, 20);

insert into properties (id, owner_id, slug, name, city, region, bedrooms, bathrooms, max_guests, nightly_rate_cents, cleaning_fee_cents, tax_rate_bps, summary, amenities, published) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'the-grand-view', 'The Grand View', 'Gig Harbor', 'WA', 3, 2, 6, 32500, 15000, 1030, 'Just steps from the shops, restaurants, and waterfront of downtown Gig Harbor, The Grand View offers stunning views of Puget Sound, Mount Rainier, and Gig Harbor itself.', '{"Puget Sound views","Walk to downtown","Wi-Fi","Full kitchen","Deck","Parking"}', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'the-leonora-by-the-sea', 'The Leonora by the Sea', 'Hood Canal', 'WA', 2, 2, 5, 28500, 13500, 1030, 'Set on the shores of Hood Canal, The Leonora greets you with Olympic Mountain views, known for its oysters, and access to trails in Olympic National Park and the wider Olympic Peninsula.', '{"Waterfront","Olympic Mountain views","Oyster beach","Fire pit","Wi-Fi","Pet friendly"}', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'the-bedrock', 'The Bedrock', 'Randle', 'WA', 3, 2, 7, 24000, 14000, 1030, 'Located in Randle and just minutes from Packwood, The Bedrock offers mountain air, quiet forest, and easy access to some of the best adventures the Cascades have to offer.', '{"Mountain air","Near Mount Rainier","Hot tub","Wood stove","Wi-Fi","EV charger"}', true);

insert into bookings (id, property_id, guest_name, check_in, check_out, source, status, subtotal_cents, cleaning_fee_cents, tax_cents, total_cents) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'A. Rivera', '2026-10-09', '2026-10-13', 'direct', 'confirmed', 114000, 12000, 12600, 138600),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', 'J. Chen', '2026-10-04', '2026-10-07', 'airbnb', 'confirmed', 63000, 8500, 0, 71500),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', 'S. Patel', '2026-09-20', '2026-09-25', 'vrbo', 'confirmed', 170000, 15000, 0, 185000);

insert into reviews (property_id, booking_id, guest_name, rating, body, published) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'A. Rivera', 5, 'Spotless, great location, and check-in was effortless.', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000003', 'S. Patel', 5, 'Perfect for the whole family. The hot tub was a hit.', false);

insert into payouts (owner_id, booking_id, gross_cents, fee_cents, net_cents, release_on, status) values
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000003', 170000, 34000, 136000, '2026-09-26', 'paid'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000002', 63000, 11340, 51660, '2026-10-05', 'scheduled'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-0000-0000-0000-000000000001', 114000, 20520, 93480, '2026-10-10', 'scheduled');
