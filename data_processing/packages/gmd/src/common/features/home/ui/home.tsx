import React from 'react'
import {UIScreen} from '../../../ui/UIScreen'
import {UILink} from '../../../ui/UILink'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'

export function home() {
  return function Home() {
    return (
      <UIScreen title="GMD App">
        <List component="nav" aria-label="main mailbox folders">
          <ListItem>
            <UILink href="/products" title="Products" />
          </ListItem>
        </List>
      </UIScreen>
    )
  }
}
