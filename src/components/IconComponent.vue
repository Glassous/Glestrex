<template>
  <component 
    :is="iconComponent" 
    :size="Number(size)" 
    :class="className"
    :stroke-width="2"
    v-if="iconComponent"
  />
  <span v-else class="icon-fallback">{{ name }}</span>
</template>

<script setup>
import { computed } from 'vue'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CreditCard,
  Building2,
  Gamepad2,
  Home,
  Settings,
  User,
  Download,
  Copy,
  Trash2,
  RefreshCw,
  Moon,
  Sun,
  Gift,
  Banknote,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Hospital,
  BookOpen,
  Smartphone,
  Plus,
  X,
  Edit,
  ArrowRightLeft,
  Scale,
  HelpCircle
} from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 20
  },
  className: {
    type: String,
    default: ''
  }
})

// 图标映射表
const iconMap = {
  // 财务相关
  '💰': DollarSign,
  '💸': TrendingDown,
  '💳': CreditCard,
  '💵': Banknote,
  '📊': BarChart3,
  '📈': TrendingUp,
  '📉': TrendingDown,
  '💼': Building2,
  
  // 账户类型
  '🏦': Building2,
  '🎮': Gamepad2,
  
  // 分类图标
  '🍽️': UtensilsCrossed,
  '🚗': Car,
  '🛍️': ShoppingBag,
  '🏥': Hospital,
  '📚': BookOpen,
  '🏠': Home,
  '🎁': Gift,
  
  // 操作图标
  '🔄': RefreshCw,
  '📥': Download,
  '📋': Copy,
  '🗑️': Trash2,
  
  // 界面图标
  '⚙️': Settings,
  '👤': User,
  '🌙': Moon,
  '📱': Smartphone,
  '📝': BookOpen,
  
  // 字符串图标名称映射
  'refresh-cw': RefreshCw,
  'sun': Sun,
  'moon': Moon,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'bar-chart-3': BarChart3,
  'credit-card': CreditCard,
  'building-2': Building2,
  'gamepad-2': Gamepad2,
  'home': Home,
  'settings': Settings,
  'user': User,
  'download': Download,
  'copy': Copy,
  'trash-2': Trash2,
  'gift': Gift,
  'banknote': Banknote,
  'utensils-crossed': UtensilsCrossed,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'hospital': Hospital,
  'book-open': BookOpen,
  'smartphone': Smartphone,
  'plus': Plus,
  'x': X,
  'edit': Edit,
  'arrow-right-left': ArrowRightLeft,
  'scale': Scale,
  'help-circle': HelpCircle
}

const iconComponent = computed(() => {
  return iconMap[props.name] || DollarSign
})
</script>

<style scoped>
/* 图标样式可以在这里定义 */
</style>