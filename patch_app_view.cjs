const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Persist currentView state
content = content.replace(
  'const [currentView, setView] = useState<ViewState>("home");',
  `const [currentView, _setView] = useState<ViewState>(() => {
    try {
      const saved = localStorage.getItem("art_anchal_view");
      if (saved) return saved as ViewState;
    } catch {}
    return "home";
  });

  const setView = (v: ViewState) => {
    _setView(v);
    try {
      localStorage.setItem("art_anchal_view", v);
    } catch {}
  };`
);

// 2. Remove forced navigation in checkSession
content = content.replace(
  /          if \(isAdmin\) setView\("admin-console"\);\n          else setView\("home"\);/,
  `          // Only navigate if we were on the login screen
          if (currentView === "login-register") {
            if (isAdmin) setView("admin-console");
            else setView("home");
          }`
);

// 3. Remove forced navigation in onAuthStateChange
content = content.replace(
  /            \/\/ Route admin to console, others to home\n            if \(isAdmin\) \{\n              setView\("admin-console"\);\n            \} else \{\n              setView\("home"\);\n            \}/,
  `            // Route only if coming from login or redirected
            if (currentView === "login-register" || window.location.hash.includes("access_token")) {
              if (isAdmin) setView("admin-console");
              else setView("home");
            }`
);

fs.writeFileSync('src/App.tsx', content);
