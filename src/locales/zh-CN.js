export default {
  // 通用
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    loading: '加载中...',
    noData: '暂无数据',
    success: '操作成功',
    error: '操作失败',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    close: '关闭',
    yes: '是',
    no: '否',
    created: '创建',
    noDescription: '无描述',
    reset: '重置',
    viewAll: '查看全部',
    warning: '警告',
    info: '信息',
    messages: {
      transactionSaved: '交易保存成功！',
      transactionUpdated: '交易更新成功！',
      transactionSaveFailed: '保存交易失败，请重试',
      transactionDeleted: '交易删除成功！',
      transactionDeleteFailed: '删除交易失败，请重试',
      clearDataFailed: '清空数据失败，请重试'
    }
  },

  // 计算器
  calculator: {
    title: '计算器',
    shortcutHint: 'Alt + C 打开/关闭计算器'
  },

  // 导航
  nav: {
    home: '首页',
    transactions: '交易',
    profile: '详情',
    settings: '个人',
    details: '详情'
  },

  // 首页
  home: {
    title: '首页',
    totalBalance: '总余额',
    recentTransactions: '交易记录',
    noTransactions: '暂无交易记录',
    viewAll: '查看全部',
    quickActions: '快捷操作',
    income: '收入',
    expense: '支出',
    transfer: '转账'
  },

  // 交易页面
  transactions: {
    title: '交易记录',
    addTransaction: '添加交易',
    editTransaction: '编辑交易',
    recentTransactions: '交易记录',
    allTransactions: '所有交易',
    filterBy: '筛选',
    sortBy: '排序',
    amount: '金额',
    description: '描述',
    category: '分类',
    account: '账户',
    date: '日期',
    download: '下载',
    copy: '复制',
    allTransactionsReport: '所有交易记录报告',
    type: {
      income: '收入',
      expense: '支出',
      transfer: '转账',
      borrow: '借入',
      repay: '还款',
      adjust: '调整'
    },
    form: {
      selectType: '选择交易类型',
      enterAmount: '输入金额',
      enterDescription: '输入描述',
      selectCategory: '选择分类',
      selectAccount: '选择账户',
      selectDate: '选择日期'
    },
    messages: {
      downloadSuccess: '交易记录下载成功！',
      downloadFailed: '下载失败，请重试',
      copySuccess: '交易记录已复制到剪贴板！',
      copyFailed: '复制失败，请重试',
      noTransactions: '暂无交易记录'
    }
  },

  // 资料页面
  profile: {
    title: '个人资料',
    accountManagement: '账户管理',
    accountOverview: '账户总览',
    accountUnit: '个账户',
    currentBalance: '当前余额',
    manageAccountInfo: '管理您的所有账户信息',
    details: '详情分析',
    manageDetails: '查看详细的财务分析和数据统计'
  },

  // 详情页面
  details: {
    title: '详情分析',
    calendar: '日历',
    selectDate: '选择日期查看详情',
    dailyOverview: '当日概览',
    dailyTransactions: '当日交易明细',
    accountBalances: '账户余额',
    exportData: '导出数据',
    copyToClipboard: '复制到剪贴板',
    exportToTxt: '导出为TXT',
    noTransactionsForDate: '该日期暂无交易记录',
    noAccountData: '暂无账户数据',
    totalIncome: '总收入',
    totalExpense: '总支出',
    netAmount: '净收入',
    transactionCount: '交易笔数',
    // 新增图表相关词条
    dataOverview: '数据概览',
    dataAnalysis: '数据分析',
    incomeExpenseTrend: '收支趋势',
    categoryDistribution: '支出分类分布',
    accountBalance: '账户余额',
    monthlyStats: '月度统计',
    cashFlowWaterfall: '资金流水瀑布图',
    calendar: {
      today: '今天',
      previousMonth: '上个月',
      nextMonth: '下个月',
      weekdays: {
        sun: '日',
        mon: '一',
        tue: '二',
        wed: '三',
        thu: '四',
        fri: '五',
        sat: '六'
      }
    },
    export: {
      filename: '财务数据_{date}',
      success: '数据导出成功！',
      failed: '数据导出失败，请重试',
      copySuccess: '数据已复制到剪贴板！',
      copyFailed: '复制失败，请重试'
    },
    messages: {
      dateSelected: '已选择日期：{date}',
      noDataForDate: '该日期暂无数据',
      loadingData: '正在加载数据...',
      dataLoadFailed: '数据加载失败，请重试'
    }
  },

  // Profile Page
  profile2: {
    accountOverview: '账户总览',
    accountUnit: '个账户',
    currentBalance: '当前余额',
    accountType: '账户类型',
    accountName: '账户名称',
    accountNumber: '账户号码',
    bankName: '银行名称',
    createDate: '创建日期',
    status: '状态',
    active: '活跃',
    inactive: '非活跃',
    cash: '现金',
    bankCard: '银行卡',
    creditCard: '信用卡',
    alipay: '支付宝',
    wechat: '微信',
    other: '其他'
  },

  // 设置页面
  settings: {
    title: '设置',
    general: '通用设置',
    theme: '主题',
    language: '语言',
    currency: '货币',
    notifications: '通知',
    backup: '备份',
    about: '关于',
    version: '版本',
    themeSystem: '跟随系统',
    themeLight: '浅色',
    themeDark: '深色',
    dataManagement: '数据管理',
    exportData: '导出数据',
    importData: '导入数据',
    clearAllData: '清空所有数据',
    confirmClearData: '确认清空数据',
    clearDataWarning: '此操作将删除所有交易记录、账户和分类数据，并恢复为默认设置。此操作不可撤销！',
    clearing: '清空中...',
    confirmClear: '确认清空',
    languageZhCN: '简体中文',
    languageEnUS: 'English',
    themeOptions: {
      system: '跟随系统',
      light: '浅色模式',
      dark: '深色模式'
    },
    languageOptions: {
      'zh-CN': '简体中文',
      'en-US': 'English'
    },
    messages: {
      exportSuccess: '数据导出成功！',
      exportFailed: '数据导出失败，请重试',
      importSuccess: '数据导入成功！页面将刷新以显示新数据',
      importFailed: '数据导入失败，请检查文件格式',
      confirmImport: '导入数据将覆盖现有所有数据，确定要继续吗？',
      clearDataFailed: '清空数据失败，请重试'
    }
  },

  // 账户管理
  accountManagement: {
    title: '账户管理',
    addAccount: '添加账户',
    editAccount: '编辑账户',
    deleteAccount: '删除账户',
    accountList: '账户列表',
    accountDetails: '账户详情',
    balance: '余额',
    transactions: '交易记录',
    unit: '单位',
    precision: '精度',
    decimalPlaces: '位小数',
    includeInNetWorth: '净资产',
    createAccount: '新建账户',
    accountName: '账户名称',
    accountNamePlaceholder: '请输入账户名称',
    accountType: '账户类型',
    currencyUnit: '货币单位',
    currencyUnitPlaceholder: '请选择货币单位',
    customCurrency: '或者添加自定义单位：',
    addCustom: '+ 自定义',
    cancel: '取消',
    unitCode: '单位代码',
    unitCodePlaceholder: '如：MYTOKEN',
    unitName: '单位名称',
    unitNamePlaceholder: '如：我的代币',
    addCustomUnit: '添加自定义单位',
    decimalPlaces: '小数位数',
    initialBalance: '期初余额',
    initialBalancePlaceholder: '请输入期初余额（可选）',
    includeInNetWorthLabel: '纳入净资产计算',
    includeInNetWorthHint: '勾选后，该账户余额将计入总净资产统计',
    saveChanges: '保存修改',
    createAccountBtn: '创建账户',
    netWorth: '净资产',
    currentBalance: '当前余额',
    created: '创建',
    yes: '是',
    no: '否',
    type: {
      cash: '现金账户',
      loan: '贷款账户',
      virtual: '虚拟资产'
    },
    typeDescriptions: {
      cash: '银行卡、现金、支付宝等',
      loan: '信用卡、花呗、借呗等',
      virtual: '游戏币、积分、里程等'
    },
    precisionOptions: {
      zero: '0位（整数）',
      two: '2位（常用货币）',
      three: '3位（贵金属）',
      six: '6位（以太坊）',
      eight: '8位（比特币）'
    },
    balanceHints: {
      cash: '正数表示可用资金，负数表示透支',
      loan: '正数表示预付款或可用额度，负数表示实际债务',
      virtual: '虚拟资产的当前数量'
    },
    currencyGroups: {
      fiat: '法定货币',
      crypto: '加密货币',
      precious: '贵金属',
      virtual: '虚拟资产',
      custom: '自定义单位'
    },
    messages: {
      accountCreated: '账户创建成功！',
      accountUpdated: '账户修改成功！',
      accountSaveFailed: '保存账户失败，请重试',
      accountDeleted: '账户删除成功！',
      accountDeleteFailed: '删除账户失败，请重试',
      deleteConfirm: '确定要删除账户"{name}"吗？此操作不可撤销！',
      deleteWithTransactions: '该账户存在交易记录，删除账户将同时删除所有相关交易记录。确定要继续吗？',
      customUnitRequired: '请填写完整的单位代码和名称',
      customUnitExists: '该单位代码已存在',
      customUnitAdded: '自定义单位 "{code} - {name}" 添加成功！',
      initialBalanceNote: '期初余额',
      downloadSuccess: '账户余额报告下载成功！',
      downloadFailed: '下载失败，请重试',
      copySuccess: '账户余额信息已复制到剪贴板！',
      copyFailed: '复制失败，请重试'
    },
    downloadBalances: '下载账户余额报告',
    copyBalances: '复制账户余额信息',
    download: '下载',
    copy: '复制'
  },

  // 表单验证
  validation: {
    required: '此字段为必填项',
    invalidAmount: '请输入有效金额',
    invalidEmail: '请输入有效邮箱',
    minLength: '最少需要 {min} 个字符',
    maxLength: '最多允许 {max} 个字符'
  },

  // 日期时间
  datetime: {
    today: '今天',
    yesterday: '昨天',
    thisWeek: '本周',
    thisMonth: '本月',
    thisYear: '今年',
    month: '月',
    months: {
      1: '1月',
      2: '2月',
      3: '3月',
      4: '4月',
      5: '5月',
      6: '6月',
      7: '7月',
      8: '8月',
      9: '9月',
      10: '10月',
      11: '11月',
      12: '12月',
      january: '一月',
      february: '二月',
      march: '三月',
      april: '四月',
      may: '五月',
      june: '六月',
      july: '七月',
      august: '八月',
      september: '九月',
      october: '十月',
      november: '十一月',
      december: '十二月'
    },
    weekdays: {
      sun: '日',
      mon: '一',
      tue: '二',
      wed: '三',
      thu: '四',
      fri: '五',
      sat: '六'
    }
  }
}