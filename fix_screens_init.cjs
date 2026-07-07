const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /const \[screens, setScreens\] = useState<ScreenData\[\]>\(DEFAULT_SCREENS\);/,
  `const [screens, setScreens] = useState<ScreenData[]>(() => {
    const saved = localStorage.getItem("alphaqubit_custom_screens_v11");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse screens from localStorage", e);
      }
    }
    return DEFAULT_SCREENS;
  });`
);

fs.writeFileSync('App.tsx', app);
console.log("Fixed screens init");
