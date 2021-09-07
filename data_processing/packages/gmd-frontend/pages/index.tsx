import React from 'react'
import {azureGMDFrontend} from '@engaging-enterprises/gmd/src/azureGMDFrontend'

export default function Home() {
  const Component: () => React.ReactElement = azureGMDFrontend.routes.home
  return <Component />
}
