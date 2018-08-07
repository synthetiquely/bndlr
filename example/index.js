const { bundle, createGraph } = require('../lib/bndlr');
const fs = require('fs');

const graph = createGraph('./example/entry.js');
const result = bundle(graph);

console.log('Generating bundle...');
fs.writeFileSync('./example/bundle.js', result);
console.log('Bundle complete');
