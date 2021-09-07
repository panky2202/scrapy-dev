import React, {useContext} from 'react'
import {Analytics} from './ports/UseAnalytics'

export const analyticsContext = React.createContext<Analytics>({
  exceptionEvent: () => null,
  searchEvent: () => null,
  barcodeScanEvent: () => null,
})

export function useAnalytics(): Analytics {
  return useContext(analyticsContext)
}
