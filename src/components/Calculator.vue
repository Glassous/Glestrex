<template>
  <div 
    class="calculator" 
    v-if="visible"
    ref="calculatorRef"
    @mousedown="startDrag"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <div class="calculator-header" @mousedown="startDrag">
      <span class="calculator-title">{{ t('calculator.title') }}</span>
      <button class="close-btn" @click="close" @mousedown.stop>×</button>
    </div>
    
    <div class="output">
      <div v-if="expression" class="expression">{{ expression }}</div>
      <div class="result">{{ display }}</div>
    </div>
    
    <div class="buttons">
      <button @click="number('1')" @mousedown.stop><span>1</span></button>
      <button @click="number('2')" @mousedown.stop><span>2</span></button>
      <button @click="number('3')" @mousedown.stop><span>3</span></button>
      <button @click="operation('+')" @mousedown.stop><span>+</span></button>
      
      <button @click="number('4')" @mousedown.stop><span>4</span></button>
      <button @click="number('5')" @mousedown.stop><span>5</span></button>
      <button @click="number('6')" @mousedown.stop><span>6</span></button>
      <button @click="operation('-')" @mousedown.stop><span>-</span></button>
      
      <button @click="number('7')" @mousedown.stop><span>7</span></button>
      <button @click="number('8')" @mousedown.stop><span>8</span></button>
      <button @click="number('9')" @mousedown.stop><span>9</span></button>
      <button @click="operation('*')" @mousedown.stop><span>×</span></button>
      
      <button @click="clear" class="bg-red" @mousedown.stop><span>C</span></button>
      <button @click="number('0')" @mousedown.stop><span>0</span></button>
      <button @click="calculate" class="bg-green" @mousedown.stop><span>=</span></button>
      <button @click="operation('/')" @mousedown.stop><span>÷</span></button>
     </div>
     
     <!-- 快捷键提示 - 常驻显示 -->
     <div class="keyboard-hint-permanent">
       {{ t('calculator.shortcutHint') }}
     </div>
   </div>
 </template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  showHint: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'toggle'])

const calculatorRef = ref(null)
const display = ref('0')
const expression = ref('')
const previousValue = ref(null)
const currentOperation = ref(null)
const waitingForOperand = ref(false)

// 拖动相关状态
const isDragging = ref(false)
// 初始位置设置在右下角按钮上方，避免重叠
const position = ref({ x: window.innerWidth - 250, y: window.innerHeight - 400 })
const dragOffset = ref({ x: 0, y: 0 })

// 数字输入
const number = (num) => {
  if (waitingForOperand.value) {
    display.value = num
    waitingForOperand.value = false
  } else {
    display.value = display.value === '0' ? num : display.value + num
  }
  
  // 更新表达式显示
  if (currentOperation.value && previousValue.value !== null) {
    expression.value = `${previousValue.value} ${currentOperation.value} ${display.value}`
  }
}

// 小数点
const decimal = () => {
  if (waitingForOperand.value) {
    display.value = '0.'
    waitingForOperand.value = false
  } else if (display.value.indexOf('.') === -1) {
    display.value += '.'
  }
}

// 运算符
const operation = (op) => {
  const inputValue = parseFloat(display.value)
  
  if (previousValue.value === null) {
    previousValue.value = inputValue
    expression.value = `${inputValue} ${op}`
  } else if (currentOperation.value) {
    const currentValue = previousValue.value || 0
    const newValue = performCalculation(currentValue, inputValue, currentOperation.value)
    
    display.value = String(newValue)
    previousValue.value = newValue
    expression.value = `${newValue} ${op}`
  }
  
  waitingForOperand.value = true
  currentOperation.value = op
}

