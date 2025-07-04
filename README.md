# 阅读记录管理

一个简洁美观的个人阅读记录管理网页应用，支持多平台使用。

## 功能特点

### 📚 书籍管理
- 添加新书籍（书名、作者、状态、简介）
- 编辑书籍信息
- 删除书籍
- 按状态筛选（未读、在读、已读）

### 📝 阅读记录
- 为每本书添加阅读记录
- 记录阅读进度和笔记
- 查看历史记录
- 删除记录

### 📊 统计功能
- 总书籍数量
- 在读书籍数量
- 已读书籍数量

### 💾 数据管理
- 本地存储（LocalStorage）
- 数据导出（JSON格式）
- 数据导入

### 📱 多平台支持
- 响应式设计，适配PC、平板、手机
- PWA支持，可安装到桌面和手机
- 离线使用

## 技术栈

- **前端**: 原生HTML、CSS、JavaScript
- **样式**: CSS3 + Flexbox + Grid
- **存储**: LocalStorage
- **PWA**: Service Worker + Web App Manifest

## 使用方法

### 本地运行

1. 克隆或下载项目
2. 使用本地服务器运行（推荐）：
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 使用Node.js
   npx serve .
   
   # 使用PHP
   php -S localhost:8000
   ```
3. 在浏览器中访问 `http://localhost:8000`

### 部署

项目是纯静态文件，可以部署到任何静态文件托管服务：

- GitHub Pages
- Netlify
- Vercel
- 阿里云OSS
- 腾讯云COS

## 项目结构

```
├── index.html          # 主页面
├── app.js             # 应用逻辑
├── manifest.json      # PWA配置
├── sw.js             # Service Worker
├── favicon.svg       # 网站图标
├── package.json      # 项目配置
└── README.md         # 说明文档
```

## 功能说明

### 添加书籍
1. 点击"添加书籍"按钮
2. 填写书名、作者等信息
3. 选择阅读状态
4. 保存

### 管理阅读记录
1. 在书籍卡片中点击"记录"查看历史记录
2. 点击"添加记录"新增阅读进度
3. 可以记录页数、章节或个人感想

### 数据备份
1. 点击"导出数据"下载JSON文件
2. 使用"导入数据"恢复备份

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 开发计划

- [ ] 书籍封面上传
- [ ] 阅读目标设置
- [ ] 阅读统计图表
- [ ] 标签分类
- [ ] 搜索功能
- [ ] 云端同步
- [ ] 社交分享

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License 