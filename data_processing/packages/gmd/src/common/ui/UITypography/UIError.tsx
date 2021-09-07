import Typography from '@material-ui/core/Typography'
import React from 'react'
import {UITypographyProps} from './ports/UITypographyProps'

export function UIError(props: UITypographyProps) {
  return (
    <Typography variant="body2" gutterBottom color="error">
      {props.children}
    </Typography>
  )
}
