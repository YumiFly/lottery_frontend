import { en } from "./locales/en"
import { zh } from "./locales/zh"

export type Language = "en" | "zh"

export const languages: Record<Language, string> = {
  en: "English",
  zh: "中文",
}

export const i18n = {
  en,
  zh,
}

export type I18nKey = keyof typeof en

export function getTranslation(lang: Language, key: string) {
  const keys = key.split(".")
  let translation: any = i18n[lang]

  for (const k of keys) {
    if (!translation[k]) {
      return key
    }
    translation = translation[k]
  }

  return translation
}
