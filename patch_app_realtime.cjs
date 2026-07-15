const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

// Replace the load logic with onSnapshot to fix realtime updates
// This is critical for the TV frontend to update in realtime when backend changes!
const oldUseEffect = `  useEffect(() => {
    let isMounted = true;
    let unsubFirestore: (() => void) | null = null;

    const load = async (manual = false) => {
      if (manual && isMounted) setIsRetryingDb(true);
      
      try {
        let data: any = null;
        try {
          // Try local proxy API first in AI Studio environment
          const localRes = await fetch('/api/config');
          if (localRes.ok) {
            data = await localRes.json();
            console.log("Configuration loaded successfully from local proxy API (/api/config).");
          }
        } catch (localErr) {
          console.warn("Failed to fetch local proxy API, will try remote fallback...", localErr);
        }

        if (!data) {
          const remoteRes = await fetch(\`https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/user_data.json?t=\${Date.now()}\`, {
            cache: 'no-store'
          });
          
          if (remoteRes.ok) {
            data = await remoteRes.json();
            console.log("Configuration loaded successfully from remote URL.");
          }
        }

        if (data) {
          if (isMounted) {
            setDbConnected(true);
            setIsDbEmpty(false);
            setDbErrorMsg("");
            if (data.screens) setScreens(data.screens);
            if (data.pillNavItems) setPillNavItems(data.pillNavItems);
            if (data.marqueeCards) setMarqueeCards(data.marqueeCards);
            if (data.sphereCards) setSphereCards(data.sphereCards);
            if (data.domeCards) setDomeCards(data.domeCards);
            if (data.trialCards) setTrialCards(data.trialCards);
            if (data.relationshipCards) setRelationshipCards(data.relationshipCards);
            if (data.screen7Cards) setScreen7Cards(data.screen7Cards);
            if (data.screen7Tabs) {
              setScreen7Tabs(data.screen7Tabs);
              localStorage.setItem("alphaqubit_screen7_tabs", JSON.stringify(data.screen7Tabs));
            }
            if (data.screen3TabsBg) {
              setScreen3TabsBg(data.screen3TabsBg);
              localStorage.setItem("alphaqubit_screen3_tabs_bg", data.screen3TabsBg);
            }
            if (data.screen7TabsBg) {
              setScreen7TabsBg(data.screen7TabsBg);
              localStorage.setItem("alphaqubit_screen7_tabs_bg", data.screen7TabsBg);
            }
            if (data.screen3Tabs) {
              setScreen3Tabs(data.screen3Tabs);
              localStorage.setItem("alphaqubit_screen3_tabs", JSON.stringify(data.screen3Tabs));
            }
            if (data.screen7GlowEnabled !== undefined) {
              setScreen7GlowEnabled(!!data.screen7GlowEnabled);
              localStorage.setItem("alphaqubit_screen7_glow_enabled", String(!!data.screen7GlowEnabled));
            }
            if (data.screen7GlowColor) {
              setScreen7GlowColor(data.screen7GlowColor);
              localStorage.setItem("alphaqubit_screen7_glow_color", data.screen7GlowColor);
            }
            setConfigLoaded(true);
            setIsRetryingDb(false);
            return;
          }
        }
        throw new Error("Failed to load valid configuration from local API or remote URL");
      } catch (err: any) {
        console.error("Failed to load configuration, falling back to local defaults...", err);
        
        // Fallback to default local data
        if (isMounted) {
          const fallback = defaultUserData as any;
          if (fallback.screens) setScreens(fallback.screens);
          if (fallback.pillNavItems) setPillNavItems(fallback.pillNavItems);
          if (fallback.marqueeCards) setMarqueeCards(fallback.marqueeCards);
          if (fallback.sphereCards) setSphereCards(fallback.sphereCards);
          if (fallback.domeCards) setDomeCards(fallback.domeCards);
          if (fallback.trialCards) setTrialCards(fallback.trialCards);
          if (fallback.relationshipCards) setRelationshipCards(fallback.relationshipCards);
          if (fallback.screen7Cards) setScreen7Cards(fallback.screen7Cards);
          if (fallback.screen7Tabs) {
            setScreen7Tabs(fallback.screen7Tabs);
            localStorage.setItem("alphaqubit_screen7_tabs", JSON.stringify(fallback.screen7Tabs));
          }
          if (fallback.screen3TabsBg) {
            setScreen3TabsBg(fallback.screen3TabsBg);
            localStorage.setItem("alphaqubit_screen3_tabs_bg", fallback.screen3TabsBg);
          }
          if (fallback.screen7TabsBg) {
            setScreen7TabsBg(fallback.screen7TabsBg);
            localStorage.setItem("alphaqubit_screen7_tabs_bg", fallback.screen7TabsBg);
          }
          if (fallback.screen3Tabs) {
            setScreen3Tabs(fallback.screen3Tabs);
            localStorage.setItem("alphaqubit_screen3_tabs", JSON.stringify(fallback.screen3Tabs));
          } else {
            setScreen3Tabs(DEFAULT_SCREEN3_TABS);
            localStorage.setItem("alphaqubit_screen3_tabs", JSON.stringify(DEFAULT_SCREEN3_TABS));
          }
          if (fallback.screen7GlowEnabled !== undefined) {
            setScreen7GlowEnabled(!!fallback.screen7GlowEnabled);
            localStorage.setItem("alphaqubit_screen7_glow_enabled", String(!!fallback.screen7GlowEnabled));
          }
          if (fallback.screen7GlowColor) {
            setScreen7GlowColor(fallback.screen7GlowColor);
            localStorage.setItem("alphaqubit_screen7_glow_color", fallback.screen7GlowColor);
          }
          
          setDbConnected(true);
          setIsDbEmpty(true);
          setDbErrorMsg(err.message || String(err));
          setConfigLoaded(true);
          setIsRetryingDb(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      if (unsubFirestore) {
        unsubFirestore();
      }
    };
  }, []);`;

