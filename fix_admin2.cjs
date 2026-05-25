const fs = require('fs');
let content = fs.readFileSync('src/components/pages/AdminConsoleView.tsx', 'utf8');

content = content.replace(
  /        <\/div>\n      <\/main>/,
  `          </>
          )}
        </div>
      </main>`
);

fs.writeFileSync('src/components/pages/AdminConsoleView.tsx', content);
