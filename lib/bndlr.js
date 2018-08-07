const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const { transformFromAst } = require('babel-core');

let ID = 0;

/**
 * Parse module file, generate AST and identify dependencies
 * @param {string} filename name of the module
 */
function createAsset(filename) {
  const content = fs.readFileSync(filename, 'utf-8');

  const ast = babylon.parse(content, {
    sourceType: 'module'
  });

  const dependencies = [];

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    }
  });

  const id = ID++;

  const { code } = transformFromAst(ast, null, {
    presets: ['env']
  });

  return {
    id,
    filename,
    dependencies,
    code
  };
}

/**
 * Generate a dependency graph for entry
 * @param  {string} entry filename of the entry module
 * @return
 */
function createGraph(entry) {
  const mainAsset = createAsset(entry);

  const queue = [mainAsset];

  for (const asset of queue) {
    asset.mapping = {};

    const dirname = path.dirname(asset.filename);

    asset.dependencies.forEach((relativePath) => {
      const absolutePath = path.join(dirname, relativePath);

      const child = createAsset(absolutePath);

      asset.mapping[relativePath] = child.id;

      queue.push(child);
    });
  }

  return queue;
}

/**
 * Generate bundle based on input dependency graph
 * @param  {any[]} graph An array that represents dependency graph
 */
function bundle(graph) {
  let modules = '';

  graph.forEach((mod) => {
    modules += `${mod.id}: [
       function (require, module, exports) {
         ${mod.code}
       },
       ${JSON.stringify(mod.mapping)},
     ],`;
  });

  const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];

        function localRequire(name) {
          return require(mapping[name]);
        }

        const module = { exports: {} };

        fn(localRequire, module, module.exports);

        return module.exports;
      }

      require(0);
    })({${modules}})
  `;

  return result;
}

module.exports = {
  bundle,
  createGraph
};
