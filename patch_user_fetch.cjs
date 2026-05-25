const fs = require('fs');
let content = fs.readFileSync('src/components/pages/UserProfileView.tsx', 'utf8');

// We want to add an auth state listener inside UserProfileView's useEffect so it re-fetches orders when Supabase confirms the session.
content = content.replace(
  /    fetchProfileData\(\);\n    if \(activeTab === "orders" \|\| activeTab === "profile"\) \{\n      fetchOrders\(\);\n    \}\n  \}, \[userSession, activeTab\]\);/,
  `    fetchProfileData();
    if (activeTab === "orders" || activeTab === "profile") {
      fetchOrders();
    }

    // Also listen to auth state changes to re-fetch once session is absolutely ready
    if (!isMock) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          if (activeTab === "orders" || activeTab === "profile") {
             fetchOrders();
          }
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userSession?.email, activeTab]);`
);

fs.writeFileSync('src/components/pages/UserProfileView.tsx', content);
