<template>
  <div class="details-page">
    <!-- 固定顶部栏 -->
    <div class="top-bar">
      <h1 class="page-title">{{ $t('nav.details') }}</h1>
    </div>



    <!-- 日历组件 -->
    <div class="calendar-section section">
      <h2 class="section-title">{{ $t('details.selectDate') }}</h2>
      <div class="calendar-container">
        <div class="calendar-header">
          <button @click="previousMonth" class="nav-button">
            <span>‹</span>
          </button>
          <h3 class="month-year">{{ currentMonthYear }}</h3>
          <button @click="nextMonth" class="nav-button">
            <span>›</span>
          </button>
        </div>
        
        <div class="calendar-grid">
          <div class="weekday-header">
            <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
          </div>
          
          <div class="calendar-days">
            <div 
              v-for="date in calendarDates" 
              :key="date.key"
              :class="[
                'calendar-day',
                {
                  'other-month': !date.isCurrentMonth,
                  'today': date.isToday,
                  'selected': date.isSelected,
                  'has-transactions': date.hasTransactions
                }
              ]"
              @click="selectDate(date)"
            >
              <span class="day-number">{{ date.day }}</span>
              <div v-if="date.hasTransactions" class="transaction-indicator">
                <span class="indicator-dot"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据统计概览 -->
    <div class="stats-overview section">
      <h2 class="section-title">{{ $t('details.dataOverview') }}</h2>
      <div class="stats-cards">
        <div class="stat-card">
          <IconComponent name="dollar-sign" class="stat-icon income" :size="24" />
          <div class="stat-content">
            <div class="stat-label">{{ $t('details.totalIncome') }}</div>
            <div class="stat-value income">¥{{ formatAmount(totalIncome) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <IconComponent name="trending-down" class="stat-icon expense" :size="24" />
          <div class="stat-content">
            <div class="stat-label">{{ $t('details.totalExpense') }}</div>
            <div class="stat-value expense">¥{{ formatAmount(totalExpense) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <IconComponent name="bar-chart-3" class="stat-icon balance" :size="24" />
          <div class="stat-content">
            <div class="stat-label">{{ $t('details.netAmount') }}</div>
            <div class="stat-value" :class="{ 'positive': netIncome >= 0, 'negative': netIncome < 0 }">
              ¥{{ formatAmount(netIncome) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section section">
      <h2 class="section-title">{{ $t('details.dataAnalysis') }}</h2>
      
      <!-- 收支趋势图 -->
      <div class="chart-container">
        <h3 class="chart-title">{{ $t('details.incomeExpenseTrend') }}</h3>
        <div ref="trendChartRef" class="chart"></div>
      </div>



      <!-- 账户余额图 -->
      <div class="chart-container">
        <h3 class="chart-title">{{ $t('details.accountBalance') }}</h3>
        <div ref="accountChartRef" class="chart"></div>
      </div>

      <!-- 月度统计图 -->
      <div class="chart-container">
        <h3 class="chart-title">{{ $t('details.monthlyStats') }}</h3>
        <div ref="monthlyChartRef" class="chart"></div>
      </div>


    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Line, Column, Area } from '@antv/g2plot'
import IconComponent from '../components/IconComponent.vue'
import transactionService from '../services/transactionService.js'
import databaseService from '../services/database.js'

const { t } = useI18n()
const router = useRouter()

// 响应式数据
const currentDate = ref(new Date())
const selectedDate = ref(null)
const transactions = ref([])
const accounts = ref([])
const categories = ref([])

// 图表引用
const trendChartRef = ref(null)
const accountChartRef = ref(null)
const monthlyChartRef = ref(null)

// 图表实例
let trendChart = null
let accountChart = null
let monthlyChart = null

// 日历相关计算属性
const currentMonthYear = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const monthNames = [
    t('datetime.months.january'), t('datetime.months.february'), t('datetime.months.march'),
    t('datetime.months.april'), t('datetime.months.may'), t('datetime.months.june'),
    t('datetime.months.july'), t('datetime.months.august'), t('datetime.months.september'),
    t('datetime.months.october'), t('datetime.months.november'), t('datetime.months.december')
  ]
  return `${monthNames[month]} ${year}`
})

const weekdays = computed(() => [
  t('datetime.weekdays.sun'), t('datetime.weekdays.mon'), t('datetime.weekdays.tue'),
  t('datetime.weekdays.wed'), t('datetime.weekdays.thu'), t('datetime.weekdays.fri'), t('datetime.weekdays.sat')
])

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // 使用统一的日期格式化方法
    const dateStr = formatDateForComparison(date)
    const hasTransactions = transactions.value.some(t => {
      const transactionDateStr = formatDateForComparison(t.date)
      return transactionDateStr === dateStr
    })
    
    dates.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      day: date.getDate(),
      date: date,
      dateStr: dateStr,
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDate(date, today),
      isSelected: selectedDate.value && isSameDate(date, selectedDate.value),
      hasTransactions: hasTransactions
    })
  }
  
  return dates
})



