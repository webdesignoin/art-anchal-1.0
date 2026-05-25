const fs = require('fs');
let content = fs.readFileSync('src/components/pages/AdminConsoleView.tsx', 'utf8');

// The bad insertion looks like this:
//           )}
//
//        </div>
//      </main>
//
//            </>
//          )}
//
//          {/* ══ MODAL: ADD/EDIT SAREE

content = content.replace(
  /        <\/div>\n      <\/main>\n\n            <\/>\n          \)}\n\n          \{\/\* ══ MODAL: ADD\/EDIT SAREE/g,
  `            </>
          )}
        </div>
      </main>

      {/* ══ MODAL: ADD/EDIT SAREE`
);

fs.writeFileSync('src/components/pages/AdminConsoleView.tsx', content);
