import { defineStore } from 'pinia'
import { setLanguage, getCurrentLanguage, availableLanguages } from '../locales/index.js'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: getCurrentLanguage(),
    availableLanguages: availableLanguages
  }),

  getters: {
    getCurrentLanguageName: (state) => {
      const lang = state.availableLanguages.find(l => l.code === state.currentLanguage)
      return lang ? lang.name : state.currentLanguage
    },
    
    getCurrentLanguageLabel: (state) => {
      const lang = state.availableLanguages.find(l => l.code === state.currentLanguage)
      return lang ? lang.name : state.currentLanguage
    }
  },

  actions: {
    setLanguage(languageCode) {
      if (this.availableLanguages.some(lang => lang.code === languageCode)) {
        this.currentLanguage = languageCode
        setLanguage(languageCode)
      }
    },

    initLanguage() {
      this.currentLanguage = getCurrentLanguage()
    }
  }
})