import { createWriteStream } from 'fs'
import { deflateSync } from 'zlib'

/**
 * Minimal PNG encoder in pure Node.js — no native deps needed.
 * Generates a MoneyFlow-branded icon (gradient + M lettermark).
 */
function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (const b of buf) {
    crc ^= b
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const typeB = Buffer.from(type, 'ascii')
  const len   = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const crc   = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeB, data])))
  return Buffer.concat([len, typeB, data, crc])
}

function makePNG(size) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8]=8; ihdr[9]=2 // 8-bit RGB

  // Build pixel data (RGBA stored as RGB rows with filter byte)
  const rowBytes = 1 + size * 3
  const raw = Buffer.alloc(rowBytes * size, 0)

  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0 // filter None
    const t = y / (size - 1) // 0..1 top→bottom

    for (let x = 0; x < size; x++) {
      const s = x / (size - 1)
      const pi = y * rowBytes + 1 + x * 3

      // Background: rounded square — dark navy outside, gradient inside
      const cx = x - size / 2, cy = y - size / 2
      const r  = Math.sqrt(cx * cx + cy * cy)
      const inCircle = r < size * 0.45

      const cornerR = size * 0.22 // rounded corner radius
      const ax = Math.abs(cx), ay = Math.abs(cy)
      const limit = size / 2 - cornerR
      let inside = false
      if (ax <= limit || ay <= limit) {
        inside = true
      } else {
        const dx = ax - limit, dy = ay - limit
        inside = Math.sqrt(dx * dx + dy * dy) <= cornerR
      }

      if (!inside) {
        // Transparent-ish background (use bg color)
        raw[pi]   = 8
        raw[pi+1] = 12
        raw[pi+2] = 20
        continue
      }

      // Gradient: teal→purple
      const gr = Math.round(0   + (107 - 0)   * s + (0   - 0)   * t)
      const gg = Math.round(229 + (115 - 229) * s + (0   - 0)   * t)
      const gb = Math.round(195 + (255 - 195) * s + (180 - 195) * t)

      // Draw "M" lettermark
      const lx = (x - size * 0.22) / (size * 0.56)   // 0..1 within letter area
      const ly = (y - size * 0.24) / (size * 0.52)   // 0..1

      let onM = false
      const thick = 0.13
      if (lx >= 0 && lx <= 1 && ly >= 0 && ly <= 1) {
        // Left vertical stroke
        if (lx < thick) onM = true
        // Right vertical stroke
        else if (lx > 1 - thick) onM = true
        // Left diagonal
        else if (ly < 0.55 && lx < 0.5 + thick && lx > (ly * 0.38) - thick * 0.5 && lx < (ly * 0.38) + thick) onM = true
        // Right diagonal
        else if (ly < 0.55 && lx > 0.5 - thick && lx < (1 - ly * 0.38) + thick * 0.5 && lx > (1 - ly * 0.38) - thick) onM = true
      }

      if (onM) {
        raw[pi] = 255; raw[pi+1] = 255; raw[pi+2] = 255
      } else {
        raw[pi] = Math.max(0, Math.min(255, gr))
        raw[pi+1] = Math.max(0, Math.min(255, gg))
        raw[pi+2] = Math.max(0, Math.min(255, gb))
      }
    }
  }

  const idat = deflateSync(raw, { level: 6 })

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const sizes = [
  { size: 192, path: './public/icons/icon-192.png' },
  { size: 512, path: './public/icons/icon-512.png' },
  { size: 32,  path: './public/favicon.png' },
]

for (const { size, path } of sizes) {
  const buf = makePNG(size)
  const ws  = createWriteStream(path)
  ws.write(buf)
  ws.end()
  console.log(`✓ Created ${path} (${size}×${size})`)
}
