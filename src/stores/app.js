import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 当前页面状态
  const currentPage = ref('home')
  
  // 设置当前页面
  const setCurrentPage = (page) => {
    currentPage.value = page
  }
  
  return {
    currentPage,
    setCurrentPage
  }
})