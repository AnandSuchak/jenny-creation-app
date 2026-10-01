const fs = require('fs');

const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
const tabMatches = [...pageContent.matchAll(/activeTab\s*===?\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('Unique tabs:', [...new Set(tabMatches)]);

const modalMatches = [...pageContent.matchAll(/(is[A-Z][a-zA-Z0-9_]*ModalOpen)/g)].map(m => m[1]);
console.log('Unique modals:', [...new Set(modalMatches)]);
