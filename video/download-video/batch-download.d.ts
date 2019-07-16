export interface BatchItem {
  title: string
  aid: string
  cid: string
}
export class BatchExtractor {
  itemList: BatchItem[]
  itemFilter: (item: BatchItem) => boolean
  static test(): Promise<boolean>
  getItemList(): Promise<BatchItem[]>
  collectData(format: any, toast: Toast): Promise<string>
  collectAria2(format: any, toast: Toast, rpc?: boolean): Promise<string>
}