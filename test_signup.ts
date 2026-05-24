import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Attempting sign up...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test_razorpay_reviewer@example.com',
    password: 'SecurePassword123!'
  });
  
  if (error) {
    console.error("Auth Sign Up Error:", error.message);
    return;
  }
  
  console.log("Auth Sign Up Success! User ID:", data.user?.id);
  
  if (data.user) {
    console.log("Attempting to create profile...");
    const { error: profileError } = await supabase.from("profiles").upsert(
      { auth_user_id: data.user.id, name: "Test User", email: 'test_razorpay_reviewer@example.com', source: "online" },
      { onConflict: "auth_user_id" }
    );
    
    if (profileError) {
      console.error("Profile Upsert Error:", profileError);
    } else {
      console.log("Profile successfully created!");
    }
  }
}

run();
