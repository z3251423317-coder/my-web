const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /<div className="animate-marquee-reverse flex gap-0 py-2 hover:\[animation-play-state:paused\]">/,
  '<div className={`${s.id === 7 ? \'animate-marquee-forward\' : \'animate-marquee-reverse\'} flex gap-0 py-2 hover:[animation-play-state:paused]`}>'
);

fs.writeFileSync('App.tsx', app);
console.log('patched marquee dir');
