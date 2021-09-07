import {UIButtonProps} from '../UIButton/ports/UIButtonProps'
import React from 'react'
import Button from '@material-ui/core/Button'

export function UICancelButton({onClick, disabled, children}: UIButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} variant="text">
      {children}
    </Button>
  )
}
