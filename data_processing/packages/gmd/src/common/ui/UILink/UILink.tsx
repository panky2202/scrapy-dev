import React from 'react'
import {UILinkProps} from './ports/UILinkProps'
import Link from 'next/link'

export function UILink(props: UILinkProps) {
  return (
    <Link href={props.href}>
      <a>{props.title}</a>
    </Link>
  )
}
