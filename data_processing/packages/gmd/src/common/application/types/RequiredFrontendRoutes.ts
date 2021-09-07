import React from 'react'
import {AppProps} from '../../ui/App'

export type RequiredFrontendRoutesNames = 'products' | 'home' | 'missingProducts'
export type RequiredFrontendRoutes = {
  App: React.FC<AppProps>
  routes: Record<RequiredFrontendRoutesNames, any>
}
