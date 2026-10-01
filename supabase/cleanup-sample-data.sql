-- Run once before go-live to remove the sample rows from seed.sql.
-- Keeps the schema; deletes homes, owners, stays and everything hanging off them.
begin;
delete from cleaning_photos;
delete from maintenance_tickets;
delete from cleaning_jobs;
delete from payouts;
delete from reviews;
delete from bookings;
delete from pricing_rules;
delete from property_photos;
delete from ical_feeds;
delete from property_integrations;
delete from properties;
delete from owners;
delete from cleaners;
delete from stripe_events;
delete from audit_log;
commit;
