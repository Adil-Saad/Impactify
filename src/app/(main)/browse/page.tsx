import { createClient } from '@/utils/supabase/server';
import BrowseClient from './BrowseClient';

export default async function BrowsePage() {
  const supabase = await createClient();

  const { data: quests, error } = await supabase
    .from('quests')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  return <BrowseClient quests={quests ?? []} />;
}
