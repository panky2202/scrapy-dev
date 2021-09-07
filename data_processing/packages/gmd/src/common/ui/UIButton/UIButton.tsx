import {UIButtonProps} from './ports/UIButtonProps'
import Button from '@material-ui/core/Button'
import React from 'react'

export function UIButton({children, onClick, disabled}: UIButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="contained"
      color="primary">
      {children}
    </Button>
  )
}
