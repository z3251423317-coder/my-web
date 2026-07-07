const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

const toReplace = `    };    setScreens(data.screens);
          if (data.pillNavItems) setPillNavItems(data.pillNavItems);
          if (data.marqueeCards) setMarqueeCards(data.marqueeCards);
          if (data.sphereCards) setSphereCards(data.sphereCards);
          if (data.domeCards) setDomeCards(data.domeCards);
          if (data.trialCards) setTrialCards(data.trialCards);
          if (data.relationshipCards) setRelationshipCards(data.relationshipCards);
        }
      } catch (err) {
        console.error("Failed to load config via proxy", err);
      } finally {
        if (isMounted) setConfigLoaded(true);
      }`;

app = app.replace(toReplace, `
    loadConfig();
    const interval = setInterval(loadConfig, 10000); // Poll every 10 seconds for updates
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
`);

// Try regex replace if exact match fails
if (app.indexOf("setScreens(data.screens);") !== -1 && app.indexOf("loadConfig();") === -1) {
  app = app.replace(/    \};\s*setScreens\(data\.screens\);[\s\S]*?if \(isMounted\) setConfigLoaded\(true\);\s*\}/, 
`    };
    loadConfig();
    const interval = setInterval(loadConfig, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);`);
}

fs.writeFileSync('App.tsx', app);
console.log("Fixed App.tsx duplicate block");
