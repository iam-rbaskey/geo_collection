import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = 'https://fuolplbkorvkqczcuipz.supabase.co';
const supabaseKey = 'sb_publishable_oCjx_jIHlgy7Mq5eZqP80Q_03Lcads7';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );
