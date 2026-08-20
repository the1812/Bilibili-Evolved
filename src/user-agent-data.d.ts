interface NavigatorUABrand {
  brand: string
  version: string
}

interface NavigatorUAData {
  brands: ReadonlyArray<NavigatorUABrand>
}

interface Navigator {
  readonly userAgentData?: NavigatorUAData
}
