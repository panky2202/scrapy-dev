import {useBarcodeScanner} from './UIBarcodeScanner'
import {sleep} from '@engaging-enterprises/basic-utils'
import {renderHook} from '@testing-library/react-hooks'

describe('UIBarcodeScanner', function() {
  it('Should distinct scan barcodes', async function() {
    const onBarcode = jest.fn()
    const playBeep = jest.fn()
    const readBarcode = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('1234')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('1230')
      .mockResolvedValueOnce('1230')
      .mockResolvedValueOnce('1230')
      .mockResolvedValue(undefined)

    renderHook(() =>
      useBarcodeScanner({
        readBarcode,
        playBeep,
        onBarcode,
        maxReadsPerSecond: 100,
        successReadsBeforeConfirmTheBarcode: 1,
      }),
    )

    for (let i = 0; i < 10; ++i) {
      await sleep(10)
    }

    expect(onBarcode).toBeCalledTimes(5)
    expect(playBeep).toBeCalledTimes(2)

    expect(onBarcode).toHaveBeenNthCalledWith(1, undefined)
    expect(onBarcode).toHaveBeenNthCalledWith(2, '1234')
    expect(onBarcode).toHaveBeenNthCalledWith(3, undefined)
    expect(onBarcode).toHaveBeenNthCalledWith(4, '1230')
    expect(onBarcode).toHaveBeenNthCalledWith(5, undefined)
  })

  it('Should tolerate inconsistent scans', async function() {
    const onBarcode = jest.fn()
    const playBeep = jest.fn()
    const readBarcode = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('error!')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('1230')
      .mockResolvedValueOnce('1230')
      .mockResolvedValueOnce('1230')
      .mockResolvedValueOnce('!!error!!')
      .mockResolvedValueOnce('1230')
      .mockResolvedValueOnce('1230')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('1230')
      .mockResolvedValue(undefined)

    renderHook(() =>
      useBarcodeScanner({
        readBarcode,
        playBeep,
        onBarcode,
        maxReadsPerSecond: 100,
        successReadsBeforeConfirmTheBarcode: 3,
      }),
    )

    for (let i = 0; i < 20; ++i) {
      await sleep(10)
    }

    expect(onBarcode).toBeCalledTimes(3)
    expect(onBarcode).toHaveBeenNthCalledWith(1, undefined)
    expect(onBarcode).toHaveBeenNthCalledWith(2, '1230')
    expect(onBarcode).toHaveBeenNthCalledWith(3, undefined)
  })
})
