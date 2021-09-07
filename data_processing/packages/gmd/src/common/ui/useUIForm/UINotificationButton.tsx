import {UIButtonProps} from '../UIButton/ports/UIButtonProps'
import React from 'react'
import {Button} from '@material-ui/core'

export function UINotificationButton({
  id,
  onClick,
  disabled,
  children,
}: UIButtonProps) {
  return (
    <Button
      id={id}
      data-testid={id}
      onClick={onClick}
      disabled={disabled}
      size="small"
      variant="contained"
      color="default"
      style={{marginLeft: 8}}>
      {children}
    </Button>
  )
}
