import type { VercelRequest, VercelResponse } from '@vercel/node'
import Jimp from 'jimp'

// 🔥 GANTI DENGAN BASE64 ASSET KAMU
const BG_BASE64 = "https://raw.githubusercontent.com/uploader762/dat3/main/uploads/9c18e0-1772932032348.jpg'"
const LOGO_BASE64 = "https://raw.githubusercontent.com/uploader762/dat3/main/uploads/d0f081-1772929197100.png'"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { nominal } = req.query

    // VALIDASI
    if (!nominal) {
      return res.status(400).json({
        creator: "RanggaCode",
        status: false,
        message: "Masukkan nominal\nContoh: ?nominal=1000000"
      })
    }

    let angkaRaw = String(nominal).replace(/[^0-9]/g, '')
    if (!angkaRaw) {
      return res.status(400).json({
        creator: "RanggaCode",
        status: false,
        message: "Nominal tidak valid"
      })
    }

    let angka = Number(angkaRaw).toLocaleString('id-ID')

    // === LOAD BASE64 IMAGE ===
    const bg = await Jimp.read(Buffer.from(BG_BASE64, 'base64'))
    const logo = await Jimp.read(Buffer.from(LOGO_BASE64, 'base64'))

    // === FONT (CDN FIX ENOENT) ===
    const font = await Jimp.loadFont(
      'https://raw.githubusercontent.com/oliver-moran/jimp/master/packages/plugin-print/fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt'
    )

    // === AUTO CENTER TEXT ===
    const textWidth = Jimp.measureText(font, angka)
    const x = (bg.bitmap.width - textWidth) / 2
    const y = 293

    bg.print(font, x, y, angka)

    // === LOGO POSITION (AUTO) ===
    logo.resize(300, 300)

    bg.composite(
      logo,
      x + textWidth + 20,
      y - 20
    )

    // === OUTPUT ===
    const buffer = await bg.getBufferAsync(Jimp.MIME_PNG)

    res.setHeader('Content-Type', 'image/png')
    return res.status(200).send(buffer)

  } catch (e: any) {
    return res.status(500).json({
      creator: "RanggaCode",
      status: false,
      message: e.message
    })
  }
}
