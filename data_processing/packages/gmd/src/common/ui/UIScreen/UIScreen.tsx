import AppBar from '@material-ui/core/AppBar'
import CssBaseline from '@material-ui/core/CssBaseline'
import NoSsr from '@material-ui/core/NoSsr'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import {createStyles, makeStyles} from '@material-ui/core/styles'
import React from 'react'
import {UIScreenProps} from './ports/UIScreenProps'
import Head from 'next/head'
import {UISpacer} from '../UISpacer'
import Link from 'next/link'
import {version} from '../../../../package.json'

const useStyles = makeStyles(() =>
  createStyles({
    title: {
      flexGrow: 1,
    },
  }),
)

type UIAppBarProps = {
  title: string
}

const UIAppBar = (props: UIAppBarProps) => {
  const classes = useStyles()
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          {props.title}
        </Typography>
        <Link href="/logout" passHref>
          <Button color="inherit">Logout</Button>
        </Link>
      </Toolbar>
    </AppBar>
  )
}

export function UIScreen(props: UIScreenProps) {
  const title = `${props.title} v${version}`
  return (
    <NoSsr>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <main>
        <CssBaseline />
        <UIAppBar title={title} />
        <UISpacer />
        <Box maxWidth={600} alignSelf="center" m="auto" pl={1} pr={1}>
          {props.children}
        </Box>
        <UISpacer size={'huge'} />
      </main>
    </NoSsr>
  )
}
