import React from 'react'
import Paper from '@material-ui/core/Paper'
import {UIPaperProps} from './ports/UIPaperProps'

export function UIPaper(props: UIPaperProps) {
  return <Paper>{props.children}</Paper>
}
