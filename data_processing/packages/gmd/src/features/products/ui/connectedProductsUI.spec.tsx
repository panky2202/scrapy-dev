import React from 'react'
import {render, screen} from '@testing-library/react'
import {ProductsUI} from './connectedProductsUI'
import {AsyncDataSource} from '../../../common/ui/AsyncDataSource'
import userEvent from '@testing-library/user-event'

describe('Products', function () {
  const jsdomAlert = window.alert

  const setup = (data: any) => {
    const dataSource: AsyncDataSource<any, any> = {
      data: data,
      error: '',
      hasNext: false,
      status: 'success',
      fetchNext: jest.fn(),
      variables: '',
      setVariables: jest.fn(),
    }
    const user: AsyncDataSource<any, any> = {
      data: [],
      error: '',
      hasNext: false,
      status: 'success',
      fetchNext: jest.fn(),
      variables: '',
      setVariables: jest.fn(),
    }
    const typeBarcode = jest.fn()
    const scanBarcode = jest.fn()
    const barcodeScanEvent = jest.fn()
    const success = false
    const setSuccess = jest.fn()
    const barcode = ''
    const setBarcode = jest.fn()
    const redirectMissingProduct = jest.fn()

    render(
      <ProductsUI
        {...{
          dataSource,
          typeBarcode,
          scanBarcode,
          barcodeScanEvent,
          success,
          setSuccess,
          barcode,
          setBarcode,
          redirectMissingProduct,
          user,
        }}
      />,
    )

    return {
      dataSource,
      typeBarcode,
      scanBarcode,
      barcodeScanEvent,
      success,
      setSuccess,
      barcode,
      setBarcode,
      redirectMissingProduct,
      user,
    }
  }

  beforeEach(() => {
    window.alert = () => {}
  })

  afterEach(() => (window.alert = jsdomAlert))

  it('Should render Cell without errors', function () {
    setup([])
    userEvent.type(screen.getByTestId('upc'), '1234567892')
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('upc')).toBeInTheDocument()
    expect(screen.getByTestId('data_table')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('Should render text data', function () {
    const image = {
      url: 'https://www.gmd.com/image.jpg',
      backupUrl: 'https://www.gmd.com/backup.jpg',
    }
    setup([
      {
        description: 'Item1',
        price: '123',
        image,
      },
      {
        description: 'Item2',
        image: null,
        price: '456',
      },
      {
        description: 'Item3',
        image: null,
        price: '789',
      },
    ])
    expect(screen.getAllByRole('row')).toHaveLength(4)
    expect(screen.getAllByRole('img')[0]).toHaveProperty('src', image.url)
  })

  it('Should show error and redirect on click', function () {
    const {redirectMissingProduct} = setup([])
    expect(screen.getByRole('button', {name: /add missing item/i})).toBeInTheDocument()
    userEvent.click(screen.getByRole('button', {name: /add missing item/i}))
    expect(redirectMissingProduct).toBeCalledTimes(1)
  })
})
