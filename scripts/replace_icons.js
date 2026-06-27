const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'appiconnew.png');
const RES = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Android mipmap sizes: [launcher size, foreground size]
const DENSITIES = [
  { folder: 'mipmap-mdpi',    launcher: 48,  foreground: 108 },
  { folder: 'mipmap-hdpi',    launcher: 72,  foreground: 162 },
  { folder: 'mipmap-xhdpi',   launcher: 96,  foreground: 216 },
  { folder: 'mipmap-xxhdpi',  launcher: 144, foreground: 324 },
  { folder: 'mipmap-xxxhdpi', launcher: 192, foreground: 432 },
];

async function replaceIcons() {
  for (const d of DENSITIES) {
    const dir = path.join(RES, d.folder);

    // Delete old webp files
    for (const name of ['ic_launcher.webp', 'ic_launcher_round.webp', 'ic_launcher_foreground.webp']) {
      const f = path.join(dir, name);
      if (fs.existsSync(f)) { fs.rmSync(f); console.log(`Deleted: ${f}`); }
    }

    // Write launcher (square)
    await sharp(SRC).resize(d.launcher, d.launcher).png().toFile(path.join(dir, 'ic_launcher.png'));
    console.log(`✅ ${d.folder}/ic_launcher.png (${d.launcher}x${d.launcher})`);

    // Write launcher_round (same image)
    await sharp(SRC).resize(d.launcher, d.launcher).png().toFile(path.join(dir, 'ic_launcher_round.png'));
    console.log(`✅ ${d.folder}/ic_launcher_round.png (${d.launcher}x${d.launcher})`);

    // Write foreground (larger, for adaptive icon)
    await sharp(SRC).resize(d.foreground, d.foreground).png().toFile(path.join(dir, 'ic_launcher_foreground.png'));
    console.log(`✅ ${d.folder}/ic_launcher_foreground.png (${d.foreground}x${d.foreground})`);
  }
  console.log('\n🎉 All icons replaced successfully!');
}

replaceIcons().catch(e => { console.error(e); process.exit(1); });
