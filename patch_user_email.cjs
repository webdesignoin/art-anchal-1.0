const fs = require('fs');
let content = fs.readFileSync('src/components/pages/UserProfileView.tsx', 'utf8');

content = content.replace(
  /      const updatedSession = \{ \.\.\.userSession, name: profile\.name!, phone: profile\.phone! \};/,
  `      // Preserve the email string if one existed so orders still match
      const updatedSession = { 
        ...userSession, 
        name: profile.name!, 
        phone: profile.phone!, 
        email: profile.email || userSession?.email || "" 
      };`
);

fs.writeFileSync('src/components/pages/UserProfileView.tsx', content);
