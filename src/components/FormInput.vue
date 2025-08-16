<template>
  <div class="form-group">
    <label v-if="label" :for="inputId">{{ label }}</label>
    <div class="input-wrapper" :class="{ 'has-suffix': $slots.suffix || suffix }">
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
      <div v-if="suffix || $slots.suffix" class="input-suffix">
        <slot name="suffix">{{ suffix }}</slot>
      </div>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = computed(() => {
  return props.id || `input-${Math.random().toString(36).substr(2, 9)}`
})

const hasError = computed(() => {
  return !!props.errorMessage
})
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

.input-suffix {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 14px;
  pointer-events: none;
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
</style>