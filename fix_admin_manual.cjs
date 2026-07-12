const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

// The modal code starts at {/* Custom Prompt Modal */} and ends at </div> \n  );\n} which is around 2957
const startStr = '{/* Custom Prompt Modal */}';
const firstIndex = code.indexOf(startStr);
const lastIndex = code.lastIndexOf(startStr);

// I'll just extract the modal code and remove ALL instances of it
const endStr = '      )}';
let modalCode = '';
if (firstIndex !== -1) {
    const end = code.indexOf(endStr, firstIndex) + endStr.length;
    modalCode = code.substring(firstIndex, end);
}

// Keep removing until there are no more
while (code.indexOf(startStr) !== -1) {
    const s = code.indexOf(startStr);
    const e = code.indexOf(endStr, s) + endStr.length;
    code = code.substring(0, s) + code.substring(e);
}

// Now we need to find the correct insertion point.
// Find `interface CardListProps`
const interfaceIndex = code.indexOf('interface CardListProps');
const adminEnd = code.substring(0, interfaceIndex).lastIndexOf('</div>\n      </div>\n    </div>\n  );\n}');

if (adminEnd !== -1) {
    const insertPoint = code.substring(0, interfaceIndex).lastIndexOf('</div>\n      </div>\n    </div>\n  );\n}');
    if (insertPoint !== -1) {
        code = code.substring(0, insertPoint) + modalCode + '\n' + code.substring(insertPoint);
    }
} else {
    // try to find just `  );\n}` before the interface
    const p = code.substring(0, interfaceIndex).lastIndexOf('  );\n}');
    if (p !== -1) {
        code = code.substring(0, p) + modalCode + '\n' + code.substring(p);
    }
}

// Wait, I see at the end of the file:
// </div>
//   );
// }
// If there are extra closing tags, let's clean them up.
// Actually, I can just find the end of the file and remove the rogue `</div> ); }`
code = code.replace(/<\/div>\s*\);\s*\}\s*$/, '');

fs.writeFileSync('components/Admin.tsx', code);
