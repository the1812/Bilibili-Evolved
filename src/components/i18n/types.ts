export interface CssTranslation {
  selector: string
  text: string
  not?: boolean
}
export type Translation = string | CssTranslation | (string | CssTranslation)[]
export type GeneralTranslation = Map<string, Translation>
export type RegexTranslation = [RegExp, string][]
