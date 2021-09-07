import {useEffect} from 'react'
import {getDefaultScanner, scanImageData} from 'zbar.wasm'
import {ZBarConfigType, ZBarSymbolType} from 'zbar.wasm/dist/enum'

export function useReadBarcodeZbarWasm() {
  useEffect(() => {
    getDefaultScanner().then(scanner => {
      scanner.setConfig(
        ZBarSymbolType.ZBAR_UPCA,
        ZBarConfigType.ZBAR_CFG_ENABLE,
        1,
      )
      scanner.setConfig(
        ZBarSymbolType.ZBAR_UPCE,
        ZBarConfigType.ZBAR_CFG_ENABLE,
        1,
      )
      scanner.setConfig(
        ZBarSymbolType.ZBAR_EAN13,
        ZBarConfigType.ZBAR_CFG_ENABLE,
        1,
      )
      scanner.setConfig(
        ZBarSymbolType.ZBAR_EAN8,
        ZBarConfigType.ZBAR_CFG_ENABLE,
        1,
      )
    })
  }, [])

  return {
    readBarcode: readBarcodeZbarWasm,
  }
}

async function readBarcodeZbarWasm(): Promise<string | undefined> {
  const canvas = document.createElement('canvas')
  const video = document.querySelector('video')

  if (!canvas || !video || !video.videoWidth || !video.videoHeight) {
    return
  }

  const SCAN_WIDTH = 0.4
  const SCAN_HEIGHT = 0.2
  const SCAN_DX = 0.5 - SCAN_WIDTH / 2.0
  const SCAN_DY = 0.5 - SCAN_HEIGHT / 2.0

  canvas.width = SCAN_WIDTH * video.videoWidth
  canvas.height = SCAN_HEIGHT * video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  ctx.drawImage(
    video,
    SCAN_DX * video.videoWidth,
    SCAN_DY * video.videoHeight,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  const res = await scanImageData(
    ctx.getImageData(0, 0, canvas.width, canvas.height),
  )
  if (!res || res.length === 0) {
    return
  }

  return res[0].decode()
}
