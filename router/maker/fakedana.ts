import type { VercelRequest, VercelResponse } from '@vercel/node'
import Jimp from 'jimp'
import axios from 'axios'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { nominal } = req.query

    if (!nominal) {
      return res.status(400).json({
        creator: "RanggaCode",
        status: false,
        message: "Masukkan parameter nominal\nContoh: ?nominal=1000000"
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

    // load image
    const bgUrl = 'https://raw.githubusercontent.com/uploader762/dat3/main/uploads/9c18e0-1772932032348.jpg'
    const logoUrl = 'https://raw.githubusercontent.com/uploader762/dat3/main/uploads/d0f081-1772929197100.png'

    const bgBuffer = (await axios.get(bgUrl, { responseType: 'arraybuffer' })).data
    const logoBuffer = (await axios.get(logoUrl, { responseType: 'arraybuffer' })).data

    const bg = await Jimp.read(bgBuffer)
    const logo = await Jimp.read(logoBuffer)

    // font bawaan jimp (pengganti DanaFont)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE)

    // print nominal
    const x = 664
    const y = 293

    bg.print(font, x, y, angka)

    // resize logo
    logo.resize(300, 300)

    // posisi logo (geser manual)
    bg.composite(logo, x + 500, y - 30)

    const buffer = await bg.getBufferAsync(Jimp.MIME_PNG)

    const tanggal = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    res.setHeader('Content-Type', 'image/png')
    res.status(200).send(buffer)

  } catch (e: any) {
    res.status(500).json({
      creator: "RanggaCode",
      status: false,
      message: e.message
    })
  }
  }
