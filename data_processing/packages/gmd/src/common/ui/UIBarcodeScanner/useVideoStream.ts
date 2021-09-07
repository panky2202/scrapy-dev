import {useEffect, useState} from 'react'
import {Camera, getCameras} from './getCameras'
import {cameraCompare} from './cameraCompare/cameraCompare'

const getSortedCameras = async () =>
  (await getCameras()).sort(cameraCompare).reverse()

function useCameras() {
  const [cameras, setCameras] = useState<Camera[] | undefined>(undefined)

  useEffect(() => {
    getSortedCameras()
      .then(setCameras)
      .catch(alert)
  }, [])

  return {
    cameras,
  }
}

async function getMediaStream(cameras: Camera[]) {
  console.log(`Found cameras: `, cameras)

  for (const camera of cameras) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: camera.deviceId,
          resizeMode: 'none',
          width: {ideal: 1920},
          height: {ideal: 1080},
          facingMode: {
            ideal: 'environment',
          },
        },
        audio: false,
      })

      console.log(`Using camera: `, camera)

      return stream
    } catch {
      // Ignored
    }
  }

  throw 'Could not initialize camera'
}

export function useVideoStream() {
  const {cameras} = useCameras()

  useEffect(() => {
    let stream: MediaStream | undefined
    if (!cameras) {
      return
    }

    getMediaStream(cameras).then(s => {
      stream = s
      const video = document.querySelector('video')
      if (video) {
        video.srcObject = stream
      }
    })

    return () => {
      stream?.getTracks().forEach(track => {
        track.stop()
      })
    }
  }, [cameras])

  return {
    loading: cameras === undefined,
  }
}
