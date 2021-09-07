import React, {useEffect} from 'react'
import {readFileSync} from 'fs'

type LogoutProps = {
  logoutUrl: string
}

export default function Logout(props: LogoutProps) {
  useEffect(() => {
    // @ts-ignore
    window.location.assign(props.logoutUrl)
  })
  return <h1>Redirecting...</h1>
}

export async function getStaticProps(): Promise<{props: LogoutProps}> {
  const json = JSON.parse(readFileSync('../gmd-backend/auth.json', 'utf8'))
  const clientId =
    json.identityProviders.openIdConnectProviders.iprocessor.registration
      .clientId
  const domain = json.identityProviders.openIdConnectProviders.iprocessor.registration.openIdConnectConfiguration.wellKnownOpenIdConfiguration.split(
    '/',
  )[2]
  return {
    props: {
      logoutUrl: `https://${domain}/v2/logout?client_id=${clientId}`,
    },
  }
}