// 计算属性
const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const netIncome = computed(() => {
  return totalIncome.value - totalExpense.value
})

// 方法
const loadData = async () => {
  try {
    transactions.value = await transactionService.getAllTransactions()
    accounts.value = await databaseService.getAll('accounts')
    categories.value = await databaseService.getAll('categories')
    
    // 数据加载完成后初始化图表
    await nextTick()
    initCharts()
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 格式化金额
const formatAmount = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const selectDate = (dateObj) => {
  selectedDate.value = dateObj.date
  // 跳转到当日详情页面
  router.push({
    name: 'DailyDetails',
    query: { date: dateObj.dateStr }
  })
}

// 统一的日期格式化方法
const formatDateForComparison = (date) => {
  if (!date) return ''
  
  let targetDate
  if (typeof date === 'string') {
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date // 已经是YYYY-MM-DD格式
    }
    targetDate = new Date(date)
  } else if (date instanceof Date) {
    targetDate = new Date(date)
  } else {
    return ''
  }
  
  if (isNaN(targetDate.getTime())) {
    return ''
  }
  
  // 使用本地时区格式化
  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, '0')
  const day = String(targetDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 比较两个日期是否为同一天
const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false
  
  const d1 = date1 instanceof Date ? date1 : new Date(date1)
  const d2 = date2 instanceof Date ? date2 : new Date(date2)
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}



// 初始化图表
const initCharts = () => {
  initTrendChart()
  initAccountChart()
  initMonthlyChart()
}

// 收支趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  // 按日期聚合数据
  const dailyData = {}
  transactions.value.forEach(t => {
    const date = t.date
    if (!dailyData[date]) {
      dailyData[date] = { date, income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      dailyData[date].income += t.amount
    } else if (t.type === 'expense') {
      dailyData[date].expense += t.amount
    }
  })
  
  const data = Object.values(dailyData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30) // 显示最近30天
  
  // 转换为图表需要的格式
  const chartData = []
  data.forEach(item => {
    chartData.push(
      { date: item.date, value: item.income, type: '收入' },
      { date: item.date, value: item.expense, type: '支出' }
    )
  })
  
  if (trendChart) {
    trendChart.destroy()
  }
  
  trendChart = new Line(trendChartRef.value, {
    data: chartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#52c41a', '#ff4d4f'],
    point: {
      size: 3,
      shape: 'circle'
    },
    legend: {
      position: 'top'
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.type,
          value: `¥${formatAmount(datum.value)}`
        }
      }
    }
  })
  
  trendChart.render()
}



// 账户余额柱状图
const initAccountChart = () => {
  if (!accountChartRef.value || !accounts.value.length) return
  
  const data = accounts.value.map(account => ({
    account: account.name,
    balance: account.balance || 0
  }))
  
  if (accountChart) {
    accountChart.destroy()
  }
  
  accountChart = new Column(accountChartRef.value, {
    data,
    xField: 'account',
    yField: 'balance',
    color: '#1890ff',
    columnWidthRatio: 0.6,
    label: false,
    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.account,
          value: `¥${formatAmount(datum.balance)}`
        }
      }
    }
  })
  
  accountChart.render()
}

