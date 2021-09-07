import {cameraCompare} from './cameraCompare'
import {Camera} from '../getCameras'

describe('cameraCompare', function() {
  function test(betterCamera: Camera, worseCamera: Camera) {
    it(`Should swap ${JSON.stringify(betterCamera)} ${JSON.stringify(
      worseCamera,
    )}`, function() {
      expect(cameraCompare(worseCamera, betterCamera)).toBeLessThanOrEqual(-1)
    })

    it(`Should not swap ${JSON.stringify(betterCamera)} ${JSON.stringify(
      worseCamera,
    )}`, function() {
      expect(cameraCompare(betterCamera, worseCamera)).toBeGreaterThanOrEqual(1)
    })

    it(`Should be equal ${JSON.stringify(betterCamera)}`, function() {
      expect(cameraCompare(betterCamera, betterCamera)).toStrictEqual(0)
    })

    it(`Should be equal ${JSON.stringify(worseCamera)}`, function() {
      expect(cameraCompare(worseCamera, worseCamera)).toStrictEqual(0)
    })
  }

  describe('Should prefer environment direction', function() {
    test(
      {
        deviceId: 'device1',
        facingMode: ['left', 'environment'],
        focusMode: undefined,
        maxWidth: 10,
        maxHeight: 10,
      },
      {
        deviceId: 'device2',
        facingMode: ['left', 'user'],
        focusMode: ['continuous'],
        maxWidth: 1000,
        maxHeight: 1000,
      },
    )

    test(
      {
        deviceId: 'device1',
        facingMode: ['environment'],
        focusMode: undefined,
        maxWidth: 10,
        maxHeight: 10,
      },
      {
        deviceId: 'device2',
        facingMode: ['left', 'user', 'right'],
        focusMode: ['continuous'],
        maxWidth: 1000,
        maxHeight: 1000,
      },
    )

    test(
      {
        deviceId: 'device1',
        facingMode: ['environment'],
        focusMode: undefined,
        maxWidth: 10,
        maxHeight: 10,
      },
      {
        deviceId: 'device2',
        facingMode: undefined,
        focusMode: ['continuous'],
        maxWidth: 1000,
        maxHeight: 1000,
      },
    )
  })

  describe('Should prefer auto focus', function() {
    test(
      {
        deviceId: 'device1',
        facingMode: ['environment'],
        focusMode: ['continuous'],
        maxWidth: 10,
        maxHeight: 10,
      },
      {
        deviceId: 'device2',
        facingMode: ['environment'],
        focusMode: undefined,
        maxWidth: 100,
        maxHeight: 100,
      },
    )

    test(
      {
        deviceId: 'device1',
        facingMode: ['environment'],
        focusMode: ['continuous'],
        maxWidth: 10,
        maxHeight: 10,
      },
      {
        deviceId: 'device2',
        facingMode: ['environment'],
        focusMode: ['single-shot', 'manual', 'none'],
        maxWidth: 100,
        maxHeight: 100,
      },
    )

    test(
      {
        deviceId: 'device1',
        facingMode: ['environment'],
        focusMode: ['single-shot'],
        maxWidth: 10,
        maxHeight: 10,
      },
      {
        deviceId: 'device2',
        facingMode: ['environment'],
        focusMode: ['manual', 'none'],
        maxWidth: 100,
        maxHeight: 100,
      },
    )

    test(
      {
        deviceId: 'device1',
        facingMode: ['environment'],
        focusMode: ['manual'],
        maxWidth: 10,
        maxHeight: 10,
      },
      {
        deviceId: 'device2',
        facingMode: ['environment'],
        focusMode: ['none'],
        maxWidth: 100,
        maxHeight: 100,
      },
    )

    test(
      {
        deviceId: 'device1',
        facingMode: ['environment'],
        focusMode: ['none'],
        maxWidth: 10,
        maxHeight: 10,
      },
      {
        deviceId: 'device2',
        facingMode: ['environment'],
        focusMode: undefined,
        maxWidth: 100,
        maxHeight: 100,
      },
    )
  })

  describe('Should prefer better resolution', function() {
    test(
      {
        deviceId: 'device1',
        facingMode: ['left', 'user'],
        focusMode: ['continuous'],
        maxWidth: 1000,
        maxHeight: 1000,
      },
      {
        deviceId: 'device2',
        facingMode: ['left', 'user'],
        focusMode: ['continuous'],
        maxWidth: 100,
        maxHeight: 1000,
      },
    )

    test(
      {
        deviceId: 'device1',
        facingMode: ['left', 'user'],
        focusMode: ['continuous'],
        maxWidth: 1000,
        maxHeight: 1000,
      },
      {
        deviceId: 'device2',
        facingMode: ['left', 'user'],
        focusMode: ['continuous'],
        maxWidth: 1000,
        maxHeight: 100,
      },
    )

    test(
      {
        deviceId: 'device1',
        facingMode: ['left', 'user'],
        focusMode: ['continuous'],
        maxWidth: 10,
        maxHeight: 10,
      },
      {
        deviceId: 'device2',
        facingMode: ['left', 'user'],
        focusMode: ['continuous'],
        maxWidth: undefined,
        maxHeight: undefined,
      },
    )
  })
})
