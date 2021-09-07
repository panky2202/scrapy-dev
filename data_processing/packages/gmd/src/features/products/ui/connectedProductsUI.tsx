import React, {useCallback, useEffect, useState} from 'react'
import Router from 'next/router'
import {UIText} from '../../../common/ui/UITypography'
import {UIScreen} from '../../../common/ui/UIScreen'
import {UseProducts} from './ports/UseProducts'
import {UIAsyncDataTable} from '../../../common/ui/UIAsyncDataTable'
import {moneyToString} from '../../../common/ui/moneyToString'
import {UITextInput} from '../../../common/ui/UITextInput'
import {UISpacer} from '../../../common/ui/UISpacer'
import {UseUser} from '../../../common/features/user/ui/ports/UseUser'
import {UIBarcodeScanner} from '../../../common/ui/UIBarcodeScanner'
import {useAnalytics} from '../../../common/ui/Analytics'
import {UISnackBar} from '../../../common/ui/UISnackBar/UISnackBar'
import {UINotificationButton} from '../../../common/ui/useUIForm/UINotificationButton'
import {AsyncDataSource} from '../../../common/ui/AsyncDataSource'
import {
  ProductsQueryGQL,
  ProductsQueryVariablesGQL,
  UserQueryGQL,
  UserQueryVariablesGQL,
} from '../../../common/application/types'

function UIHelloUser(props: {
  user: AsyncDataSource<UserQueryVariablesGQL, UserQueryGQL['user']>
}) {
  const user = props.user
  const str = user.data?.email
    ? `Hello ${user.data?.email}, please, enter UPC`
    : ''
  return <UIText>{str}</UIText>
}

type ProductsUIDeps = {
  dataSource: AsyncDataSource<
    ProductsQueryVariablesGQL,
    ProductsQueryGQL['products']
  >
  typeBarcode: (barcode?: string) => any
  scanBarcode: (barcode?: string) => any
  barcodeScanEvent: (success: boolean, barcode?: string | undefined) => any
  success: boolean
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>
  barcode: string | undefined
  setBarcode: React.Dispatch<React.SetStateAction<string | undefined>>
  redirectMissingProduct: (barcode?: string | undefined) => Promise<void>
  user: AsyncDataSource<UserQueryVariablesGQL, UserQueryGQL['user']>
}

export function useProductsUI(deps: {
  useProducts: UseProducts
  useUser: UseUser
}): ProductsUIDeps {
  const {useProducts, useUser} = deps
  const dataSource = useProducts({})
  const user = useUser({})
  const {setVariables, data, variables, status} = dataSource
  const [currentScan, setCurrentScan] = useState<number>(0)
  const [lastScan, setLastScan] = useState<number>(0)
  const {barcodeScanEvent} = useAnalytics()
  const [success, setSuccess] = useState<boolean>(true)
  const [barcode, setBarcode] = useState<string | undefined>('')

  const redirectMissingProduct = useCallback(async (barcode?: string) => {
    await Router.push({
      pathname: '/missingProducts',
      query: {upc: barcode},
    })
  }, [])

  const onBarcodeResults = useCallback(
    async (success, barcode) => {
      setSuccess(success)
      setBarcode(barcode)
      barcodeScanEvent(success, barcode)
    },
    [barcodeScanEvent],
  )

  const typeBarcode = useCallback(
    (barcode?: string) => {
      setVariables({input: {upc: barcode ?? ''}})
      setCurrentScan((x) => x + 1)
    },
    [setVariables],
  )

  const scanBarcode = useCallback(
    (barcode?: string) => {
      barcode && typeBarcode(barcode)
    },
    [typeBarcode],
  )

  useEffect(() => {
    if (
      currentScan !== lastScan &&
      status !== 'loading' &&
      typeof data !== 'undefined'
    ) {
      setLastScan(currentScan)
      onBarcodeResults &&
        onBarcodeResults(data.length !== 0, variables.input?.upc)
    }
  }, [
    data,
    status,
    currentScan,
    lastScan,
    onBarcodeResults,
    variables.input?.upc,
  ])

  return {
    scanBarcode,
    typeBarcode,
    dataSource,
    barcodeScanEvent,
    success,
    setSuccess,
    barcode,
    setBarcode,
    redirectMissingProduct,
    user,
  }
}

export function ProductsUI(deps: ProductsUIDeps) {
  const {
    dataSource,
    typeBarcode,
    scanBarcode,
    success,
    setSuccess,
    barcode,
    redirectMissingProduct,
    user,
  } = deps

  const handleAlertClose = () => {
    setSuccess(true)
  }

  return (
    <UIScreen title="Products">
      <UIHelloUser user={user} />
      <UISpacer />
      <UITextInput
        id={'upc'}
        label={'UPC'}
        value={dataSource.variables.input?.upc ?? ''}
        onChange={({target: {value}}) => typeBarcode(value)}
      />
      <UISpacer />
      <UISnackBar severity={'error'} open={!success} onClose={handleAlertClose}>
        Scan Failed!
        <UINotificationButton
          id={'error_notification_button'}
          onClick={async () => await redirectMissingProduct(barcode)}>
          Add Missing Item
        </UINotificationButton>
      </UISnackBar>
      <UIBarcodeScanner onBarcode={scanBarcode} />
      <UIAsyncDataTable
        id={'data_table'}
        asyncData={dataSource}
        columns={[
          {
            accessor: (container) => container.description,
            header: {
              value: 'Description',
            },
            alignment: 'left',
            width: 'regular',
            type: 'text',
          },
          {
            accessor: (container) => container.image,
            header: {
              value: 'Image',
            },
            alignment: 'left',
            width: 'regular',
            type: 'image',
          },
          {
            accessor: (container) => moneyToString(container.price),
            header: {
              value: 'Price',
            },
            alignment: 'right',
            width: 'small',
            type: 'text',
          },
        ]}
      />
    </UIScreen>
  )
}

export function ConnectedProductsUI(deps: {
  useProducts: UseProducts
  useUser: UseUser
}) {
  return function ProductsComponent() {
    return <ProductsUI {...useProductsUI(deps)} />
  }
}