// 月度统计面积图
const initMonthlyChart = () => {
  if (!monthlyChartRef.value) return
  
  // 按月聚合数据
  const monthlyData = {}
  transactions.value.forEach(t => {
    const date = new Date(t.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0 }
    }
    
    if (t.type === 'income') {
      monthlyData[monthKey].income += t.amount
    } else if (t.type === 'expense') {
      monthlyData[monthKey].expense += t.amount
    }
  })
  
  const data = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12) // 显示最近12个月
  
  // 转换为图表需要的格式
  const chartData = []
  data.forEach(item => {
    chartData.push(
      { month: item.month, value: item.income, type: '收入' },
      { month: item.month, value: item.expense, type: '支出' }
    )
  })
  
  if (monthlyChart) {
    monthlyChart.destroy()
  }
  
  monthlyChart = new Area(monthlyChartRef.value, {
    data: chartData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    color: ['#52c41a', '#ff4d4f'],
    smooth: true,
    legend: {
      position: 'top'
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.type,
          value: `¥${formatAmount(datum.value)}`
        }
      }
    }
  })
  
  monthlyChart.render()
}



// 初始化数据库并加载数据
const initializeData = async () => {
  try {
    // 先初始化数据库
    await databaseService.init()
    
    // 等待一小段时间确保数据库完全初始化
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 然后加载数据
    await loadData()
    
    console.log('Details页面数据初始化完成')
  } catch (error) {
    console.error('初始化数据失败:', error)
    // 即使初始化失败，也要确保数组被初始化为空数组
    transactions.value = []
    accounts.value = []
    categories.value = []
  }
}

// 生命周期
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
/* 页面整体布局 */
.details-page {
  padding: 24px;
  padding-top: 120px; /* 为固定顶部栏留出空间 */
  padding-bottom: 120px; /* 为底部导航栏留出空间 */
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-secondary);
  min-height: 100vh;
}

/* 统计概览样式 */
.stats-overview {
  margin-bottom: 40px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-icon.income {
  background: linear-gradient(135deg, #52c41a, #73d13d);
}

.stat-icon.expense {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
}

.stat-icon.balance {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.stat-value.income {
  color: #52c41a;
}

.stat-value.expense {
  color: #ff4d4f;
}

.stat-value.positive {
  color: #52c41a;
}

.stat-value.negative {
  color: #ff4d4f;
}

/* 图表区域样式 */
.charts-section {
  margin-bottom: 40px;
}

.chart-container {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  text-align: center;
}

.chart {
  height: 300px;
  width: 100%;
}

/* 固定顶部栏 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: var(--top-bar-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 10px var(--shadow-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 52px;
  z-index: 1000;
}

.app-logo {
  height: 40px;
  width: auto;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
}

/* 通用区块样式 */
.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  text-align: center;
}

/* 日历组件样式 */
.calendar-container {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.nav-button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: bold;
}

.nav-button:hover {
  background: var(--hover-bg);
  transform: scale(1.05);
}

.month-year {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.calendar-grid {
  width: 100%;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  padding: 12px 8px;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 14px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-day {
  background: var(--card-bg);
  padding: 12px 8px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.calendar-day:hover {
  background: var(--hover-bg);
}

.calendar-day.other-month {
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
}

.calendar-day.today {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 600;
}

.calendar-day.selected {
  background: var(--active-bg);
  color: white;
}

.calendar-day.has-transactions {
  border: 2px solid var(--success-color);
}

.day-number {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.transaction-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  background: var(--success-color);
  border-radius: 50%;
  display: block;
}





/* 响应式设计 */
@media (max-width: 768px) {
  .details-page {
    padding: 20px;
  }
  
  .section {
    margin-bottom: 32px;
  }
  
  .section-title {
    font-size: 20px;
    margin-bottom: 16px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .chart-container {
    padding: 16px;
    margin-bottom: 20px;
  }
  
  .chart {
    height: 250px;
  }
  
  .chart-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
  
  .calendar-container {
    padding: 16px;
  }
  
  .calendar-header {
    margin-bottom: 16px;
  }
  
  .month-year {
    font-size: 18px;
  }
  
  .nav-button {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .calendar-day {
    min-height: 50px;
    padding: 8px 4px;
  }
  
  .day-number {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 16px;
  }
  
  .app-logo {
    height: 32px;
  }
  
  .top-bar {
    height: 56px;
  }
  
  .details-page {
    padding-top: 76px;
  }
  
  .weekday {
    padding: 8px 4px;
    font-size: 12px;
  }
  
  .calendar-day {
    min-height: 40px;
    padding: 6px 2px;
  }
  
  .day-number {
    font-size: 12px;
  }
  
  .indicator-dot {
    width: 4px;
    height: 4px;
  }
}
</style>