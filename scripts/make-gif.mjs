import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const baseDir = 'B:/workgit/asocraft/docs/images';
const frames = [
  { file: 'asocraft_terminal.png', duration: 3.0 },
  { file: 'asocraft_audit.png', duration: 3.0 },
  { file: 'asocraft_dashboard.png', duration: 2.5 },
  { file: 'frame_de.png', duration: 2.5 },
  { file: 'frame_ja.png', duration: 2.5 },
  { file: 'asocraft_mobile.png', duration: 2.5 }
];

const tempDir = path.join(baseDir, 'temp_frames');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// 1. Normalize each image to exact 1200x750 canvas on #0b0f19 slate background
frames.forEach((f, idx) => {
  const src = path.join(baseDir, f.file);
  const dst = path.join(tempDir, `norm_${String(idx).padStart(2, '0')}.png`);
  // Scale down to fit inside 1200x750, pad remaining space with #0b0f19
  const normCmd = `ffmpeg -y -i "${src}" -vf "scale=1200:750:force_original_aspect_ratio=decrease,pad=1200:750:(ow-iw)/2:(oh-ih)/2:color=0x0b0f19" "${dst}"`;
  execSync(normCmd, { stdio: 'ignore' });
});

// 2. Build concat list
let concatTxt = '';
frames.forEach((f, idx) => {
  const normFile = path.join(tempDir, `norm_${String(idx).padStart(2, '0')}.png`).replace(/\\/g, '/');
  concatTxt += `file '${normFile}'\n`;
  concatTxt += `duration ${f.duration}\n`;
});
// Repeat last frame per ffmpeg concat demuxer spec
const lastNorm = path.join(tempDir, `norm_${String(frames.length - 1).padStart(2, '0')}.png`).replace(/\\/g, '/');
concatTxt += `file '${lastNorm}'\n`;

const inputPath = path.join(tempDir, 'input.txt');
fs.writeFileSync(inputPath, concatTxt);

// 3. Assemble GIF with high quality palettegen and paletteuse
const outGif = path.join(baseDir, 'asocraft_demo.gif');
const gifCmd = `ffmpeg -y -f concat -safe 0 -i "${inputPath}" -vf "fps=10,split[s0][s1];[s0]palettegen=max_colors=192:reserve_transparent=0[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" "${outGif}"`;

console.log('Generating high fidelity demo GIF...');
execSync(gifCmd, { stdio: 'inherit' });

// Cleanup temp files
fs.rmSync(tempDir, { recursive: true, force: true });

const stat = fs.statSync(outGif);
console.log(`Generated GIF size: ${(stat.size / 1024).toFixed(1)} KB`);
