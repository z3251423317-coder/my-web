const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

// 1. Find Confirm Modal at the end of the file and extract it
const confirmStart = code.indexOf('{/* Custom Confirm Modal */}');
let confirmModalCode = '';
if (confirmStart !== -1) {
    confirmModalCode = code.substring(confirmStart);
    // clean it up (might be missing `}` at the end because of previous regex)
    if (!confirmModalCode.endsWith('}')) {
        confirmModalCode += '}';
    }
    // Remove it from the end of the file
    code = code.substring(0, confirmStart);
}

// 2. Fix the `deleteCard` await error
code = code.replace(/const deleteCard = \(id: number\) => \{/g, 'const deleteCard = async (id: number) => {');
code = code.replace(/const saveCardToCloud = \(id: number\) => \{/g, 'const saveCardToCloud = async (id: number) => {'); // just in case
code = code.replace(/const deleteCategory = \(cat: string\) => \{/g, 'const deleteCategory = async (cat: string) => {');
code = code.replace(/const renameCategory = \(oldName: string\) => \{/g, 'const renameCategory = async (oldName: string) => {');


// 3. Find the Prompt Modal and extract it
const promptStart = code.indexOf('{/* Custom Prompt Modal */}');
let promptModalCode = '';
if (promptStart !== -1) {
    const endStr = '      )}';
    const end = code.indexOf(endStr, promptStart) + endStr.length;
    promptModalCode = code.substring(promptStart, end);
    // Remove it from its current position
    code = code.substring(0, promptStart) + code.substring(end);
}

// 4. Clean up any stray `</div>` or `);` or `}` before `interface CardListProps`
const interfaceIndex = code.indexOf('interface CardListProps');
let adminComponentCode = code.substring(0, interfaceIndex);

// Let's ensure admin component is properly closed. 
// It should end with `</div>\n  );\n}`
// We will replace the end of adminComponentCode with our modals and then the proper closing tags.

// Find the last `</div>`
const lastDivIndex = adminComponentCode.lastIndexOf('</div>');
if (lastDivIndex !== -1) {
    // Before this `</div>`, we inject our modals
    adminComponentCode = adminComponentCode.substring(0, lastDivIndex) + 
        '\n      ' + promptModalCode + 
        '\n      ' + confirmModalCode + 
        '\n    </div>\n  );\n}\n\n';
}

code = adminComponentCode + code.substring(interfaceIndex);

fs.writeFileSync('components/Admin.tsx', code);