// 计算
const calculate = () => {
  const inputValue = parseFloat(display.value)
  
  if (previousValue.value !== null && currentOperation.value) {
    // 显示完整表达式
    expression.value = `${previousValue.value} ${currentOperation.value} ${inputValue} =`
    
    const newValue = performCalculation(previousValue.value, inputValue, currentOperation.value)
    display.value = String(newValue)
    emit('result', newValue)
    
    // 延迟清除表达式，让用户看到完整计算过程
    setTimeout(() => {
      expression.value = ''
    }, 1500)
    
    previousValue.value = null
    currentOperation.value = null
    waitingForOperand.value = true
  }
}

const performCalculation = (firstValue, secondValue, operation) => {
  switch (operation) {
    case '+':
      return firstValue + secondValue
    case '-':
      return firstValue - secondValue
    case '*':
      return firstValue * secondValue
    case '/':
      return secondValue !== 0 ? firstValue / secondValue : 0
    default:
      return secondValue
  }
}

// 清除
const clear = () => {
  display.value = '0'
  expression.value = ''
  previousValue.value = null
  currentOperation.value = null
  waitingForOperand.value = false
}

const clearEntry = () => {
  display.value = '0'
}

const backspace = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
  } else {
    display.value = '0'
  }
}

// 关闭
const close = () => {
  emit('close')
}

// 拖动功能
const startDrag = (e) => {
  isDragging.value = true
  const rect = calculatorRef.value.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  document.addEventListener('mousemove', drag)
  document.addEventListener('mouseup', stopDrag)
}

const drag = (e) => {
  if (isDragging.value) {
    position.value = {
      x: e.clientX - dragOffset.value.x,
      y: e.clientY - dragOffset.value.y
    }
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', stopDrag)
}

onMounted(() => {
  // 组件挂载时的初始化
})

onUnmounted(() => {
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.calculator {
  position: fixed;
  z-index: 1000;
  border: 1px solid rgb(179, 179, 179);
  border-radius: 0.375rem;
  width: 170px;
  height: auto;
  min-height: 230px;
  font-family: Arial, sans-serif;
  padding: 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: move;
  user-select: none;
  display: flex;
  flex-direction: column;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  cursor: move;
}

.calculator-title {
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #ff3742;
}

.output {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: right;
  color: #333;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.expression {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
  min-height: 16px;
}

.result {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  flex: 1;
  align-content: start;
}

button {
  width: 32px;
  height: 32px;
  border: 2px solid #000000;
  border-radius: 6px;
  padding: 0;
  background-color: #f5f5f5;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  color: #000000;
  position: relative;
  box-shadow: 2px 2px 0px #000000;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
}

button::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -150%;
  width: 200%;
  height: 200%;
  border-radius: 50%;
  transform: translateX(-50%) scale(0);
  transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  z-index: 1;
  background-color: #e0e0e0;
}

button:hover::before {
  transform: translateX(-50%) scale(1);
}

button:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px #000000;
}

button:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px #000000;
}

button span {
  position: relative;
  z-index: 2;
}

.bg-green {
  background-color: #4CAF50;
  color: white;
  border-color: #2E7D32;
  box-shadow: 2px 2px 0px #2E7D32;
}

.bg-green::before {
  background-color: #66BB6A;
}

.bg-green:hover {
  box-shadow: 3px 3px 0px #2E7D32;
}

.bg-green:active {
  box-shadow: 1px 1px 0px #2E7D32;
}

.bg-red {
  background-color: #F44336;
  color: white;
  border-color: #C62828;
  box-shadow: 2px 2px 0px #C62828;
}

.bg-red::before {
  background-color: #EF5350;
}

.bg-red:hover {
  box-shadow: 3px 3px 0px #C62828;
}

.bg-red:active {
  box-shadow: 1px 1px 0px #C62828;
}

.keyboard-hint-permanent {
  padding: 8px 12px;
  background: #f0f0f0;
  color: #666;
  border-top: 1px solid #ddd;
  border-radius: 0 0 8px 8px;
  font-size: 10px;
  text-align: center;
  margin-top: 12px;
}
</style>