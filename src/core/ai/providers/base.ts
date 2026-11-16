export abstract class AIProvider {
  abstract readonly id: string
  abstract readonly displayName: string

  abstract generate(prompt: string): Promise<string>

  toString() {
    return this.displayName
  }
}
