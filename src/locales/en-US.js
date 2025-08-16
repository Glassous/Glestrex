export default {
  // Common
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    noData: 'No Data',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    created: 'Created',
    noDescription: 'No Description',
    reset: 'Reset',
    viewAll: 'View All',
    clear: 'Clear',
    to: 'to',
    generatedAt: 'Generated at',
    totalRecords: 'Total records',
    messages: {
      transactionSaved: 'Transaction saved successfully!',
      transactionUpdated: 'Transaction updated successfully!',
      transactionSaveFailed: 'Failed to save transaction, please try again',
      transactionDeleted: 'Transaction deleted successfully!',
      transactionDeleteFailed: 'Failed to delete transaction, please try again',
      clearDataFailed: 'Failed to clear data, please try again'
    }
  },

  // Calculator
  calculator: {
    title: 'Calculator',
    shortcutHint: 'Alt + C to open/close calculator'
  },

  // Navigation
  nav: {
    home: 'Home',
    transactions: 'Transactions',
    profile: 'Profile',
    settings: 'Settings',
    details: 'Details'
  },

  // Home Page
  home: {
    title: 'Home',
    totalBalance: 'Total Balance',
    recentTransactions: 'Transaction Records',
    noTransactions: 'No transactions yet',
    viewAll: 'View All',
    quickActions: 'Quick Actions',
    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer'
  },

  // Transactions Page
  transactions: {
    title: 'Transactions',
    addTransaction: 'Add Transaction',
    download: 'Download',
    copy: 'Copy',
    allTransactionsReport: 'All Transactions Report',
    editTransaction: 'Edit Transaction',
    recentTransactions: 'Recent Transactions',
    allTransactions: 'All Transactions',
    filterBy: 'Filter By',
    sortBy: 'Sort By',
    amount: 'Amount',
    description: 'Description',
    category: 'Category',
    account: 'Account',
    targetAccount: 'Target Account',
    date: 'Date',
    records: 'records',
    noTransactions: 'No transactions yet',
    filters: {
      dateRange: 'Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      category: 'Category Filter',
      allCategories: 'All Categories',
      type: 'Type Filter',
      allTypes: 'All Types'
    },
    type: {
      title: 'Transaction Type',
      income: 'Income',
      expense: 'Expense',
      transfer: 'Transfer',
      borrow: 'Borrow',
      repay: 'Repay',
      adjust: 'Adjust'
    },
    form: {
      selectType: 'Select Transaction Type',
      enterAmount: 'Enter Amount',
      enterDescription: 'Enter Description',
      selectCategory: 'Select Category',
      selectAccount: 'Select Account',
      selectDate: 'Select Date'
    },
    recent: 'Recent Transactions',
    edit: 'Edit',
    delete: 'Delete',
    messages: {
      downloadSuccess: 'Transaction records downloaded successfully!',
      downloadFailed: 'Download failed, please try again',
      copySuccess: 'Transaction records copied to clipboard!',
      copyFailed: 'Copy failed, please try again',
      noTransactions: 'No transaction records available'
    }
  },

  // Profile Page
  profile: {
    title: 'Profile',
    accountManagement: 'Account Management',
    accountOverview: 'Account Overview',
    accountUnit: 'accounts',
    currentBalance: 'Current Balance',
    manageAccountInfo: 'Manage all your account information',
    details: 'Details Analysis',
    manageDetails: 'View detailed financial analysis and data statistics'
  },

  // Details Page
  details: {
    title: 'Details Analysis',
    calendar: 'Calendar',
    selectDate: 'Select a date to view details',
    dailyOverview: 'Daily Overview',
    dailyTransactions: 'Daily Transaction Details',
    accountBalances: 'Account Balances',
    exportData: 'Export Data',
    copyToClipboard: 'Copy to Clipboard',
    exportToTxt: 'Export as TXT',
    noTransactionsForDate: 'No transactions for this date',
    noAccountData: 'No account data available',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    netAmount: 'Net Income',
    transactionCount: 'Transaction Count',
    // New chart-related terms
    dataOverview: 'Data Overview',
    dataAnalysis: 'Data Analysis',
    incomeExpenseTrend: 'Income & Expense Trend',
    categoryDistribution: 'Expense Category Distribution',
    accountBalance: 'Account Balance',
    monthlyStats: 'Monthly Statistics',
    cashFlowWaterfall: 'Cash Flow Waterfall Chart',
    calendar: {
      today: 'Today',
      previousMonth: 'Previous Month',
      nextMonth: 'Next Month',
      weekdays: {
        sun: 'Sun',
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat'
      }
    },
    export: {
      filename: 'Financial_Data_{date}',
      success: 'Data exported successfully!',
      failed: 'Data export failed, please try again',
      copySuccess: 'Data copied to clipboard!',
      copyFailed: 'Copy failed, please try again'
    },
    messages: {
      dateSelected: 'Date selected: {date}',
      noDataForDate: 'No data available for this date',
      loadingData: 'Loading data...',
      dataLoadFailed: 'Data loading failed, please try again'
    }
  },

  // Profile Page
  profile2: {
    accountOverview: 'Account Overview',
    accountUnit: 'accounts',
    currentBalance: 'Current Balance',
    accountType: 'Account Type',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    bankName: 'Bank Name',
    createDate: 'Create Date',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    cash: 'Cash',
    bankCard: 'Bank Card',
    creditCard: 'Credit Card',
    alipay: 'Alipay',
    wechat: 'WeChat',
    other: 'Other'
  },

  // Settings Page
  settings: {
    title: 'Settings',
    general: 'General Settings',
    theme: 'Theme',
    language: 'Language',
    currency: 'Currency',
    notifications: 'Notifications',
    backup: 'Backup',
    about: 'About',
    version: 'Version',
    themeSystem: 'Follow System',
    themeLight: 'Light',
    themeDark: 'Dark',
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    importData: 'Import Data',
    clearAllData: 'Clear All Data',
    confirmClearData: 'Confirm Clear Data',
    clearDataWarning: 'This operation will delete all transaction records, accounts and category data, and restore to default settings. This operation cannot be undone!',
    clearing: 'Clearing...',
    confirmClear: 'Confirm Clear',
    languageZhCN: 'Simplified Chinese',
    languageEnUS: 'English',
    themeOptions: {
      system: 'Follow System',
      light: 'Light Mode',
      dark: 'Dark Mode'
    },
    languageOptions: {
      'zh-CN': '简体中文',
      'en-US': 'English'
    },
    messages: {
      exportSuccess: 'Data exported successfully!',
      exportFailed: 'Data export failed, please try again',
      importSuccess: 'Data imported successfully! Page will refresh to show new data',
      importFailed: 'Data import failed, please check file format',
      confirmImport: 'Importing data will overwrite all existing data. Are you sure you want to continue?',
      clearDataFailed: 'Failed to clear data, please try again'
    }
  },

  // Account Management
  accountManagement: {
    title: 'Account Management',
    addAccount: 'Add Account',
    editAccount: 'Edit Account',
    deleteAccount: 'Delete Account',
    accountList: 'Account List',
    accountDetails: 'Account Details',
    balance: 'Balance',
    transactions: 'Transactions',
    unit: 'Unit',
    precision: 'Precision',
    decimalPlaces: 'Decimal Places',
    includeInNetWorth: 'Include in Net Worth',
    createAccount: 'Create Account',
    accountName: 'Account Name',
    accountNamePlaceholder: 'Enter account name',
    accountType: 'Account Type',
    currencyUnit: 'Currency Unit',
    currencyUnitPlaceholder: 'Select currency unit',
    customCurrency: 'Or add custom unit:',
    addCustom: '+ Custom',
    cancel: 'Cancel',
    unitCode: 'Unit Code',
    unitCodePlaceholder: 'e.g.: MYTOKEN',
    unitName: 'Unit Name',
    unitNamePlaceholder: 'e.g.: My Token',
    addCustomUnit: 'Add Custom Unit',
    decimalPlaces: 'Decimal Places',
    initialBalance: 'Initial Balance',
    initialBalancePlaceholder: 'Enter initial balance (optional)',
    includeInNetWorthLabel: 'Include in Net Worth Calculation',
    includeInNetWorthHint: 'When checked, this account balance will be included in total net worth statistics',
    saveChanges: 'Save Changes',
    createAccountBtn: 'Create Account',
    netWorth: 'Net Worth',
    currentBalance: 'Current Balance',
    created: 'Created',
    yes: 'Yes',
    no: 'No',
    type: {
      cash: 'Cash Account',
      loan: 'Loan Account',
      virtual: 'Virtual Asset'
    },
    typeDescriptions: {
      cash: 'Bank cards, cash, Alipay, etc.',
      loan: 'Credit cards, Huabei, Jiebei, etc.',
      virtual: 'Game coins, points, miles, etc.'
    },
    precisionOptions: {
      zero: '0 digits (integer)',
      two: '2 digits (common currency)',
      three: '3 digits (precious metals)',
      six: '6 digits (Ethereum)',
      eight: '8 digits (Bitcoin)'
    },
    balanceHints: {
      cash: 'Positive for available funds, negative for overdraft',
      loan: 'Positive for prepayment or available credit, negative for actual debt',
      virtual: 'Current amount of virtual assets'
    },
    currencyGroups: {
      fiat: 'Fiat Currency',
      crypto: 'Cryptocurrency',
      precious: 'Precious Metals',
      virtual: 'Virtual Assets',
      custom: 'Custom Units'
    },
    messages: {
      accountCreated: 'Account created successfully!',
      accountUpdated: 'Account updated successfully!',
      accountSaveFailed: 'Failed to save account, please try again',
      accountDeleted: 'Account deleted successfully!',
      accountDeleteFailed: 'Failed to delete account, please try again',
      deleteConfirm: 'Are you sure you want to delete account "{name}"? This action cannot be undone!',
      deleteWithTransactions: 'This account has transaction records. Deleting the account will also delete all related transaction records. Are you sure you want to continue?',
      customUnitRequired: 'Please fill in complete unit code and name',
      customUnitExists: 'This unit code already exists',
      customUnitAdded: 'Custom unit "{code} - {name}" added successfully!',
      initialBalanceNote: 'Initial Balance',
      downloadSuccess: 'Account balance report downloaded successfully!',
      downloadFailed: 'Download failed, please try again',
      copySuccess: 'Account balance information copied to clipboard!',
      copyFailed: 'Copy failed, please try again'
    },
    downloadBalances: 'Download Account Balance Report',
    copyBalances: 'Copy Account Balance Information',
    download: 'Download',
    copy: 'Copy'
  },

  // Form Validation
  validation: {
    required: 'This field is required',
    invalidAmount: 'Please enter a valid amount',
    invalidEmail: 'Please enter a valid email',
    minLength: 'Minimum {min} characters required',
    maxLength: 'Maximum {max} characters allowed'
  },

  // Date and Time
  datetime: {
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    month: 'Month',
    months: {
      1: 'Jan',
      2: 'Feb',
      3: 'Mar',
      4: 'Apr',
      5: 'May',
      6: 'Jun',
      7: 'Jul',
      8: 'Aug',
      9: 'Sep',
      10: 'Oct',
      11: 'Nov',
      12: 'Dec',
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December'
    },
    weekdays: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat'
    }
  }
}