interface NavigatorUABrand {
  brand: string
  version: string
}

interface NavigatorUAData {
  brands: ReadonlyArray<NavigatorUABrand>
  readonly platform?: string
}

interface Navigator {
  readonly userAgentData?: NavigatorUAData
}
