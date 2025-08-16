// 事件总线，用于页面间数据同步
import { ref } from 'vue'

class EventBus {
  constructor() {
    this.events = {}
  }

  // 监听事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  // 移除事件监听
  off(event, callback) {
    if (!this.events[event]) return
    
    const index = this.events[event].indexOf(callback)
    if (index > -1) {
      this.events[event].splice(index, 1)
    }
  }

  // 触发事件
  emit(event, data) {
    if (!this.events[event]) return
    
    this.events[event].forEach(callback => {
      callback(data)
    })
  }

  // 移除所有事件监听
  clear() {
    this.events = {}
  }
}

// 创建全局事件总线实例
const eventBus = new EventBus()

// 定义事件类型常量
export const EVENTS = {
  TRANSACTION_ADDED: 'transaction:added',
  TRANSACTION_UPDATED: 'transaction:updated',
  TRANSACTION_DELETED: 'transaction:deleted',
  ACCOUNT_UPDATED: 'account:updated',
  DATA_REFRESHED: 'data:refreshed',
  FORM_SHOW: 'form:show',
  FORM_HIDE: 'form:hide'
}

export default eventBus