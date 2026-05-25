const fs = require('fs');
let content = fs.readFileSync('src/components/pages/UserProfileView.tsx', 'utf8');

if (content.includes('supabase.auth.onAuthStateChange')) {
  console.log("Listener exists!");
} else {
  console.log("Listener missing!");
}
