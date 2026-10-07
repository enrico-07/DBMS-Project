import fs from 'node:fs';
import zlib from 'node:zlib';

function createPng(width, height, getPixel) {
  // RGBA buffer with filter byte at start of each scanline
  const raw = Buffer.alloc(height * (1 + width * 4));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      raw[pos++] = r;
      raw[pos++] = g;
      raw[pos++] = b;
      raw[pos++] = a;
    }
  }

  const compressed = zlib.deflateSync(raw);

  // PNG Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Basic CRC32
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        let bit = (crc ^ byte) & 1;
        crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
        byte >>>= 1;
      }
    }
    return (crc ^ -1) >>> 0;
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Draw RecipeVault icon: warm cream base, terracotta chef hat
const size = 32;
const pngBuf = createPng(size, size, (x, y) => {
  // rounded rectangle background
  const rCorner = 7;
  const inBg = (x >= 1 && x <= 30 && y >= 1 && y <= 30);
  const cx = x < 16 ? x - 7 : x - 24;
  const cy = y < 16 ? y - 7 : y - 24;
  const inCorner = (x < 7 || x > 24) && (y < 7 || y > 24);
  const dist = Math.sqrt(cx * cx + cy * cy);
  if (inCorner && dist > 7) return [0, 0, 0, 0];

  // Base background: Ivory Cream #FAF6F0
  if (x === 1 || x === 30 || y === 1 || y === 30) return [233, 223, 210, 255]; // Linen border

  // Inside rounded badge #EBF1EA (Sage soft)
  const inInner = x >= 4 && x <= 27 && y >= 4 && y <= 27;

  // Chef Hat in Terracotta #C4633F (rgb: 196, 99, 63)
  // Base of hat
  const inHatBase = (x >= 10 && x <= 21 && y >= 20 && y <= 23);
  // Puffs of hat
  const dCenter = Math.hypot(x - 16, y - 13);
  const dLeft = Math.hypot(x - 11, y - 15);
  const dRight = Math.hypot(x - 21, y - 15);
  const inHatPuffs = dCenter <= 5 || dLeft <= 4.2 || dRight <= 4.2;

  if (inHatBase || inHatPuffs) {
    return [196, 99, 63, 255]; // Terracotta
  }

  if (inInner) {
    return [235, 241, 234, 255]; // Soft sage
  }

  return [250, 246, 240, 255]; // Warm cream
});

fs.writeFileSync('public/favicon.png', pngBuf);

// Wrap PNG inside ICO container
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // ICO type
icoHeader.writeUInt16LE(1, 4); // 1 image

const icoDir = Buffer.alloc(16);
icoDir[0] = 32; // width
icoDir[1] = 32; // height
icoDir[2] = 0;  // colors
icoDir[3] = 0;  // reserved
icoDir.writeUInt16LE(1, 4);  // color planes
icoDir.writeUInt16LE(32, 6); // bpp
icoDir.writeUInt32LE(pngBuf.length, 8); // size
icoDir.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

const icoBuf = Buffer.concat([icoHeader, icoDir, pngBuf]);
fs.writeFileSync('public/favicon.ico', icoBuf);

console.log('Generated RecipeVault favicon.png and favicon.ico successfully!');
