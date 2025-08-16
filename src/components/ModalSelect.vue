<template>
  <div class="modal-select">
    <label v-if="label" class="select-label">{{ label }}</label>
    <div 
      class="select-trigger" 
      :class="{ 'error': hasError, 'disabled': disabled }"
      @click="!disabled && toggleModal()"
    >
      <div class="selected-content">
        <div v-if="selectedOption" class="selected-option">
          <IconComponent v-if="selectedOption.icon" :name="selectedOption.icon" class="option-icon" :size="16" />
          <span class="option-text">{{ selectedOption.label }}</span>
        </div>
        <span v-else class="placeholder">{{ placeholder }}</span>
      </div>
      <svg class="dropdown-arrow" :class="{ 'open': showModal }" width="12" height="8" viewBox="0 0 12 8" fill="none">
        <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    
    <!-- 弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ modalTitle || label || '请选择' }}</h3>
          <button class="close-btn" @click="closeModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="options-list">
          <div 
            v-for="option in options" 
            :key="getOptionValue(option)"
            class="option-item"
            :class="{ 
              'selected': getOptionValue(option) === modelValue,
              'disabled': option.disabled 
            }"
            @click="!option.disabled && selectOption(option)"
          >
            <div class="option-content">
              <IconComponent v-if="option.icon" :name="option.icon" class="option-icon" :size="20" />
              <span class="option-text">{{ getOptionLabel(option) }}</span>
            </div>
            <svg v-if="getOptionValue(option) === modelValue" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import IconComponent from './IconComponent.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  options: {
    type: Array,
    default: () => []
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  modalTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const showModal = ref(false)

const hasError = computed(() => {
  return !!props.errorMessage
})

const selectedOption = computed(() => {
  return props.options.find(option => getOptionValue(option) === props.modelValue)
})

const getOptionValue = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey]
  }
  return option
}

const getOptionLabel = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.labelKey]
  }
  return option
}

const toggleModal = () => {
  showModal.value = !showModal.value
}

const closeModal = () => {
  showModal.value = false
}

const selectOption = (option) => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', value, option)
  closeModal()
}
</script>

<style scoped>
.modal-select {
  position: relative;
  margin-bottom: 20px;
}

.select-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.select-trigger:hover {
  border-color: var(--active-bg);
}

.select-trigger.error {
  border-color: var(--danger-color);
}

.select-trigger.disabled {
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.selected-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.selected-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.option-text {
  color: var(--text-primary);
  font-size: 16px;
}

.placeholder {
  color: var(--text-secondary);
  font-size: 16px;
}

.dropdown-arrow {
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 10px 25px var(--shadow-color);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.options-list {
  overflow-y: auto;
  max-height: 400px;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-color);
}

.option-item:last-child {
  border-bottom: none;
}

.option-item:hover {
  background: var(--hover-bg);
}

.option-item.selected {
  background: var(--hover-bg);
  color: var(--active-bg);
}

.option-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.option-item .option-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.option-item.selected .option-icon {
  color: var(--active-bg);
}

.option-item .option-text {
  font-size: 16px;
  color: var(--text-primary);
}

.option-item.selected .option-text {
  color: var(--active-bg);
  font-weight: 500;
}

.check-icon {
  color: var(--active-bg);
  flex-shrink: 0;
}

.error-message {
  margin-top: 6px;
  font-size: 14px;
  color: var(--danger-color);
}

.help-text {
  margin-top: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    max-width: 100%;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .option-item {
    padding: 14px 16px;
  }
}
</style>