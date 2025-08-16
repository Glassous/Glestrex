# Glestrex - 个人财务管理应用

![Glestrex Logo](src/images/glestrexlogo+glestrex.png)

一个现代化的个人财务管理应用，基于 Vue 3 构建，提供直观的界面和强大的功能来帮助您管理个人财务。

## ✨ 主要功能

### 📊 财务概览
- **总余额显示**：实时显示所有账户的净资产总额
- **今日收支**：当日收入、支出和净收支统计
- **本月收支**：当月财务数据汇总
- **多币种支持**：支持不同货币单位的账户管理

### 💰 交易管理
- **多种交易类型**：
  - 收入记录
  - 支出记录
  - 账户间转账
  - 借入/还款
  - 余额调整
- **智能分类**：预设收入和支出分类，支持自定义
- **快速记账**：首页快捷操作，一键添加常用交易
- **交易搜索**：按类型、分类、账户、日期等条件筛选
- **批量操作**：支持导出和复制交易记录

### 🏦 账户管理
- **多账户支持**：银行卡、支付宝、微信、现金等
- **账户类型**：现金账户、虚拟账户、贷款账户
- **余额追踪**：实时更新账户余额
- **账户归档**：支持停用不常用的账户

### 📈 数据分析
- **可视化图表**：使用 G2Plot 提供丰富的数据可视化
  - 收支趋势图
  - 分类支出饼图
  - 账户余额分布
  - 月度收支对比
- **日历视图**：直观查看每日交易情况
- **统计报表**：详细的财务数据分析

### 🧮 内置计算器
- **浮动计算器**：可拖拽的计算器窗口
- **快捷键支持**：Alt + C 快速打开/关闭
- **表单集成**：在金额输入时直接使用计算器

### 🌍 国际化支持
- **多语言**：支持中文和英文
- **本地化**：日期、货币格式本地化显示

### 🎨 主题系统
- **多主题模式**：浅色、深色、跟随系统
- **响应式设计**：适配桌面和移动设备
- **现代化UI**：简洁美观的用户界面

## 🛠️ 技术栈

### 前端框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router 4** - 官方路由管理器
- **Pinia** - 现代化状态管理

### UI 和样式
- **CSS3** - 现代化样式设计
- **响应式布局** - 适配多种设备尺寸
- **主题系统** - 支持明暗主题切换

### 数据可视化
- **@antv/g2plot** - 专业的统计图表库

### 国际化
- **Vue I18n** - Vue.js 国际化插件

### 构建工具
- **Vite** - 下一代前端构建工具
- **@vitejs/plugin-vue** - Vue 单文件组件支持

### 数据存储
- **IndexedDB** - 浏览器本地数据库
- **LocalStorage** - 用户偏好设置存储

## 📁 项目结构

```
glestrex/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   │   ├── BaseButton.vue     # 基础按钮组件
│   │   ├── Calculator.vue     # 计算器组件
│   │   ├── FormInput.vue      # 表单输入组件
│   │   ├── FormSelect.vue     # 下拉选择组件
│   │   ├── FormTextarea.vue   # 文本域组件
│   │   ├── FormInputWithCalculator.vue  # 带计算器的输入组件
│   │   └── Tabbar.vue         # 底部导航栏
│   ├── views/              # 页面组件
│   │   ├── Home.vue           # 首页
│   │   ├── Transactions.vue   # 交易记录页
│   │   ├── Details.vue        # 数据详情页
│   │   ├── DailyDetails.vue   # 日详情页
│   │   ├── Profile.vue        # 个人资料页
│   │   ├── AccountManagement.vue  # 账户管理页
│   │   └── Settings.vue       # 设置页
│   ├── stores/             # 状态管理
│   │   ├── app.js             # 应用状态
│   │   ├── transaction.js     # 交易状态
│   │   ├── theme.js           # 主题状态
│   │   └── language.js        # 语言状态
│   ├── services/           # 业务服务
│   │   ├── database.js        # 数据库服务
│   │   └── transactionService.js  # 交易服务
│   ├── locales/            # 国际化文件
│   │   ├── zh-CN.js           # 中文语言包
│   │   ├── en-US.js           # 英文语言包
│   │   └── index.js           # 国际化配置
│   ├── router/             # 路由配置
│   ├── utils/              # 工具函数
│   ├── styles/             # 样式文件
│   └── images/             # 图片资源
├── docs/                   # 文档和示例数据
│   └── mock-data.json         # 模拟数据示例
├── package.json            # 项目依赖
├── vite.config.js          # Vite 配置
└── README.md               # 项目说明
```

## 🗄️ 数据库结构

应用使用 IndexedDB 作为本地数据库，包含以下数据表：

### accounts (账户表)
```javascript
{
  id: number,              // 主键，自增
  name: string,            // 账户名称
  type: string,            // 账户类型：'cash' | 'virtual' | 'loan'
  unit: string,            // 货币单位：'CNY' | 'USD' | 'EUR' 等
  precision: number,       // 小数位精度
  includeInNetWorth: boolean,  // 是否计入净资产
  archived: boolean,       // 是否已归档
  balance: number,         // 当前余额
  createdAt: string        // 创建时间
}
```

### transactions (交易表)
```javascript
{
  id: number,              // 主键，自增
  date: string,            // 交易日期 (YYYY-MM-DD)
  type: string,            // 交易类型：'income' | 'expense' | 'transfer' | 'borrow' | 'repay' | 'adjust'
  accountId: number,       // 主账户ID
  peerAccountId: number,   // 对方账户ID（转账时使用）
  toAccountId: number,     // 目标账户ID（转账时使用）
  categoryId: number,      // 分类ID
  amount: number,          // 交易金额
  description: string,     // 交易描述
  createdAt: string,       // 创建时间
  updatedAt: string        // 更新时间
}
```

### categories (分类表)
```javascript
{
  id: number,              // 主键，自增
  name: string,            // 分类名称
  type: string,            // 分类类型：'income' | 'expense'
  icon: string             // 分类图标（emoji）
}
```

## 🚀 快速开始

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
应用将在 `http://localhost:5173` 启动

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📱 使用指南

### 初次使用
1. **创建账户**：在个人页面添加您的银行卡、支付宝等账户
2. **设置分类**：系统已预设常用分类，您也可以自定义
3. **开始记账**：在首页使用快捷操作或在交易页面详细记录

### 快捷操作
- **Alt + C**：打开/关闭计算器
- **首页快捷按钮**：快速添加收入、支出、转账
- **表单中的计算器图标**：在金额输入时使用计算器

### 数据管理
- **导出数据**：在交易页面可以下载所有交易记录
- **数据备份**：定期导出数据作为备份
- **数据恢复**：可以通过导入功能恢复数据

## 🔧 配置说明

### 主题配置
- 支持浅色、深色、跟随系统三种模式
- 主题设置会自动保存到本地存储

### 语言配置
- 支持中文（zh-CN）和英文（en-US）
- 可在设置页面切换语言

### 数据精度
- 支持不同货币的小数位精度设置
- 默认人民币保留2位小数

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 开发规范
- 使用 Vue 3 Composition API
- 遵循 ESLint 代码规范
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [AntV G2Plot](https://g2plot.antv.vision/) - 专业的统计图表库
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库

---

**Glestrex** - 让财务管理变得简单而高效！ 💰✨