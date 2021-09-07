import Typography from '@material-ui/core/Typography'
import React from 'react'
import {UITypographyProps} from './ports/UITypographyProps'

export function UIText(props: UITypographyProps) {
  return (
    <Typography variant="body1" gutterBottom>
      {props.children}
    </Typography>
  )
}
