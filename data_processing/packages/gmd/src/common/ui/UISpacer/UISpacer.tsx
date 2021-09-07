import React from 'react'
import {createStyles, makeStyles} from '@material-ui/core'
import {UISpacerProps} from './ports/UISpacerProps'

const useStyles = makeStyles((theme) =>
  createStyles({
    huge: {
      padding: theme.spacing(10),
    },
    big: {
      padding: theme.spacing(2),
    },
    normal: {
      padding: theme.spacing(1),
    },
    small: {
      padding: theme.spacing(0.5),
    },
  }),
)

export function UISpacer(props: UISpacerProps) {
  const classes = useStyles()
  return <div className={classes[props.size ?? 'normal']} />
}
