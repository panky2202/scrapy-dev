import {UIButtonProps} from '../UIButton/ports/UIButtonProps'
import React from 'react'
import Button from '@material-ui/core/Button'

export function UISubmitButton({
  disabled,
  children,
}: Omit<UIButtonProps, 'onClick'>) {
  return (
    <Button
      disabled={disabled}
      type="submit"
      variant={'contained'}
      color={'primary'}>
      {children}
    </Button>
  )
}
