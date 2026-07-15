const fs = require('fs');

let appCode = fs.readFileSync('App.tsx', 'utf-8');

// We need to import TopologyCanvas
if (!appCode.includes('TopologyCanvas')) {
  appCode = appCode.replace("import { CheckInCalendar } from './src/components/CheckInCalendar';", "import { CheckInCalendar } from './src/components/CheckInCalendar';\nimport TopologyCanvas from './components/TopologyCanvas';");
}

// We need to render TopologyCanvas for screen 8
const findGenericStart = "        {screens.map((s, idx) => {";

// Inside the map loop, before `return (<section ...` we can inject `if (s.id === 8) { return <section ...><TopologyCanvas isAdmin={false} isMobile={isMobile} /></section>; }`
const genericReturnStart = `          return (
            <section 
              key={s.id}`;

const customS8 = `          if (s.id === 8) {
            return (
              <section 
                key={s.id}
                id={\`screen-\${s.id}\`}
                className="snap-start snap-always relative w-full h-screen overflow-hidden flex items-center justify-center bg-transparent"
              >
                {/* 
                  To prevent the canvas drag/zoom from conflicting with scroll-snap,
                  we can handle touchAction appropriately, or rely on ReactFlow's panOnScroll/panOnDrag. 
                  Normally panOnDrag prevents parent scrolling. 
                */}
                <TopologyCanvas isAdmin={false} isMobile={isMobile} />
              </section>
            );
          }
          return (
            <section 
              key={s.id}`;

appCode = appCode.replace(genericReturnStart, customS8);

fs.writeFileSync('App.tsx', appCode);
console.log('App.tsx patched for Screen 8.');
