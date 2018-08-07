# bndlr
A tiny javascript bundler
## Usage

```js
// Entry file entry.js
import message from './message.js';

// message.js
export default 'Hello world!';

// Generate a bundle
const { bundle, createGraph } = require(./lib/bndlr);
const fs = require('fs');

const graph = createGraph('./entry.js');

const result = bundle(graph);

fs.writeFileSync('./bundle.js', result); // Output will be in *bundle.js*
```
