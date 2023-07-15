export enum SubscriptionStatus {
  ToView = 1,
  Viewing,
  Viewed,
}
export interface SubscriptionStatusFilter {
  viewAll: boolean
  status: SubscriptionStatus
}
export interface SubscriptionItem {
  title: string
  coverUrl: string
  latest: number
  progress: string
  id: string
  status: SubscriptionStatus
  statusText: string
  playUrl: string
  mediaUrl: string
}
