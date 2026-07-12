const fs = require('fs');

let appCode = fs.readFileSync('App.tsx', 'utf-8');
appCode = appCode.replace(/style=\{\{ backgroundColor: screen3TabsBg \}\}(?!>)/g, 'style={{ backgroundColor: screen3TabsBg }}>');
appCode = appCode.replace(/style=\{\{ backgroundColor: screen7TabsBg \}\}(?!>)/g, 'style={{ backgroundColor: screen7TabsBg }}>');
fs.writeFileSync('App.tsx', appCode);

let adminCode = fs.readFileSync('components/Admin.tsx', 'utf-8');
adminCode = adminCode.replace(/text-\\\\\\[11px\\\\\\]/g, 'text-[11px]');
adminCode = adminCode.replace(/text-\\[11px\\]/g, 'text-[11px]');
fs.writeFileSync('components/Admin.tsx', adminCode);
