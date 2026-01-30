-- Enable realtime for all tables that need cross-portal sync
-- Required for real-time subscriptions to work in the app

-- Add tables to supabase_realtime publication
-- This allows the app to receive INSERT, UPDATE, DELETE events

alter publication supabase_realtime add table clients;
alter publication supabase_realtime add table properties;
alter publication supabase_realtime add table equipment;
alter publication supabase_realtime add table work_orders;
alter publication supabase_realtime add table inspections;
alter publication supabase_realtime add table invoices;
alter publication supabase_realtime add table service_requests;
alter publication supabase_realtime add table vendors;
alter publication supabase_realtime add table reminders;
alter publication supabase_realtime add table calendar_events;
alter publication supabase_realtime add table programs;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table user_property_assignments;
alter publication supabase_realtime add table recommendations;
