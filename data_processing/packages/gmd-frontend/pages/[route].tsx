import React from 'react'
import {GetStaticPaths, GetStaticProps} from 'next'
import {azureGMDFrontend} from '@engaging-enterprises/gmd/src/azureGMDFrontend'
import {RequiredFrontendRoutesNames} from '@engaging-enterprises/gmd/src/common/application/types'

export default function Route({route}: {route: RequiredFrontendRoutesNames}) {
  const Component: () => React.ReactElement = azureGMDFrontend.routes[route]
  return <Component />
}

export const getStaticProps: GetStaticProps = async ({params}) => {
  return {
    props: {...params},
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(azureGMDFrontend.routes).map((route) => ({
    params: {route},
  }))

  return {
    paths,
    fallback: false,
  }
}
