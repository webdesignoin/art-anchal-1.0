const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /  const addToCart = \(saree: Saree, quantity: number\) => \{\n    const existingIndex = cart\.findIndex\(\(item\) => item\.saree\.id === saree\.id\);\n    let updatedCart = \[\.\.\.cart\];\n\n    if \(existingIndex > -1\) \{/,
  `  const addToCart = (saree: Saree, quantity: number) => {
    const existingIndex = cart.findIndex((item) => item.saree.id === saree.id);
    let updatedCart = [...cart];
    const stockLimit = saree.stock_quantity ?? 1;

    if (existingIndex > -1) {
      // Validate stock
      if (quantity > 0 && updatedCart[existingIndex].quantity + quantity > stockLimit) {
        triggerToast("Out of Stock", \`Only \${stockLimit} \${stockLimit === 1 ? 'piece is' : 'pieces are'} available.\`);
        return;
      }`
);

// We need to also add validation for new items
content = content.replace(
  /    \} else if \(quantity > 0\) \{\n      updatedCart\.push\(\{ saree, quantity \}\);\n      triggerToast\("Added to showroom bag", saree\.name\);\n      setIsCartOpen\(true\);\n    \}/,
  `    } else if (quantity > 0) {
      if (quantity > stockLimit) {
        triggerToast("Out of Stock", \`Only \${stockLimit} \${stockLimit === 1 ? 'piece is' : 'pieces are'} available.\`);
        return;
      }
      updatedCart.push({ saree, quantity });
      triggerToast("Added to showroom bag", saree.name);
      setIsCartOpen(true);
    }`
);

fs.writeFileSync('src/App.tsx', content);
