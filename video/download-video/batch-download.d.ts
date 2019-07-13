export class BatchExtractor {
  static test(): Promise<boolean>
  collectData(format: any, toast: Toast): Promise<string>
  collectAria2(format: any, toast: Toast, rpc?: boolean): Promise<string>
}