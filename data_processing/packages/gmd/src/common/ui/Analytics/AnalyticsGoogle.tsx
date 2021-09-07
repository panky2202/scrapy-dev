import React, {useEffect, useMemo} from 'react'
import {analyticsContext} from './AnalyticsContext'
import {Analytics} from './ports/UseAnalytics'

declare global {
  interface Window {
    gtag: any
  }
}

type GTagEvent = {
  action: string
  config: Record<string, string | boolean>
}

const gtag = ({action, config}: GTagEvent) => {
  try {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      console.log('gtag', action, config)
      window.gtag('event', action, config)
    }
  } catch {
    return
  }
}

function sendExceptionEvent(description?: string) {
  gtag({
    action: 'exception',
    config: {
      description: description ?? '',
    },
  })
}

function sendSearchEvent(searchTerm?: string) {
  searchTerm &&
    gtag({
      action: 'search',
      config: {
        search_term: searchTerm,
      },
    })
}

function sendBarcodeScanEvent(success: boolean, barcode?: string) {
  gtag({
    action: success ? 'barcode_scan_success' : 'barcode_scan_error',
    config: {
      barcode: barcode ?? '',
    },
  })
}

function useExceptions(analytics: Analytics) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    function onError(event: ErrorEvent) {
      analytics.exceptionEvent(JSON.stringify(event.message))
      return true
    }

    window.addEventListener('error', onError)

    return () => {
      window.removeEventListener('error', onError)
    }
  }, [analytics])
}

function useConsoleError(analytics: Analytics) {
  useEffect(() => {
    const _error = console.error

    console.error = (...x: any[]) => {
      try {
        analytics.exceptionEvent(`${x}`)
        // eslint-disable-next-line no-empty
      } catch {}
      return _error(...x)
    }

    return () => {
      console.error = _error
    }
  }, [analytics])
}

export function AnalyticsGoogleProvider({
  children,
  trackingCode,
}: {
  children: React.ReactNode
  trackingCode?: string
}) {
  const analytics: Analytics = useMemo(
    () => ({
      exceptionEvent: sendExceptionEvent,
      searchEvent: sendSearchEvent,
      barcodeScanEvent: sendBarcodeScanEvent,
    }),
    [],
  )

  useExceptions(analytics)
  useConsoleError(analytics)

  if (!trackingCode) {
    return <>{children}</>
  }

  return (
    <analyticsContext.Provider value={analytics}>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingCode}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${trackingCode}');
        `,
        }}
      />
      {children}
    </analyticsContext.Provider>
  )
}
