<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot v-if="!loading" name="icon"></slot>
    <span v-if="!loading || showTextWhileLoading" class="button-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline-primary', 'outline-secondary', 'outline-success', 'outline-danger', 'outline-warning', 'outline-info'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  showTextWhileLoading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  return [
    'base-button',
    `btn-${props.variant}`,
    `btn-${props.size}`,
    {
      'btn-block': props.block,
      'btn-rounded': props.rounded,
      'btn-loading': props.loading,
      'btn-disabled': props.disabled
    }
  ]
})
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
  font-family: inherit;
}

.base-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Sizes */
.btn-small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.btn-medium {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 44px;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 52px;
}

/* Block */
.btn-block {
  width: 100%;
}

/* Rounded */
.btn-rounded {
  border-radius: 50px;
}

/* Primary */
.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
}

/* Secondary */
.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
  border-color: #545b62;
}

/* Success */
.btn-success {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
  border-color: #1e7e34;
}

/* Danger */
.btn-danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
  border-color: #c82333;
}

/* Warning */
.btn-warning {
  background: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
  border-color: #e0a800;
}

/* Info */
.btn-info {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.btn-info:hover:not(:disabled) {
  background: #117a8b;
  border-color: #117a8b;
}

/* Light */
.btn-light {
  background: #f8f9fa;
  color: #212529;
  border-color: #f8f9fa;
}

.btn-light:hover:not(:disabled) {
  background: #e2e6ea;
  border-color: #e2e6ea;
}

/* Dark */
.btn-dark {
  background: #343a40;
  color: white;
  border-color: #343a40;
}

.btn-dark:hover:not(:disabled) {
  background: #23272b;
  border-color: #23272b;
}

/* Outline variants */
.btn-outline-primary {
  background: transparent;
  color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

.btn-outline-secondary {
  background: transparent;
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

.btn-outline-success {
  background: transparent;
  color: #28a745;
  border-color: #28a745;
}

.btn-outline-success:hover:not(:disabled) {
  background: #28a745;
  color: white;
}

.btn-outline-danger {
  background: transparent;
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}

.btn-outline-warning {
  background: transparent;
  color: #ffc107;
  border-color: #ffc107;
}

.btn-outline-warning:hover:not(:disabled) {
  background: #ffc107;
  color: #212529;
}

.btn-outline-info {
  background: transparent;
  color: #17a2b8;
  border-color: #17a2b8;
}

.btn-outline-info:hover:not(:disabled) {
  background: #17a2b8;
  color: white;
}

/* Disabled state */
.base-button:disabled,
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Loading state */
.btn-loading {
  cursor: wait;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.button-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>