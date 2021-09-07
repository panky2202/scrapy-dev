import React, {useCallback, useEffect} from 'react'
import Router from 'next/router'
import {UIHeadline, UIText} from '../../../common/ui/UITypography'
import {UIScreen} from '../../../common/ui/UIScreen'
import {UISpacer} from '../../../common/ui/UISpacer'
import {UITextInput} from '../../../common/ui/UITextInput'
import {UIForm, UISubmitButton, useUIForm} from '../../../common/ui/useUIForm'
import {UICameraInput} from '../../../common/ui/UICameraInput/UICameraInput'
import {UseAddMissingProduct} from './ports/UseAddMissingProduct'
import {UICircularProgress} from '../../../common/ui/UICircularProgress'
import {UseQuery} from './ports/UseQuery'
import {UICancelButton} from '../../../common/ui/useUIForm/UICancelButton'
import {UISnackBar} from '../../../common/ui/UISnackBar/UISnackBar'

const fileToDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

type MissingProductsForm = {
  upc: string
  comment: string
  photoFront: File[]
  photoBack: File[]
}

export type MissingProductsUIDeps = {
  register: any
  onSubmit: (e?: any) => Promise<void>
  onCancel: () => Promise<void>
  error: string | undefined
  isError: boolean
  isLoading: boolean
  isSuccess: boolean
}

const redirectToProducts = async () => {
  await Router.push({
    pathname: '/products',
  })
}

function useMissingProductUI(deps: {
  useAddMissingProduct: UseAddMissingProduct
  useQuery: UseQuery<MissingProductsForm>
}): MissingProductsUIDeps {
  const {register, handleSubmit, reset} = useUIForm<MissingProductsForm>()
  const {status, error, mutate, data} = deps.useAddMissingProduct()

  const onSubmit = useCallback(
    async (data: MissingProductsForm) =>
      mutate({
        input: {
          ...data,
          photoFront: await fileToDataURL(data.photoFront[0]),
          photoBack: await fileToDataURL(data.photoBack[0]),
        },
      }),
    [mutate],
  )

  useEffect(() => {
    const {upc} = Router.query
    const upcFromQuery = typeof upc === 'string' ? upc : upc && upc[0]
    reset({upc: upcFromQuery})
  }, [reset])

  useEffect(() => {
    if (data && data.addMissingProducts?.success) {
      reset()
      redirectToProducts()
    }
  }, [data, reset])

  return {
    register,
    onSubmit: handleSubmit(onSubmit),
    onCancel: redirectToProducts,
    error,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
  }
}

export function ConnectedMissingProductsUI(deps: {
  useAddMissingProduct: UseAddMissingProduct
  useQuery: UseQuery<any>
}) {
  return function MissingProductsComponent() {
    return <MissingProductsUI {...useMissingProductUI(deps)} />
  }
}

export function MissingProductsUI(deps: MissingProductsUIDeps) {
  const {register, onSubmit, onCancel, error, isError, isLoading, isSuccess} =
    deps

  return (
    <UIScreen title="Missing Product">
      <UIHeadline>Submit Missing Product</UIHeadline>
      <UIText>
        Please, enter a UPC and take photos of a product. A manager will use
        this information to find the product&apos;s price and update app&apos;s
        database.
      </UIText>
      <UISpacer size="big" />
      <UIForm onSubmit={onSubmit}>
        <UITextInput
          id={'upc'}
          label="UPC"
          disabled={isLoading}
          {...register('upc', {required: true})}
          required
        />
        <UISpacer />
        <UITextInput
          id={'comment'}
          label="Comment"
          disabled={isLoading}
          {...register('comment')}
        />
        <UISpacer />
        <UICameraInput
          id={'front_photo'}
          label="Front Photo"
          disabled={isLoading}
          {...register('photoFront', {required: true})}
          required
        />
        <UISpacer />
        <UICameraInput
          id={'back_photo'}
          label="Back Photo"
          disabled={isLoading}
          {...register('photoBack', {required: true})}
          required
        />
        <UISpacer size="big" />
        <UISubmitButton disabled={isLoading}>Submit</UISubmitButton>
        <UICancelButton disabled={isLoading} onClick={onCancel}>
          Cancel
        </UICancelButton>
        {isLoading && (
          <>
            <UISpacer />
            <UICircularProgress />
          </>
        )}
        <UISnackBar
          id={'success_notification'}
          open={isSuccess}
          onClose={onCancel}
          severity={'success'}
          autoCloseTime={1000}>
          Thank you!
        </UISnackBar>
        <UISnackBar
          id={'error_notification'}
          open={isError}
          onClose={onCancel}
          severity={'error'}>
          An error occurred: {error}
        </UISnackBar>
      </UIForm>
    </UIScreen>
  )
}
