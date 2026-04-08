import type { VercelRequest, VercelResponse } from '@vercel/node'
import Jimp from 'jimp'
import axios from 'axios'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { name, duration, avatar } = req.query

    // === VALIDASI ===
    if (!name || !duration || !avatar) {
      return res.status(400).json({
        creator: "RanggaCode",
        status: false,
        message: "Parameter kurang!\nContoh: ?name=Alya&duration=13:46&avatar=https://..."
      })
    }

    const callName = String(name)
    const callDuration = String(duration)

    // === LOAD IMAGE ===
    const bgUrl = 'https://i.ibb.co/jknqK7nh/image.jpg'

    const [bgBuffer, avatarBuffer] = await Promise.all([
      axios.get(bgUrl, { responseType: 'arraybuffer' }),
      axios.get(String(avatar), { responseType: 'arraybuffer' })
    ])

    const bg = await Jimp.read(bgBuffer.data)
    const ava = await Jimp.read(avatarBuffer.data)

    // resize avatar
    ava.resize(409, 409)

    // crop jadi lingkaran (mask manual)
    const mask = await new Jimp(409, 409, 0x00000000)

    mask.scan(0, 0, 409, 409, function (x, y, idx) {
      const dx = x - 204.5
      const dy = y - 204.5
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist <= 204.5) {
        mask.bitmap.data[idx + 3] = 255
      } else {
        mask.bitmap.data[idx + 3] = 0
      }
    })

    ava.mask(mask, 0, 0)

    // === FONT (CDN biar aman Vercel) ===
    const fontName = await Jimp.loadFont('https://raw.githubusercontent.com/oliver-moran/jimp/master/packages/plugin-print/fonts/open-sans/open-sans-64-white/open-sans-64-white.fnt')
    const fontDur = await Jimp.loadFont('https://raw.githubusercontent.com/oliver-moran/jimp/master/packages/plugin-print/fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt')

    // === DRAW TEXT ===
    bg.print(
      fontName,
      0,
      127,
      {
        text: callName,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      1080
    )

    bg.print(
      fontDur,
      0,
      205,
      {
        text: callDuration,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      1080
    )

    // === TEMPel AVATAR ===
    const centerX = 540 - 409 / 2
    const centerY = 1201 - 409 / 2

    bg.composite(ava, centerX, centerY)

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
