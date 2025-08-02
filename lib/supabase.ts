import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
//   process.env.SUPABASE_ANON_KEY!
  process.env.SUPABASE_SERVICE_ROLE!
);



// import { createBrowserClient } from "@supabase/ssr";

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error("Supabase environment variables are not set.");
// }

// export const createClient = () =>
//   createBrowserClient(
//     supabaseUrl,
//     supabaseKey,
//   );

