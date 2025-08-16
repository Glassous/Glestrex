<template>
  <div class="form-group">
    <label v-if="label" :for="inputId">{{ label }}</label>
    <div class="input-wrapper" :class="{ 'has-suffix': $slots.suffix || suffix, 'has-calculator': showCalculator }">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        :class="['form-input', { error: hasError }]"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <button
        v-if="showCalculator && type === 'number'"
        type="button"
        class="calculator-btn"
        @click="toggleCalculator"
        title="打开计算器"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H6v-2h8v2zm3-4H6v-2h11v2zm0-4H6V7h11v2z" fill="currentColor"/>
        </svg>
      </button>
      <div v-if="suffix || $slots.suffix" class="input-suffix" :class="{ 'with-calculator': showCalculator && type === 'number' }">
        <slot name="suffix">{{ suffix }}</slot>
      </div>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
    
    <!-- 内联计算器 -->
    <div v-if="calculatorVisible" class="inline-calculator">
      <div class="calculator-header">
        <span class="calculator-title">计算器</span>
        <button type="button" class="close-btn" @click="closeCalculator">×</button>
      </div>
      
      <div class="calculator-output">
        <div v-if="expression" class="expression">{{ expression }}</div>
        <div class="result">{{ display }}</div>
      </div>
      
      <div class="calculator-buttons">
        <button type="button" @click="clearAll" class="calc-btn clear">C</button>
        <button type="button" @click="backspace" class="calc-btn">⌫</button>
        <button type="button" @click="addDecimal" class="calc-btn">.</button>
        <button type="button" @click="operation('/')" class="calc-btn operator">÷</button>
        
        <button type="button" @click="inputNumber('7')" class="calc-btn">7</button>
        <button type="button" @click="inputNumber('8')" class="calc-btn">8</button>
        <button type="button" @click="inputNumber('9')" class="calc-btn">9</button>
        <button type="button" @click="operation('*')" class="calc-btn operator">×</button>
        
        <button type="button" @click="inputNumber('4')" class="calc-btn">4</button>
        <button type="button" @click="inputNumber('5')" class="calc-btn">5</button>
        <button type="button" @click="inputNumber('6')" class="calc-btn">6</button>
        <button type="button" @click="operation('-')" class="calc-btn operator">-</button>
        
        <button type="button" @click="inputNumber('1')" class="calc-btn">1</button>
        <button type="button" @click="inputNumber('2')" class="calc-btn">2</button>
        <button type="button" @click="inputNumber('3')" class="calc-btn">3</button>
        <button type="button" @click="operation('+')" class="calc-btn operator">+</button>
        
        <button type="button" @click="inputNumber('0')" class="calc-btn zero">0</button>
        <button type="button" @click="calculate" class="calc-btn equals">=</button>
        <button type="button" @click="useResult" class="calc-btn use">使用</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  min: {
    type: [String, Number],
    default: undefined
  },
  max: {
    type: [String, Number],
    default: undefined
  },
  step: {
    type: [String, Number],
    default: undefined
  },
  errorMessage: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  showCalculator: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = computed(() => {
  return props.id || `input-${Math.random().toString(36).substr(2, 9)}`
})

const hasError = computed(() => {
  return !!props.errorMessage
})

// 计算器状态
const calculatorVisible = ref(false)
const display = ref('0')
const expression = ref('')
const previousValue = ref(null)
const currentOperation = ref(null)
const waitingForOperand = ref(false)

const toggleCalculator = () => {
  calculatorVisible.value = !calculatorVisible.value
  if (calculatorVisible.value) {
    // 如果输入框有值，将其作为计算器的初始值
    if (props.modelValue && props.modelValue !== '') {
      display.value = String(props.modelValue)
    } else {
      display.value = '0'
    }
    clearCalculatorState()
  }
}

const closeCalculator = () => {
  calculatorVisible.value = false
}

const clearCalculatorState = () => {
  expression.value = ''
  previousValue.value = null
  currentOperation.value = null
  waitingForOperand.value = false
}

const inputNumber = (num) => {
  if (waitingForOperand.value) {
    display.value = num
    waitingForOperand.value = false
  } else {
    display.value = display.value === '0' ? num : display.value + num
  }
  
  if (currentOperation.value && previousValue.value !== null) {
    expression.value = `${previousValue.value} ${currentOperation.value} ${display.value}`
  }
}

const addDecimal = () => {
  if (waitingForOperand.value) {
    display.value = '0.'
    waitingForOperand.value = false
  } else if (display.value.indexOf('.') === -1) {
    display.value += '.'
  }
}

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

const calculate = () => {
  const inputValue = parseFloat(display.value)
  
  if (previousValue.value !== null && currentOperation.value) {
    expression.value = `${previousValue.value} ${currentOperation.value} ${inputValue} =`
    
    const newValue = performCalculation(previousValue.value, inputValue, currentOperation.value)
    display.value = String(newValue)
    
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

const clearAll = () => {
  display.value = '0'
  clearCalculatorState()
}

const backspace = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
  } else {
    display.value = '0'
  }
}

const useResult = () => {
  emit('update:modelValue', display.value)
  closeCalculator()
}
</script>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: #fff;
  color: #333;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-input.error {
  border-color: #dc3545;
}

.form-input.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.input-wrapper.has-suffix .form-input {
  padding-right: 60px;
}

.input-wrapper.has-calculator .form-input {
  padding-right: 80px;
}

.input-wrapper.has-calculator.has-suffix .form-input {
  padding-right: 120px;
}

.calculator-btn {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calculator-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.input-suffix {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 14px;
  pointer-events: none;
}

.input-suffix.with-calculator {
  right: 56px;
}

.error-message {
  margin-top: 6px;
  font-size: 14px;
  color: #dc3545;
}

.help-text {
  margin-top: 6px;
  font-size: 14px;
  color: #6c757d;
}

/* 内联计算器样式 */
.inline-calculator {
  margin-top: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  background: #f8f9fa;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.calculator-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #c82333;
}

.calculator-output {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  text-align: right;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.expression {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  min-height: 14px;
}

.result {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.calc-btn {
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 44px;
}

.calc-btn:hover {
  background: #e9ecef;
}

.calc-btn:active {
  transform: translateY(1px);
}

.calc-btn.operator {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.calc-btn.operator:hover {
  background: #0056b3;
  border-color: #0056b3;
}

.calc-btn.clear {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.calc-btn.clear:hover {
  background: #c82333;
  border-color: #c82333;
}

.calc-btn.equals {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.calc-btn.equals:hover {
  background: #1e7e34;
  border-color: #1e7e34;
}

.calc-btn.use {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.calc-btn.use:hover {
  background: #117a8b;
  border-color: #117a8b;
}

.calc-btn.zero {
  grid-column: span 2;
}
</style>