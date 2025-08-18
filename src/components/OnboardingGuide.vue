<template>
  <div class="onboarding-overlay" v-if="showOnboarding">
    <div class="onboarding-container">
      <!-- 第一页：语言选择 -->
      <div v-if="currentStep === 1" class="onboarding-step">
        <h1>{{ $t('onboarding.welcome') }}</h1>
        <h2 class="language-title">{{ $t('onboarding.chooseLanguage') }}</h2>
        
        <div class="language-selection">
          <div class="language-options">
            <div 
              v-for="lang in availableLanguages" 
              :key="lang.code"
              class="language-option"
              :class="{ selected: selectedLanguage === lang.code }"
              @click="selectLanguage(lang.code)"
            >
              <img :src="getFlagUrl(lang.flagCode)" class="language-flag" :alt="lang.name" />
              <div class="language-info">
                <div class="language-name">{{ lang.name }}</div>
              </div>
              <span v-if="selectedLanguage === lang.code" class="language-check">✓</span>
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <button class="btn-skip" @click="skipOnboarding">{{ $t('onboarding.skipGuide') }}</button>
          <button class="btn-next" @click="nextStep">{{ $t('onboarding.continue') }}</button>
        </div>
      </div>

      <!-- 第二页：功能介绍 -->
      <div v-if="currentStep === 2" class="onboarding-step">
        <h2>{{ $t('onboarding.features.title') }}</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">💳</div>
            <h3>{{ $t('onboarding.features.accountManagement.title') }}</h3>
            <p>{{ $t('onboarding.features.accountManagement.description') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>{{ $t('onboarding.features.transactionRecord.title') }}</h3>
            <p>{{ $t('onboarding.features.transactionRecord.description') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>{{ $t('onboarding.features.dataAnalysis.title') }}</h3>
            <p>{{ $t('onboarding.features.dataAnalysis.description') }}</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>{{ $t('onboarding.features.dataSecurity.title') }}</h3>
            <p>{{ $t('onboarding.features.dataSecurity.description') }}</p>
          </div>
        </div>
        
        <div class="usage-steps">
          <h3>{{ $t('onboarding.usage.title') }}</h3>
          <ol>
            <li>{{ $t('onboarding.usage.step1') }}</li>
            <li>{{ $t('onboarding.usage.step2') }}</li>
            <li>{{ $t('onboarding.usage.step3') }}</li>
            <li>{{ $t('onboarding.usage.step4') }}</li>
          </ol>
        </div>
        
        <div class="step-actions">
          <button class="btn-back" @click="previousStep">{{ $t('onboarding.back') }}</button>
          <div class="step-actions-right">
            <button class="btn-skip" @click="skipOnboarding">{{ $t('onboarding.skipGuide') }}</button>
            <button class="btn-next" @click="nextStep">{{ $t('onboarding.startUsing') }}</button>
          </div>
        </div>
      </div>

      <!-- 第三页：创建账户 -->
      <div v-if="currentStep === 3" class="onboarding-step">
        <h2>{{ $t('onboarding.createAccount') }}</h2>
        
        <div class="account-form">
          <div class="form-group">
            <label>{{ $t('onboarding.account.name') }}</label>
            <input 
              v-model="newAccount.name" 
              type="text" 
              :placeholder="$t('onboarding.account.namePlaceholder')"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label>{{ $t('onboarding.account.type') }}</label>
            <select v-model="newAccount.type" class="form-select">
              <option value="cash">{{ $t('onboarding.account.types.cash') }}</option>
              <option value="loan">{{ $t('onboarding.account.types.loan') }}</option>
              <option value="virtual">{{ $t('onboarding.account.types.virtual') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>{{ $t('onboarding.account.currency') }}</label>
            <select v-model="newAccount.currency" class="form-select">
              <option value="CNY">{{ $t('onboarding.account.currencies.cny') }}</option>
              <option value="USD">{{ $t('onboarding.account.currencies.usd') }}</option>
              <option value="EUR">{{ $t('onboarding.account.currencies.eur') }}</option>
              <option value="JPY">{{ $t('onboarding.account.currencies.jpy') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>{{ $t('onboarding.account.initialBalance') }}</label>
            <input 
              v-model="newAccount.balance" 
              type="number" 
              step="0.01"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="step-actions">
          <button class="btn-back" @click="previousStep">{{ $t('common.previous') }}</button>
          <div class="step-actions-right">
            <button class="btn-skip" @click="nextStep">{{ $t('onboarding.account.skip') }}</button>
            <button class="btn-next" @click="createAccount">{{ $t('onboarding.account.createButton') }}</button>
          </div>
        </div>
      </div>

      <!-- 第四页：设置分类 -->
      <div v-if="currentStep === 4" class="onboarding-step">
        <h2>{{ $t('onboarding.setupCategories') }}</h2>
        <p>{{ $t('onboarding.categories.description') }}</p>
        
        <div class="categories-section">
          <h3>{{ $t('onboarding.categories.expense') }}</h3>
          <div class="categories-grid">
            <div 
              v-for="category in expenseCategories" 
              :key="category.id"
              class="category-item"
              :class="{ selected: selectedCategories.includes(category.id) }"
              @click="toggleCategory(category.id)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span v-if="selectedCategories.includes(category.id)" class="category-check">✓</span>
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <button class="btn-back" @click="previousStep">{{ $t('common.previous') }}</button>
          <button class="btn-next" @click="setupCategories">{{ $t('onboarding.categories.complete') }}</button>
        </div>
      </div>

      <!-- 第五页：完成引导 -->
      <div v-if="currentStep === 5" class="onboarding-step">
        <div class="completion-content">
          <div class="success-icon">🎉</div>
          <h2>{{ $t('onboarding.completion.congratulations') }}</h2>
          <p>{{ $t('onboarding.completion.description') }}</p>
          
          <div class="tips-section">
            <h3>{{ $t('onboarding.completion.tips.title') }}</h3>
            <ul class="tips-list">
              <li>{{ $t('onboarding.completion.tips.tip1') }}</li>
              <li>{{ $t('onboarding.completion.tips.tip2') }}</li>
              <li>{{ $t('onboarding.completion.tips.tip3') }}</li>
              <li>{{ $t('onboarding.completion.tips.tip4') }}</li>
            </ul>
          </div>
        </div>
        
        <div class="step-actions">
          <button class="btn-finish" @click="completeOnboarding">{{ $t('onboarding.completion.startButton') }}</button>
        </div>
      </div>

      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div 
          v-for="step in 5" 
          :key="step"
          class="step-dot"
          :class="{ active: currentStep === step, completed: currentStep > step }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import databaseService from '../services/database.js'

const emit = defineEmits(['complete'])
const { t: $t, locale } = useI18n()

const showOnboarding = ref(true)
const currentStep = ref(1)
const selectedLanguage = ref('zh-CN')

// 可用语言列表
const availableLanguages = ref([
  { 
    code: 'zh-CN', 
    name: '简体中文',
    flagCode: 'cn' 
  },
  { 
    code: 'en-US', 
    name: 'English',
    flagCode: 'us' 
  }
])

// 新账户数据
const newAccount = ref({
  name: '',
  type: 'cash',
  currency: 'CNY',
  balance: 0
})

// 预设分类
const expenseCategories = ref([
  { id: 1, name: '餐饮', icon: '🍽️' },
  { id: 2, name: '交通', icon: '🚗' },
  { id: 3, name: '购物', icon: '🛍️' },
  { id: 4, name: '娱乐', icon: '🎮' },
  { id: 5, name: '医疗', icon: '🏥' },
  { id: 6, name: '教育', icon: '📚' },
  { id: 7, name: '住房', icon: '🏠' },
  { id: 8, name: '通讯', icon: '📱' },
  { id: 9, name: '服装', icon: '👕' },
  { id: 10, name: '旅行', icon: '✈️' },
  { id: 11, name: '健身', icon: '💪' },
  { id: 12, name: '宠物', icon: '🐕' },
  { id: 13, name: '礼品', icon: '🎁' },
  { id: 14, name: '其他', icon: '📝' }
])

const selectedCategories = ref([1, 2, 3, 4])

// 获取国旗URL
const getFlagUrl = (flagCode) => {
  try {
    // 使用本地 src/images/w80 文件夹下的国旗PNG图片
    return new URL(`../images/w80/${flagCode.toLowerCase()}.png`, import.meta.url).href
  } catch (error) {
    console.warn(`Flag not found for ${flagCode}`)
    return ''
  }
}

// 选择语言
const selectLanguage = (languageCode) => {
  selectedLanguage.value = languageCode
  locale.value = languageCode
  localStorage.setItem('glestrex-language', languageCode)
}

// 导航方法
const nextStep = () => {
  if (currentStep.value < 5) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 跳过引导
const skipOnboarding = () => {
  completeOnboarding()
}

// 创建账户
const createAccount = async () => {
  if (!newAccount.value.name.trim()) {
    alert($t('onboarding.messages.accountCreateFailed'))
    return
  }
  
  try {
    const accountData = {
      name: newAccount.value.name,
      type: newAccount.value.type,
      unit: newAccount.value.currency, // 修复：使用unit字段而不是currency
      balance: parseFloat(newAccount.value.balance) || 0,
      includeInNetWorth: true,
      precision: 2,
      createdAt: new Date().toISOString() // 修复：添加创建时间
    }
    
    await databaseService.add('accounts', accountData)
    nextStep()
  } catch (error) {
    console.error('创建账户失败:', error)
    alert($t('onboarding.messages.accountCreateFailed'))
  }
}

// 切换分类选择
const toggleCategory = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(categoryId)
  }
}

// 设置分类
const setupCategories = async () => {
  try {
    // 创建选中的分类
    for (const categoryId of selectedCategories.value) {
      const category = expenseCategories.value.find(c => c.id === categoryId)
      if (category) {
        await databaseService.add('categories', {
          name: category.name,
          type: 'expense',
          icon: category.icon
        })
      }
    }
    
    // 添加一些基本的收入分类
    const incomeCategories = [
      { name: '工资', type: 'income', icon: '💰' },
      { name: '奖金', type: 'income', icon: '🎁' },
      { name: '投资', type: 'income', icon: '📈' },
      { name: '其他收入', type: 'income', icon: '💵' }
    ]
    
    for (const category of incomeCategories) {
      await databaseService.add('categories', category)
    }
    
    nextStep()
  } catch (error) {
    console.error('创建分类失败:', error)
    alert($t('onboarding.messages.categoryCreateFailed'))
  }
}

// 完成引导
const completeOnboarding = () => {
  localStorage.setItem('onboarding_completed', 'true')
  emit('complete')
}

// 初始化
onMounted(() => {
  // 设置初始语言
  const savedLanguage = localStorage.getItem('glestrex-language')
  if (savedLanguage) {
    selectedLanguage.value = savedLanguage
    locale.value = savedLanguage
  }
})
</script>

<style scoped>
.onboarding-overlay {
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
}

.onboarding-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.onboarding-step {
  padding: 40px;
  text-align: center;
}

.onboarding-step h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.onboarding-step h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 30px 0;
}

.language-title {
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin: 10px 0 0 0;
}

.language-selection {
  margin: 30px 0;
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 400px;
  margin: 0 auto;
}

.language-option {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.language-option:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
}

.language-option.selected {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.language-flag {
  width: 24px;
  height: 18px;
  margin-right: 15px;
  border-radius: 2px;
  object-fit: cover;
  border: 1px solid #ddd;
}

.language-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.language-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.language-check {
  font-size: 18px;
  color: #007bff;
  font-weight: bold;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.feature-card {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.feature-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.usage-steps {
  margin: 30px 0;
  text-align: left;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.usage-steps h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  text-align: center;
}

.usage-steps ol {
  padding-left: 20px;
}

.usage-steps li {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.account-form {
  max-width: 400px;
  margin: 0 auto 30px auto;
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.categories-section {
  margin: 30px 0;
  text-align: left;
}

.categories-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.category-item:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
}

.category-item.selected {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.category-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.category-name {
  font-size: 14px;
  color: #333;
  text-align: center;
}

.category-check {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 16px;
  color: #007bff;
  font-weight: bold;
}

.completion-content {
  max-width: 500px;
  margin: 0 auto;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.tips-section {
  margin: 30px 0;
  text-align: left;
}

.tips-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

.tips-list {
  padding-left: 20px;
}

.tips-list li {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
}

.step-actions .btn-back {
  margin-right: auto;
}

.step-actions-right {
  display: flex;
  gap: 8px;
}

.btn-skip,
.btn-back,
.btn-next,
.btn-finish {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-skip,
.btn-back {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-skip:hover,
.btn-back:hover {
  background: #e9ecef;
  border-color: #ccc;
}

.btn-next,
.btn-finish {
  background: #007bff;
  color: white;
}

.btn-next:hover,
.btn-finish:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.2s ease;
}

.step-dot.active {
  background: #007bff;
  transform: scale(1.2);
}

.step-dot.completed {
  background: #28a745;
}

@media (max-width: 768px) {
  .onboarding-container {
    width: 95%;
    margin: 20px;
  }
  
  .onboarding-step {
    padding: 30px 20px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .step-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .step-actions .btn-back {
    margin-right: 0;
    order: -1;
  }
  
  .step-actions-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>