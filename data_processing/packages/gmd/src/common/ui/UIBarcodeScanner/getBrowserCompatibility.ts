import UAParser from 'ua-parser-js'

type OS = {
  name?: string
  version?: string
}

type Browser = {
  name?: string
  version?: string
}

type CPU = {
  architecture?: string
}

type Device = {
  model?: string
  vendor?: string
  // tslint:disable-next-line:no-reserved-keywords
  type?: string
}

type Engine = {
  name?: string
  version?: string
}

/**
 * An object containing details about the support level of the used OS/browser combination regarding
 * the features needed by this library.
 */
export interface BrowserCompatibility {
  /**
   * Whether the full set of features required to have continuous camera video streaming are supported.
   */
  readonly fullSupport: boolean
  /**
   * Whether the set of features required to use a [[Scanner]] to perform scans (Single Image Mode) are supported.
   */
  readonly scannerSupport: boolean
  /**
   * The list of features that are missing.
   */
  readonly missingFeatures: Feature[]
}

/**
 * Browser feature.
 */
export enum Feature {
  /**
   * [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) -
   * [current support?](https://caniuse.com/#feat=blobbuilder)
   */
  BLOB = 'blob',
  /**
   * [MediaDevices/getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) -
   * [current support?](https://caniuse.com/#feat=stream)
   */
  MEDIA_DEVICES = 'mediaDevices',
  /**
   * [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) -
   * [current support?](https://caniuse.com/#feat=offscreencanvas)
   */
  OFFSCREEN_CANVAS = 'offscreenCanvas',
  // tslint:disable: max-line-length
  /**
   * [Http/Https protocol](https://wiki.developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web#Scheme_or_protocol)
   */
  HTTP_PROTOCOL = 'httpProtocol',
  /**
   * [Secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
   */
  SECURE_CONTEXT = 'secureContext',
  /**
   * [URL/createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) -
   * [current support?](https://caniuse.com/#feat=bloburls)
   */
  URL_OBJECT = 'urlObject',
  /**
   * [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) -
   * [current support?](https://caniuse.com/#feat=webworkers)
   */
  WEB_WORKERS = 'webWorkers',
  /**
   * [WebAssembly](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/WebAssembly) -
   * [current support?](https://caniuse.com/#feat=wasm)
   */
  WEB_ASSEMBLY = 'webAssembly',
  /**
   * WebAssembly without memory corruption (specific iOS version 11.2.2/11.2.5/11.2.6 bug)
   */
  WEB_ASSEMBLY_ERROR_FREE = 'webAssemblyErrorFree',
  /**
   * [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) -
   * [current support?](https://caniuse.com/#feat=webgl)
   */
  WEBGL = 'webgl',
}

export function getBrowserCompatibility(): BrowserCompatibility {
  function objectHasPropertyWithType(
    object: object,
    propertyNames: string[],
    propertyType: string,
  ): boolean {
    // tslint:disable-next-line:no-any
    const objectProperty: any = (<any>object)[propertyNames[0]]
    if (objectProperty == null) {
      return false
    }
    if (propertyNames.length === 1) {
      return typeof objectProperty === propertyType
    } else {
      return (
        (typeof objectProperty === 'function' ||
          typeof objectProperty === 'object') &&
        objectHasPropertyWithType(
          objectProperty,
          propertyNames.slice(1),
          propertyType,
        )
      )
    }
  }

  function isBrokenWebAssemblyOS(os: OS): boolean {
    return (
      os.name === 'iOS' &&
      os.version != null &&
      ['11.2.2', '11.2.5', '11.2.6'].includes(os.version)
    )
  }

  let fullSupport: boolean = true
  let scannerSupport: boolean = true
  const missingFeatures: Feature[] = []

  if (!location.protocol.startsWith('http')) {
    missingFeatures.push(Feature.HTTP_PROTOCOL)
    fullSupport = scannerSupport = false
  }

  if (
    objectHasPropertyWithType(window, ['isSecureContext'], 'boolean') &&
    !window.isSecureContext
  ) {
    missingFeatures.push(Feature.SECURE_CONTEXT)
    // Don't disable full support in case browser is set to allow camera video streaming access in insecure contexts
  }

  if (
    !objectHasPropertyWithType(
      navigator,
      ['mediaDevices', 'getUserMedia'],
      'function',
    ) &&
    !objectHasPropertyWithType(navigator, ['enumerateDevices'], 'function') &&
    !objectHasPropertyWithType(
      window,
      ['MediaStreamTrack', 'getSources'],
      'function',
    )
  ) {
    missingFeatures.push(Feature.MEDIA_DEVICES)
    fullSupport = false
  }

  if (!objectHasPropertyWithType(window, ['Worker'], 'function')) {
    missingFeatures.push(Feature.WEB_WORKERS)
    fullSupport = scannerSupport = false
  }

  if (!objectHasPropertyWithType(window, ['WebAssembly'], 'object')) {
    missingFeatures.push(Feature.WEB_ASSEMBLY)
    fullSupport = scannerSupport = false
  }

  if (!objectHasPropertyWithType(window, ['Blob'], 'function')) {
    missingFeatures.push(Feature.BLOB)
    fullSupport = scannerSupport = false
  }

  if (
    !objectHasPropertyWithType(window, ['URL', 'createObjectURL'], 'function')
  ) {
    missingFeatures.push(Feature.URL_OBJECT)
    fullSupport = scannerSupport = false
  }

  if (!objectHasPropertyWithType(window, ['OffscreenCanvas'], 'function')) {
    missingFeatures.push(Feature.OFFSCREEN_CANVAS)
  }

  const userAgentInfo: {
    getBrowser(): Browser
    getOS(): OS
    getEngine(): Engine
    getDevice(): Device
    getCPU(): CPU
    getUA(): string
    setUA(uastring: string): void
  } = new UAParser(navigator.userAgent)

  const userAgentOS: OS = userAgentInfo.getOS()
  if (isBrokenWebAssemblyOS(userAgentOS)) {
    missingFeatures.push(Feature.WEB_ASSEMBLY_ERROR_FREE)
    fullSupport = scannerSupport = false
  }

  return {
    fullSupport,
    scannerSupport,
    missingFeatures,
  }
}
