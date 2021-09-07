import {render, screen} from '@testing-library/react'
import {MissingProductsUI} from './connectedMissingProductsUI'
import React from 'react'
import userEvent from '@testing-library/user-event'

describe('MissingProduct', function () {
  const setup = (isError: boolean, isLoading: boolean, isSuccess: boolean) => {
    const register = jest.fn()
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    let error = ''

    const component = render(
      <MissingProductsUI
        {...{
          register,
          onSubmit,
          onCancel,
          error,
          isError,
          isLoading,
          isSuccess,
        }}
      />,
    )
    return {
      component,
      register,
      onSubmit,
      onCancel,
      error,
      isError,
      isLoading,
      isSuccess,
    }
  }

  it('Should render without errors', function () {
    const {component} = setup(false, false, false)
    expect(component).toBeDefined()
    expect(component.getByText('Submit Missing Product')).toBeDefined()
    expect(component.getByTestId('upc')).toBeDefined()
    expect(component.getByTestId('comment')).toBeDefined()
    expect(component.getByTestId('front_photo')).toBeDefined()
    expect(component.getByTestId('back_photo')).toBeDefined()
    expect(component.getByText('Submit')).toBeDefined()
    expect(component.getByText('Cancel')).toBeDefined()
  })

  it('Should submit form', async function () {
    const {onSubmit} = setup(false, false, false)
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })
    const submitButton = await screen.getByText('Submit')
    userEvent.click(submitButton)
    expect(onSubmit).toBeCalled()
  })

  it('Should cancel form', async function () {
    const {onCancel} = setup(false, false, false)
    const cancelButton = await screen.getByText('Cancel')
    userEvent.click(cancelButton)
    expect(onCancel).toBeCalled()
  })

  it('Should show error notification', function () {
    const {component} = setup(true, false, false)
    expect(component.getByTestId('error_notification')).toBeDefined()
  })

  it('Should show success notification', function () {
    const {component} = setup(false, false, true)
    expect(component.getByTestId('success_notification')).toBeDefined()
  })

  it('Should show loading state', function () {
    const {component} = setup(false, true, false)
    expect(component.getByTestId('progress')).toBeDefined()
  })
})
