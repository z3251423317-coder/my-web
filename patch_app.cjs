const fs = require('fs');

let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /const \[screens, setScreens\] = useState<ScreenData\[\]>\(\(\) => \{[\s\S]*?return DEFAULT_SCREENS;\n  \}\);/,
  `const [screens, setScreens] = useState<ScreenData[]>(DEFAULT_SCREENS);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.screens) setScreens(data.screens);
        if (data && data.pillNavItems) setPillNavItems(data.pillNavItems);
        // We could dispatch event or update context for cards if needed, but for now we'll just handle screens and nav here.
        setConfigLoaded(true);
      })
      .catch(err => {
        console.error("Failed to load config from server", err);
        setConfigLoaded(true);
      });
  }, []);`
);

app = app.replace(
  /const \[pillNavItems, setPillNavItems\] = useState<PillNavItem\[\]>\(\(\) => \{[\s\S]*?return \[\n\s*\{\s*label: "[^"]*",\s*href: "#screen-1"\s*\}.*?\];\n  \}\);/s,
  `const [pillNavItems, setPillNavItems] = useState<PillNavItem[]>([
    {
      "label": "首页",
      "href": "#screen-1"
    }
  ]);`
);

app = app.replace(
  /return \(\n    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none flex flex-col font-sans">/,
  `return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none flex flex-col font-sans">
      {!configLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}`
);

fs.writeFileSync('App.tsx', app);
console.log("Patched App.tsx for config loading.");
