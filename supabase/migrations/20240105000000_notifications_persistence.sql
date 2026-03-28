-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), -- Null means global notification for everyone
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE
);

-- User notifications tracking read status
CREATE TABLE user_notifications (
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  PRIMARY KEY (notification_id, user_id)
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS
CREATE POLICY "Users can read their own notifications or global ones" ON notifications
FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can read their user_notifications" ON user_notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their user_notifications" ON user_notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their user_notifications" ON user_notifications
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trigger to create global notification for new quests
CREATE OR REPLACE FUNCTION notify_new_quest() RETURNS TRIGGER AS $$
DECLARE
  new_notif_id UUID;
BEGIN
  INSERT INTO notifications (message, type, quest_id)
  VALUES ('New quest posted: "' || NEW.title || '"', 'new_quest', NEW.id) 
  RETURNING id INTO new_notif_id;
  
  -- Insert unread tracking for everyone except the creator
  INSERT INTO user_notifications (notification_id, user_id) 
  SELECT new_notif_id, id FROM auth.users WHERE id != NEW.created_by;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quest_created_trigger AFTER INSERT ON quests FOR EACH ROW EXECUTE FUNCTION notify_new_quest();

-- Trigger for accepted quests (notify the creator)
CREATE OR REPLACE FUNCTION notify_quest_accepted() RETURNS TRIGGER AS $$
DECLARE
  new_notif_id UUID;
BEGIN
  IF NEW.status = 'active' AND OLD.status = 'open' THEN
    INSERT INTO notifications (user_id, message, type, quest_id) 
    VALUES (NEW.created_by, 'Your quest "' || NEW.title || '" was accepted!', 'accepted', NEW.id) 
    RETURNING id INTO new_notif_id;
    
    INSERT INTO user_notifications (notification_id, user_id) 
    VALUES (new_notif_id, NEW.created_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quest_accepted_trigger AFTER UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION notify_quest_accepted();