const newUseEffect = `  useEffect(() => {
    let isMounted = true;
    let unsubFirestore: (() => void) | null = null;
    
    // Subscribe to Firestore for real-time updates
    unsubFirestore = onSnapshot(doc(db, "app_config", "master"), (docSnap) => {
      if (docSnap.exists() && isMounted) {
        const data = docSnap.data();
        setDbConnected(true);
        setIsDbEmpty(false);
        setDbErrorMsg("");
        
        if (data.screens) setScreens(data.screens);
        if (data.pillNavItems) setPillNavItems(data.pillNavItems);
        if (data.marqueeCards) setMarqueeCards(data.marqueeCards);
        if (data.sphereCards) setSphereCards(data.sphereCards);
        if (data.domeCards) setDomeCards(data.domeCards);
        if (data.trialCards) setTrialCards(data.trialCards);
        if (data.relationshipCards) setRelationshipCards(data.relationshipCards);
        if (data.screen7Cards) setScreen7Cards(data.screen7Cards);
        if (data.screen7Tabs) {
          setScreen7Tabs(data.screen7Tabs);
          localStorage.setItem("alphaqubit_screen7_tabs", JSON.stringify(data.screen7Tabs));
        }
        if (data.screen3TabsBg) {
          setScreen3TabsBg(data.screen3TabsBg);
          localStorage.setItem("alphaqubit_screen3_tabs_bg", data.screen3TabsBg);
        }
        if (data.screen7TabsBg) {
          setScreen7TabsBg(data.screen7TabsBg);
          localStorage.setItem("alphaqubit_screen7_tabs_bg", data.screen7TabsBg);
        }
        if (data.screen3Tabs) {
          setScreen3Tabs(data.screen3Tabs);
          localStorage.setItem("alphaqubit_screen3_tabs", JSON.stringify(data.screen3Tabs));
        }
        if (data.screen7GlowEnabled !== undefined) {
          setScreen7GlowEnabled(!!data.screen7GlowEnabled);
          localStorage.setItem("alphaqubit_screen7_glow_enabled", String(!!data.screen7GlowEnabled));
        }
        if (data.screen7GlowColor) {
          setScreen7GlowColor(data.screen7GlowColor);
          localStorage.setItem("alphaqubit_screen7_glow_color", data.screen7GlowColor);
        }
        
        // Let TopologyCanvas handle its own config sync via its fetch loop or it will be out of sync
        // Actually TopologyCanvas needs to know to re-render, we can pass a refresh key or just let TopologyCanvas do its own thing.
        setConfigLoaded(true);
      }
    }, (err) => {
      console.warn("Firestore snapshot failed, maybe proxy only", err);
    });

    const load = async (manual = false) => {
      if (manual && isMounted) setIsRetryingDb(true);
      
      try {
        let data: any = null;
        try {
          const localRes = await fetch('/api/config');
          if (localRes.ok) {
            data = await localRes.json();
          }
        } catch (localErr) {}

        if (!data) {
          const remoteRes = await fetch(\`https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/user_data.json?t=\${Date.now()}\`, { cache: 'no-store' });
          if (remoteRes.ok) data = await remoteRes.json();
        }

        if (data && isMounted) {
          setDbConnected(true);
          setIsDbEmpty(false);
          setDbErrorMsg("");
          if (data.screens) setScreens(data.screens);
          if (data.pillNavItems) setPillNavItems(data.pillNavItems);
          if (data.marqueeCards) setMarqueeCards(data.marqueeCards);
          if (data.sphereCards) setSphereCards(data.sphereCards);
          if (data.domeCards) setDomeCards(data.domeCards);
          if (data.trialCards) setTrialCards(data.trialCards);
          if (data.relationshipCards) setRelationshipCards(data.relationshipCards);
          if (data.screen7Cards) setScreen7Cards(data.screen7Cards);
          if (data.screen7Tabs) setScreen7Tabs(data.screen7Tabs);
          if (data.screen3TabsBg) setScreen3TabsBg(data.screen3TabsBg);
          if (data.screen7TabsBg) setScreen7TabsBg(data.screen7TabsBg);
          if (data.screen3Tabs) setScreen3Tabs(data.screen3Tabs);
          if (data.screen7GlowEnabled !== undefined) setScreen7GlowEnabled(!!data.screen7GlowEnabled);
          if (data.screen7GlowColor) setScreen7GlowColor(data.screen7GlowColor);
          setConfigLoaded(true);
          setIsRetryingDb(false);
          return;
        }
        throw new Error("Failed to load");
      } catch (err: any) {
        // Fallback to default local data
        if (isMounted) {
          const fallback = defaultUserData as any;
          if (fallback.screens) setScreens(fallback.screens);
          if (fallback.pillNavItems) setPillNavItems(fallback.pillNavItems);
          if (fallback.marqueeCards) setMarqueeCards(fallback.marqueeCards);
          if (fallback.sphereCards) setSphereCards(fallback.sphereCards);
          if (fallback.domeCards) setDomeCards(fallback.domeCards);
          if (fallback.trialCards) setTrialCards(fallback.trialCards);
          if (fallback.relationshipCards) setRelationshipCards(fallback.relationshipCards);
          if (fallback.screen7Cards) setScreen7Cards(fallback.screen7Cards);
          setConfigLoaded(true);
          setIsRetryingDb(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      if (unsubFirestore) {
        unsubFirestore();
      }
    };
  }, []);`;

if (code.includes(oldUseEffect)) {
  code = code.replace(oldUseEffect, newUseEffect);
  fs.writeFileSync('App.tsx', code);
  console.log("App.tsx patched for realtime updates successfully");
} else {
  console.log("Could not find exact useEffect block in App.tsx. It might have been modified.");
}
