const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

// The modal code starts at {/* Custom Prompt Modal */} and ends at </div> \n  );\n} which is around 2957
const startStr = '{/* Custom Prompt Modal */}';

// I'll just extract the modal code and remove ALL instances of it
const endStr = '      )}';
let modalCode = '';
let firstIndex = code.indexOf(startStr);
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

// Clean up any stray `</div>` or `);` or `}` at the end of the file BEFORE `interface CardListProps`? NO, CardListProps is at the end.
// Wait, the end of `Admin` function is where we should insert the modalCode.
// The `Admin` function ends with:
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// Let's find exactly this block.
const adminEndBlock = `            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;

if (code.includes(adminEndBlock)) {
    code = code.replace(adminEndBlock, `            </div>
          )}
        </div>
      </div>
      
${modalCode}

    </div>
  );
}`);
} else {
    console.log("Could not find adminEndBlock!");
    // Maybe we messed up the block. Let's find `interface CardListProps` and insert before it.
    const interfaceIndex = code.indexOf('interface CardListProps');
    // find the closing of Admin before interface
    const p = code.substring(0, interfaceIndex).lastIndexOf('  );\n}');
    if (p !== -1) {
        // find the last </div> before p
        const lastDiv = code.substring(0, p).lastIndexOf('</div>');
        if (lastDiv !== -1) {
            code = code.substring(0, lastDiv) + modalCode + '\n    ' + code.substring(lastDiv);
        }
    }
}

// Also remove any stray closing tags at the very end of the file
code = code.replace(/(<\/div>\s*|\)\s*;\s*|\}\s*)+$/, '');

fs.writeFileSync('components/Admin.tsx', code);
