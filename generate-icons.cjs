const sharp = require('/home/user/backend/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const svgLogo = `<svg width='512' height='512' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#0a0f1c'/><stop offset='100%' stop-color='#1f2937'/></linearGradient></defs><rect width='64' height='64' rx='16' fill='url(#g)'/><text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, sans-serif' font-weight='800' font-size='24' fill='white' letter-spacing='-0.02em'>F</text><circle cx='46' cy='18' r='6' fill='#10b981'/></svg>`;

async function gen(){
  const iconsDir = '/home/user/frontend/public/icons';
  fs.mkdirSync(iconsDir, {recursive:true});
  await sharp(Buffer.from(svgLogo)).resize(192,192).png().toFile(path.join(iconsDir,'icon-192.png'));
  console.log('192 ok');
  await sharp(Buffer.from(svgLogo)).resize(512,512).png().toFile(path.join(iconsDir,'icon-512.png'));
  console.log('512 ok');
  await sharp(Buffer.from(svgLogo)).resize(32,32).png().toFile('/home/user/frontend/public/favicon-32.png');
  console.log('32 ok');
  // Also generate 180 apple touch
  await sharp(Buffer.from(svgLogo)).resize(180,180).png().toFile(path.join(iconsDir,'apple-touch-icon.png'));
  console.log('180 ok');
}
gen().catch(e=>{console.error(e); process.exit(1);});
