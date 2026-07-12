const fs = require('fs');

let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

// Find the modalUI we injected. It starts with {/* Custom Prompt Modal */} and ends with the </div> of Custom Confirm Modal.
const startStr = '{/* Custom Prompt Modal */}';
const startIndex = code.indexOf(startStr);
const endStr = '      )}'; // This is the end of the Custom Confirm Modal
let endIndex = code.indexOf(endStr, startIndex) + endStr.length;

if (startIndex !== -1) {
  const modalCode = code.substring(startIndex, endIndex);
  
  // Remove it from its current position
  code = code.substring(0, startIndex) + code.substring(endIndex);
  
  // Clean up any stray </div> we might have messed up (Wait, earlier I did: code.substring(0, lastDivIndex) + modalUI + code.substring(lastDivIndex) so we should be good if we just remove it)
  // Let's also check if we inserted it TWICE because of the first regex replacement!
  const secondStartIndex = code.indexOf(startStr);
  if (secondStartIndex !== -1) {
    const secondEndIndex = code.indexOf(endStr, secondStartIndex) + endStr.length;
    code = code.substring(0, secondStartIndex) + code.substring(secondEndIndex);
  }

  // Find the end of Admin function
  // The Admin function ends before the interface CardListProps
  const interfaceIndex = code.indexOf('interface CardListProps');
  if (interfaceIndex !== -1) {
    // Look backwards from interfaceIndex for the closing of Admin
    // It looks like:
    //     </div>
    //   );
    // }
    const adminEndMatch = code.substring(0, interfaceIndex).lastIndexOf('  );\n}');
    if (adminEndMatch !== -1) {
      // Find the last </div> before adminEndMatch
      const lastDivInAdmin = code.substring(0, adminEndMatch).lastIndexOf('</div>');
      if (lastDivInAdmin !== -1) {
        code = code.substring(0, lastDivInAdmin) + modalCode + '\n      ' + code.substring(lastDivInAdmin);
      }
    }
  }

  fs.writeFileSync('components/Admin.tsx', code);
}
