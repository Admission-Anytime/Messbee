const fs = require('fs');
const path = require('path');

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace imports
  // import x from 'y'; -> const x = require('y');
  content = content.replace(/import\s+([a-zA-Z0-9_]+)\s+from\s+['"]([^'"]+)['"];?/g, "const $1 = require('$2');");
  
  // import { a, b } from 'y'; -> const { a, b } = require('y');
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g, "const { $1 } = require('$2');");

  // Replace exports
  // export async function -> module.exports.myFunc = async function
  content = content.replace(/export\s+(async\s+)?function\s+([a-zA-Z0-9_]+)/g, "module.exports.$2 = $1function $2");
  
  // export const x = -> module.exports.x =
  content = content.replace(/export\s+const\s+([a-zA-Z0-9_]+)\s*=/g, "module.exports.$1 =");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Converted', filePath);
}

convertFile(path.join(__dirname, 'engine/nodeExecutors.js'));
convertFile(path.join(__dirname, 'engine/flowRunner.js'));
