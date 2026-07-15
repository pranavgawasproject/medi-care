import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isConfigured) {
  console.warn("⚠️ Supabase environment variables are missing! Using stub client.");
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      },
      realtime: {
        transport: ws
      }
    })
  : new Proxy(
      {},
      {
        get(target, prop) {
          return () => {
            throw new Error(`Supabase is not configured. Cannot call method '${prop}'. Please check your SUPABASE_URL and SUPABASE_KEY env variables.`);
          };
        }
      }
    );

console.log("✅ Supabase Client Initialized");
export default supabase;
