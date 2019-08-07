export interface MagicGridConfig {
  container: string | HTMLElement // Required. Can be a class, id, or an HTMLElement
  static: boolean // Required for static content. Default: false.
  items: number, // Required for dynamic content. Initial number of items in the container.
  gutter?: number, // Optional. Space between items. Default: 25(px).
  maxColumns?: number, // Optional. Maximum number of columns. Default: Infinite.
  useMin?: boolean, // Optional. Prioritize shorter columns when positioning items. Default: false.
  useTransform?: boolean, // Optional. Position items using CSS transform. Default: True.
  animate?: boolean, // Optional. Animate item positioning. Default: false.
}
export class MagicGrid {
  constructor(config: MagicGridConfig)
  listen(): void
  positionItems(): void
}
