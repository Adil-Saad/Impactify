-- Enable realtime on notifications tables so the Header can subscribe to new inserts
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;
