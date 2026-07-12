const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

// Replace everything from {/* Custom Prompt Modal */} to the } at 2189 with empty string
const start = code.indexOf('{/* Custom Prompt Modal */}');
const end = code.indexOf('}', start) + 1; // this finds the first }, wait, we want to replace up to line 2189
// Actually, let's just find `  );\n}` before interface
const interfaceIndex = code.indexOf('interface CardListProps');
const beforeInterface = code.substring(0, interfaceIndex);
const p = beforeInterface.lastIndexOf('  );\n}');
// let's cut from prompt modal to p
const promptStart = beforeInterface.indexOf('{/* Custom Prompt Modal */}');
if (promptStart !== -1) {
    code = code.substring(0, promptStart) + '\n' + code.substring(p);
}

fs.writeFileSync('components/Admin.tsx', code);
