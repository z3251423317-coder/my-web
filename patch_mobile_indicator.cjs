const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

const replacement = `      ) : null}

      {/* Mobile DB Status Dot */}
      {isMobile && dbConnected !== null && (
        <div className="fixed top-6 right-6 z-[100] flex items-center justify-center pointer-events-none" title={dbConnected ? "Database Connected" : "Database Disconnected"}>
          <div className={\`w-2.5 h-2.5 rounded-full \${dbConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}\`}></div>
        </div>
      )}`;

app = app.replace(/\) : null\}/, replacement);

fs.writeFileSync('App.tsx', app);
console.log("Patched App.tsx with mobile DB indicator");
