-- Add RLS policy so adventurers can accept (update status of) open quests
CREATE POLICY "Adventurers can accept open quests" ON quests
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND status = 'open'
  )
  WITH CHECK (
    status = 'active'
    AND adventurer_id = auth.uid()
  );

-- Allow quest creator to mark as completed/verified
CREATE POLICY "Quest creators can update status to completed" ON quests
  FOR UPDATE
  USING (auth.uid() = created_by);
