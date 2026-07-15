const fs = require('fs');
let code = `
const test = { a: 1 };
test.b = test;
try {
  JSON.stringify(test);
} catch(e) {
  console.log("Stringify failed", e.message);
}
`
