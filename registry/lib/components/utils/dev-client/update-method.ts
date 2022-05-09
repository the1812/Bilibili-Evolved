export enum RegistryUpdateMethod {
  AlwaysReload = '总是自动刷新',
  PreferInstantStyles = '有 instantStyles 时不刷新',
  PreferEntry = 'entry 为空时不刷新',
  DoNotReload = '不自动刷新',
}
export enum CoreUpdateMethod {
  AlwaysReload = '自动刷新',
  DoNotReload = '不自动刷新',
}
