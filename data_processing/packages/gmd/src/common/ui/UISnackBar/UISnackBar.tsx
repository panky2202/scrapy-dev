import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import {UISnackBarProps} from './ports/UISnackBarProps'
import MuiAlert from '@material-ui/lab/Alert'

export function UISnackBar({
  id,
  open,
  onClose,
  severity,
  children,
  autoCloseTime,
}: UISnackBarProps) {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoCloseTime}
      id={id}
      data-testid={id}>
      <MuiAlert
        elevation={6}
        severity={severity}
        variant="filled"
        onClose={onClose}>
        {children}
      </MuiAlert>
    </Snackbar>
  )
}
