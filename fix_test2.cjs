const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

// I will just locate the interface CardListProps
// And replace everything from `      {/* Custom Prompt Modal */}` (or wherever it got messed up)
// with exactly:
/*
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
*/
const interfaceIndex = code.indexOf('interface CardListProps');

// Let's find `  );\n}` before interface
const p = code.substring(0, interfaceIndex).lastIndexOf('  );\n}');
if (p !== -1) {
    // Find where the JSX ends before the modals were. 
    // It looks like `        </div>\n      </div>\n`
    // Wait, the current code has:
    //   2115               </div>
    //   2116             )}
    //   2117           </div>
    //   2118         </div>
    //   2119       
    //   2120         
    //   2121       
    //   2122       
    //   2123         );
    //   2124       }
    
    // Let's just find the `)}` that corresponds to line 2116
    const pattern = '            </div>\n          )}\n        </div>\n      </div>\n';
    const idx = code.substring(0, p).lastIndexOf(pattern);
    if (idx !== -1) {
        code = code.substring(0, idx + pattern.length) + '    </div>\n' + code.substring(p);
    }
}
fs.writeFileSync('components/Admin.tsx', code);
