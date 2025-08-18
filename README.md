# Glestrex

一个现代化的Vue.js移动端应用，支持Web和Android平台。

## 功能特性

### 核心功能
- 🏠 **主页面** - 直观的用户界面和导航
- 💰 **交易管理** - 完整的交易记录和管理功能
- 👤 **账户管理** - 用户账户信息管理
- ⚙️ **设置中心** - 个性化设置和配置选项

### 用户体验
- 🎯 **新手引导** - 内置的用户引导系统，帮助新用户快速上手
- 🌍 **多语言支持** - 支持中文简体和英文
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 🎨 **现代化UI** - 简洁美观的用户界面

### 平台支持
- 🌐 **Web应用** - 基于Vue.js的现代Web应用
- 📱 **Android应用** - 原生Android应用支持
- 🔄 **跨平台** - 一套代码，多平台运行

## 技术栈

### 前端技术
- **Vue.js 3** - 渐进式JavaScript框架
- **Vue Router** - 官方路由管理器
- **Vite** - 现代化构建工具
- **CSS3** - 现代样式设计

### 移动端技术
- **Capacitor** - 跨平台移动应用开发框架
- **Android SDK** - Android原生开发支持
- **Cordova插件** - 丰富的移动端功能插件

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Git** - 版本控制

## 项目结构

```
glestrex/
├── src/                          # 源代码目录
│   ├── components/               # Vue组件
│   │   └── OnboardingGuide.vue  # 新手引导组件
│   ├── views/                   # 页面视图
│   │   ├── Home.vue            # 主页
│   │   ├── Transactions.vue    # 交易页面
│   │   ├── AccountManagement.vue # 账户管理
│   │   └── Settings.vue        # 设置页面
│   ├── locales/                # 国际化文件
│   │   ├── zh-CN.js           # 中文语言包
│   │   └── en-US.js           # 英文语言包
│   └── App.vue                 # 根组件
├── android/                    # Android项目
│   ├── app/                   # Android应用
│   │   ├── src/main/java/com/glassous/glestrex/
│   │   │   └── MainActivity.java # Android主活动
│   │   └── src/main/res/      # Android资源文件
│   └── ...                    # 其他Android配置
├── public/                    # 静态资源
├── index.html                # 入口HTML文件
├── package.json              # 项目依赖配置
└── README.md                # 项目说明文档
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- Android Studio (用于Android开发)
- Java JDK >= 11 (用于Android构建)

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd glestrex

# 安装依赖
npm install
```

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 应用将在 http://localhost:5173 运行
```

### 构建项目

```bash
# 构建Web版本
npm run build

# 预览构建结果
npm run preview
```

### Android开发

```bash
# 同步Android项目
npx cap sync android

# 在Android Studio中打开项目
npx cap open android

# 或直接运行Android应用
npx cap run android
```

## 新手引导

应用内置了完整的新手引导系统：

1. **欢迎页面** - 介绍应用主要功能
2. **功能导览** - 逐步介绍各个功能模块
3. **操作指导** - 手把手教学常用操作
4. **设置向导** - 帮助用户完成初始设置

新用户首次打开应用时会自动触发引导流程，也可以在设置中重新查看。

## 多语言支持

应用支持以下语言：
- 🇨🇳 中文简体 (zh-CN)
- 🇺🇸 English (en-US)

语言切换可在设置页面进行，系统会自动保存用户的语言偏好。

## 开发指南

### 添加新页面

1. 在 `src/views/` 目录下创建新的Vue组件
2. 在路由配置中添加对应路由
3. 更新导航菜单（如需要）

### 添加新语言

1. 在 `src/locales/` 目录下创建新的语言文件
2. 按照现有格式添加翻译内容
3. 在语言配置中注册新语言

### 自定义主题

应用支持主题自定义，可以通过修改CSS变量来调整：
- 主色调
- 辅助色
- 字体样式
- 间距规范

## 部署

### Web部署

```bash
# 构建生产版本
npm run build

# 将 dist/ 目录部署到Web服务器
```

### Android发布

1. 在Android Studio中打开项目
2. 配置签名密钥
3. 构建发布版APK或AAB
4. 发布到Google Play Store或其他应用商店

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue: [GitHub Issues](https://github.com/your-username/glestrex/issues)
- 邮箱: yongyanye614@gmail.com

## 更新日志

### v2.0.0 (当前版本)
- ✨ 新增新手引导系统
- 📱 添加Android平台支持
- 🌍 实现多语言国际化
- 🎨 优化用户界面设计
- ⚡ 提升应用性能

### v1.0.0
- 🎉 初始版本发布
- 🏠 基础页面功能
- 💰 交易管理功能
- 👤 账户管理功能

---

**Glestrex** - 让财务管理更简单 💫