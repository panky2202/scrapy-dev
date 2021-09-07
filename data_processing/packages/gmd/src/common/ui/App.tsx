import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'
import {AnalyticsGoogleProvider} from './Analytics'

const queryClient = new QueryClient()

export type AppProps = {children: React.ReactNode}

export function makeApp(deps: {trackingCode?: string}) {
  return function App(props: AppProps) {
    return (
      <AnalyticsGoogleProvider trackingCode={deps.trackingCode}>
        <QueryClientProvider client={queryClient}>
          {props.children}
        </QueryClientProvider>
      </AnalyticsGoogleProvider>
    )
  }
}
