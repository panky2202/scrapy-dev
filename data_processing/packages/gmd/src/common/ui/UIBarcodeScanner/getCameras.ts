import {
  arraySchema,
  InferSchemaType,
  literalSchema,
  numberSchema,
  objectSchema,
  optional,
  stringSchema,
  unionSchema,
} from '../../domain/schema'

const FacingModeSchema = unionSchema([
  literalSchema('environment'),
  literalSchema('user'),
  literalSchema('left'),
  literalSchema('right'),
])

export type FacingMode = InferSchemaType<typeof FacingModeSchema>

const FocusModeSchema = unionSchema([
  literalSchema('none'),
  literalSchema('manual'),
  literalSchema('single-shot'),
  literalSchema('continuous'),
])

export type FocusMode = InferSchemaType<typeof FocusModeSchema>

export type Camera = InferSchemaType<typeof CameraSchema>
export const CameraSchema = objectSchema({
  deviceId: stringSchema,
  facingMode: optional(arraySchema(FacingModeSchema)),
  focusMode: optional(arraySchema(FocusModeSchema)),
  maxWidth: optional(numberSchema),
  maxHeight: optional(numberSchema),
})

async function enumerateVideoDevicesInCrossBrowserCompatibleWay(): Promise<
  MediaDeviceInfo[]
> {
  let devices: MediaDeviceInfo[]

  // @ts-ignore
  if (typeof navigator.enumerateDevices === 'function') {
    // @ts-ignore
    devices = await navigator.enumerateDevices()
  } else if (
    typeof navigator.mediaDevices === 'object' &&
    typeof navigator.mediaDevices.enumerateDevices === 'function'
  ) {
    devices = await navigator.mediaDevices.enumerateDevices()
  } else {
    // @ts-ignore
    if (window.MediaStreamTrack?.getSources == null) {
      throw new Error()
    }
    devices = await new Promise(resolve => {
      // @ts-ignore
      window.MediaStreamTrack?.getSources?.(resolve)
    })

    devices = devices
      .filter(device => {
        return (
          device.kind.toLowerCase() === 'video' ||
          device.kind.toLowerCase() === 'videoinput'
        )
      })
      .map(device => {
        return {
          deviceId: device.deviceId ?? '',
          groupId: device.groupId,
          kind: 'videoinput',
          label: device.label,
          toJSON: function(): MediaDeviceInfo {
            return this
          },
        }
      })
  }

  return devices.filter(device => {
    return device.kind === 'videoinput'
  })
}

async function accessCameraPermissions(): Promise<void> {
  const devices = await enumerateVideoDevicesInCrossBrowserCompatibleWay()
  if (devices.length > 0 && devices.every(device => device.label === '')) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      stream.getVideoTracks().forEach(track => {
        track.stop()
      })
    } catch {
      // Ignored
    }
  }
}

export async function getCameras(): Promise<Camera[]> {
  // Important: before enumerating/working with devices
  // we need to access camera permissions. Otherwise, the behavior will be unstable
  await accessCameraPermissions()

  const results: Camera[] = []
  const devices = await enumerateVideoDevicesInCrossBrowserCompatibleWay()

  for (const device of devices) {
    try {
      if (device.kind !== 'videoinput') {
        continue
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: device.deviceId,
        },
        audio: false,
      })

      stream.getVideoTracks().forEach(track => {
        try {
          const c = track.getCapabilities()
          results.push(
            CameraSchema({
              // @ts-ignore
              deviceId: c.deviceId,
              // @ts-ignore
              focusMode: c.focusMode,
              facingMode: c.facingMode,
              maxHeight: c.height?.max,
              maxWidth: c.width?.max,
            }),
          )
          track.stop()
        } catch {
          // Ignored
        }
      })
    } catch {
      // Ignored
    }
  }

  return results
}
