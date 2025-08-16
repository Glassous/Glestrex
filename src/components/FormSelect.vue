<template>
  <div class="form-group">
    <label v-if="label" :for="selectId">{{ label }}</label>
    <div class="select-wrapper">
      <select
        :id="selectId"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        :class="['form-select', { error: hasError }]"
        @change="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <template v-if="grouped">
          <optgroup v-for="group in options" :key="group.label" :label="group.label">
            <option
              v-for="option in group.options"
              :key="getOptionValue(option)"
              :value="getOptionValue(option)"
              :disabled="option.disabled"
            >
              {{ getOptionLabel(option) }}
            </option>
          </optgroup>
        </template>
        <template v-else>
          <option
            v-for="option in options"
            :key="getOptionValue(option)"
            :value="getOptionValue(option)"
            :disabled="option.disabled"
          >
            {{ getOptionLabel(option) }}
          </option>
        </template>
      </select>
      <div class="select-arrow">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
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
  placeholder: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  grouped: {
    type: Boolean,
    default: false
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  required: {
    type: Boolean,
    default: false
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
  id: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const selectId = computed(() => {
  return props.id || `select-${Math.random().toString(36).substr(2, 9)}`
})

const hasError = computed(() => {
  return !!props.errorMessage
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

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.form-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  background: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-select.error {
  border-color: #dc3545;
}

.form-select.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6c757d;
  transition: transform 0.2s ease;
}

.form-select:focus + .select-arrow {
  transform: translateY(-50%) rotate(180deg);
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