import React from 'react'
import type {AppProps} from 'next/app'
import {ReactQueryDevtools} from 'react-query/devtools'
import {azureGMDFrontend} from '@engaging-enterprises/gmd/src/azureGMDFrontend'

function MyApp({Component, pageProps}: AppProps) {
  return (
    <azureGMDFrontend.App>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </azureGMDFrontend.App>
  )
}

export default MyApp
