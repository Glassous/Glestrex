<template>
  <div class="form-group">
    <label v-if="label" :for="textareaId">{{ label }}</label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxlength"
      :class="['form-textarea', { error: hasError }]"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    ></textarea>
    <div v-if="showCharCount && maxlength" class="char-count">
      {{ characterCount }}/{{ maxlength }}
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
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
  rows: {
    type: [String, Number],
    default: 3
  },
  maxlength: {
    type: [String, Number],
    default: undefined
  },
  showCharCount: {
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
  id: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const textareaId = computed(() => {
  return props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`
})

const hasError = computed(() => {
  return !!props.errorMessage
})

const characterCount = computed(() => {
  return props.modelValue ? props.modelValue.length : 0
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

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  line-height: 1.5;
  transition: all 0.2s ease;
  background: #fff;
  color: #333;
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  resize: none;
}

.form-textarea.error {
  border-color: #dc3545;
}

.form-textarea.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.char-count {
  margin-top: 6px;
  font-size: 12px;
  color: #6c757d;
  text-align: right;
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