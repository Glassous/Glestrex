<template>
  <button class="calc-toggle-btn" @click="toggleCalculator">
    <div class="calc-toggle-content">
      <div class="calc-toggle-icon">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H6v-2h8v2zm3-4H6v-2h11v2zm0-4H6V7h11v2z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  </button>
</template>

<script setup>
import { defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['toggle'])

const toggleCalculator = () => {
  emit('toggle')
}
</script>

<style scoped>
.calc-toggle-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 0;
  width: 48px;
  height: 48px;
  border: 3px solid #000000;
  outline: none;
  background-color: #4CAF50;
  border-radius: 12px;
  box-shadow: 4px 4px 0px #000000;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  z-index: 999;
  overflow: hidden;
}

/* 窄屏时计算器按钮上浮，避免被Tabbar遮挡 */
@media (max-width: 768px) {
  .calc-toggle-btn {
    bottom: 100px; /* 上浮到Tabbar上方 */
    z-index: 1001; /* 确保在Tabbar之上 */
    right: 15px; /* 稍微调整右边距 */
  }
}

.calc-toggle-btn::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -150%;
  width: 300%;
  height: 300%;
  border-radius: 50%;
  transform: translateX(-50%) scale(0);
  transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
  z-index: 1;
  background-color: #66BB6A;
}

.calc-toggle-btn:hover::before {
  transform: translateX(-50%) scale(1);
}

.calc-toggle-btn:hover {
  transform: translate(-4px, -4px);
  box-shadow: 8px 8px 0px #000000;
}

.calc-toggle-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000000;
}

.calc-toggle-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  transition: 0.3s ease-in-out;
  z-index: 2;
}

.calc-toggle-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 2;
}

.calc-toggle-btn:hover .calc-toggle-icon {
  animation: spin 3s linear infinite;
  transform: scale(0.9);
}

@keyframes spin {
  0% {
    transform: rotate(0deg) scale(0.9);
  }
  100% {
    transform: rotate(360deg) scale(0.9);
  }
}

.calc-toggle-icon svg {
  width: 24px;
  height: 24px;
  color: #ffffff;
}


</style>