import Typography from '@material-ui/core/Typography'
import React from 'react'
import {UITypographyProps} from './ports/UITypographyProps'

export function UIHeadline(props: UITypographyProps) {
  return (
    <Typography variant="h3" component="h1" gutterBottom>
      {props.children}
    </Typography>
  )
}
