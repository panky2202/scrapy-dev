import React from 'react'

export type UISnackBarProps = {
  open: boolean
  onClose: () => any
  children?: React.ReactNode
  severity: 'error' | 'info' | 'success'
  autoCloseTime?: number
  id?: string
}
