<template>
  <div class="glass-radio-group">
    <input type="radio" name="page" id="glass-home" :checked="currentPage === 'home'" @change="changePage('home')" />
    <label for="glass-home">{{ $t('nav.home') }}</label>

    <input type="radio" name="page" id="glass-transactions" :checked="currentPage === 'transactions'" @change="changePage('transactions')" />
    <label for="glass-transactions">{{ $t('nav.transactions') }}</label>

    <input type="radio" name="page" id="glass-details" :checked="currentPage === 'details'" @change="changePage('details')" />
    <label for="glass-details">{{ $t('nav.details') }}</label>

    <input type="radio" name="page" id="glass-profile" :checked="currentPage === 'profile'" @change="changePage('profile')" />
    <label for="glass-profile">{{ $t('nav.settings') }}</label>

    <div class="glass-glider"></div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentPage: {
    type: String,
    default: 'home'
  }
})

const emit = defineEmits(['page-change'])

const changePage = (page) => {
  emit('page-change', page)
}
</script>

<style scoped>
.glass-radio-group {
  --bg: rgba(255, 255, 255, 0.06);
  --text: var(--text-secondary);

  display: flex;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg);
  border-radius: 1rem;
  backdrop-filter: blur(12px);
  box-shadow:
    inset 1px 1px 4px rgba(255, 255, 255, 0.2),
    inset -1px -1px 6px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: fit-content;
  z-index: 1000;
}

/* 深色模式下的Tabbar样式 */
[data-theme="dark"] .glass-radio-group {
  --bg: rgba(48, 48, 48, 0.8);
  --text: var(--text-secondary);
  box-shadow:
    inset 1px 1px 4px rgba(255, 255, 255, 0.1),
    inset -1px -1px 6px rgba(0, 0, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.3);
}

.glass-radio-group input {
  display: none;
}

.glass-radio-group label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  font-size: 14px;
  padding: 0.8rem 1.6rem;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--text);
  position: relative;
  z-index: 2;
  transition: color 0.3s ease-in-out;
}

.glass-radio-group label:hover {
  color: var(--text-primary);
}

.glass-radio-group input:checked + label {
  color: var(--text-primary);
}

/* 深色模式下的label样式 */
[data-theme="dark"] .glass-radio-group label {
  color: var(--text-secondary);
}

[data-theme="dark"] .glass-radio-group label:hover {
  color: var(--text-primary);
}

[data-theme="dark"] .glass-radio-group input:checked + label {
  color: var(--text-primary);
}

.glass-glider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: calc(100% / 4);
  border-radius: 1rem;
  z-index: 1;
  transition:
    transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
    background 0.4s ease-in-out,
    box-shadow 0.4s ease-in-out;
}

/* Home */
#glass-home:checked ~ .glass-glider {
  transform: translateX(0%);
  background: linear-gradient(135deg, #00e8b055, #00e8b0);
  box-shadow:
    0 0 18px rgba(0, 232, 176, 0.5),
    0 0 10px rgba(0, 232, 176, 0.4) inset;
}

/* Transactions */
#glass-transactions:checked ~ .glass-glider {
  transform: translateX(100%);
  background: linear-gradient(135deg, #00e8b055, #00e8b0);
  box-shadow:
    0 0 18px rgba(0, 232, 176, 0.5),
    0 0 10px rgba(0, 232, 176, 0.4) inset;
}

/* Details */
#glass-details:checked ~ .glass-glider {
  transform: translateX(200%);
  background: linear-gradient(135deg, #00e8b055, #00e8b0);
  box-shadow:
    0 0 18px rgba(0, 232, 176, 0.5),
    0 0 10px rgba(0, 232, 176, 0.4) inset;
}

/* Profile */
#glass-profile:checked ~ .glass-glider {
  transform: translateX(300%);
  background: linear-gradient(135deg, #00e8b055, #00e8b0);
  box-shadow:
    0 0 18px rgba(0, 232, 176, 0.5),
    0 0 10px rgba(0, 232, 176, 0.4) inset;
}
</style>