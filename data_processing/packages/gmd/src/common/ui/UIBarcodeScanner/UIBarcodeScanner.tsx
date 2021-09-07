import {UIBarcodeScannerProps} from './ports/UIBarcodeScannerProps'
import React, {memo, useEffect, useState} from 'react'
import {interval} from 'rxjs'
import {
  bufferCount,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  tap,
} from 'rxjs/operators'
import beep from './assets/beep.mp3'
import {createStyles, makeStyles} from '@material-ui/core/styles'
import {useUISound} from '../useUISound'
import {UIHeadline} from '../UITypography'
import {useReadBarcodeZbarWasm} from './useReadBarcodeZbarWasm'
import {useVideoStream} from './useVideoStream'
import {
  BrowserCompatibility,
  getBrowserCompatibility,
} from './getBrowserCompatibility'
import {UICircularProgress} from '../UICircularProgress'

const useStyles = makeStyles(() =>
  createStyles({
    video_wrapper: {
      position: 'relative',
      width: '100%',
    },
    video: {
      objectFit: 'cover',
    },
    hidden: {
      display: 'none',
    },
    overlay: {
      position: 'absolute',
      backgroundColor: 'rgba(255,255,255,0.8)',
      width: '50%',
      marginLeft: '25%',
      marginRight: '25%',
      height: '2%',
      top: '50%',
      bottom: '50%',
    },
  }),
)

function UICamera({loading}: {loading: boolean}) {
  const classes = useStyles()
  return (
    <>
      {loading && (
        <>
          <UICircularProgress />
          <UIHeadline>Loading...</UIHeadline>
        </>
      )}
      <div className={classes.video_wrapper}>
        <video
          autoPlay
          playsInline
          controls={false}
          width="100%"
          height="150px"
          className={loading ? classes.hidden : classes.video}
        />
        <div className={classes.overlay} />
      </div>
      <canvas className={classes.hidden} />
    </>
  )
}

export function useBarcodeScanner({
  maxReadsPerSecond = 30,
  successReadsBeforeConfirmTheBarcode = 3,
  readBarcode,
  onBarcode,
  playBeep,
}: {
  maxReadsPerSecond?: number
  successReadsBeforeConfirmTheBarcode?: number
  readBarcode: () => Promise<string | undefined>
  onBarcode: (barcode?: string) => void
  playBeep: () => void
}) {
  function allEqual(arr: any[]) {
    return new Set(arr).size == 1
  }

  useEffect(() => {
    const sub = interval(1000 / maxReadsPerSecond)
      .pipe(
        concatMap(readBarcode),
        bufferCount(successReadsBeforeConfirmTheBarcode),
        filter(allEqual),
        map((x) => x[0]),
        distinctUntilChanged(),
        tap((barcode) => barcode && playBeep()),
      )
      .subscribe(onBarcode)
    return () => {
      sub.unsubscribe()
    }
  }, [
    readBarcode,
    maxReadsPerSecond,
    onBarcode,
    playBeep,
    successReadsBeforeConfirmTheBarcode,
  ])
}

function WrappedUIBarcodeScanner({onBarcode}: UIBarcodeScannerProps) {
  const {loading} = useVideoStream()
  const [playBeep] = useUISound({mp3: beep})
  const {readBarcode} = useReadBarcodeZbarWasm()

  useBarcodeScanner({
    onBarcode,
    readBarcode,
    playBeep,
  })

  return <UICamera loading={loading} />
}

export const UIBarcodeScanner = memo(function UIBarcodeScanner(
  props: UIBarcodeScannerProps,
) {
  const [browserCompatibility, setBrowserCompatibility] = useState<
    BrowserCompatibility | undefined
  >()

  useEffect(() => {
    const comps = getBrowserCompatibility()
    setBrowserCompatibility(comps)

    if (!comps.fullSupport) {
      alert(`
Your browser/device does not support the barcode scanner. Try to:
- update your system
- change browser (use Safari on iPhone and Chrome on Android)

If nothing helps, input barcodes manually.

${JSON.stringify(comps)}
`)
    }
  }, [])

  if (!browserCompatibility || !browserCompatibility.fullSupport) {
    return null
  }

  return <WrappedUIBarcodeScanner {...props} />
})
