interface Cookie {
  domain: string
  expires: number
  name: string
  partitioned: boolean
  path: string
  sameSite: 'Strict' | 'Lax' | 'None'
  secure: boolean
  value: string
}

interface CookieChangedEvent extends Event {
  changed: Readonly<Array<Cookie>>
  deleted: Readonly<Array<Cookie>>
}

interface CookieStore {
  get(name: string): Promise<Cookie | null>
  get(options: { name: string; url?: string }): Promise<Cookie | null>

  getAll(): Promise<Cookie[]>
  getAll(name: string): Promise<Cookie[]>
  getAll(options: { name?: string; url?: string }): Promise<Cookie[]>

  set(name: string, value: string): Promise<void>
  set(options: Partial<Cookie> & { name: string; value: string }): Promise<void>

  delete(name: string): Promise<void>
  delete(options: { name: string; url?: string }): Promise<void>

  addEventListener(eventName: 'change', handler: (event: CookieChangedEvent) => void): void
  removeEventListener(eventName: 'change', handler: (event: CookieChangedEvent) => void): void
  onchange: null | ((event: CookieChangedEvent) => void)
}

declare const cookieStore: CookieStore
