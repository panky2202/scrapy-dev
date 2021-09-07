import {Camera, FacingMode, FocusMode} from '../getCameras'

const FACING_MODE_COMPARE: Record<FacingMode, number> = {
  environment: 3,
  user: 2,
  left: 1,
  right: 0,
}

const FOCUS_MODE_COMPARE: Record<FocusMode, number> = {
  continuous: 3,
  'single-shot': 2,
  manual: 1,
  none: 0,
}

function compareArraysWith<T>(f: (x: T) => number, a?: T[], b?: T[]): number {
  if (a === undefined && b === undefined) {
    return 0
  }

  if (a === undefined) {
    return -1
  }

  if (b === undefined) {
    return 1
  }

  return Math.max(...a.map(f)) - Math.max(...b.map(f))
}

function compareNumbers(a?: number, b?: number): number {
  if (a === undefined && b === undefined) {
    return 0
  }

  if (a === undefined) {
    return -1
  }

  if (b === undefined) {
    return 1
  }

  return a - b
}

function getPixelCount(x: Camera): number | undefined {
  if (!x.maxWidth || !x.maxHeight) {
    return undefined
  }
  return x.maxWidth * x.maxHeight
}

export function cameraCompare(a: Camera, b: Camera): number {
  const facingMode = compareArraysWith(
    x => FACING_MODE_COMPARE[x],
    a.facingMode,
    b.facingMode,
  )
  if (facingMode !== 0) {
    return facingMode
  }

  const focusMode = compareArraysWith(
    x => FOCUS_MODE_COMPARE[x],
    a.focusMode,
    b.focusMode,
  )
  if (focusMode !== 0) {
    return focusMode
  }

  return compareNumbers(getPixelCount(a), getPixelCount(b))
}
