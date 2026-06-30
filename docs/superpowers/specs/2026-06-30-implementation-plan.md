# 废物星人改造计划 · 核心闭环 MVP 实施计划

> 版本：v0.1.0
> 日期：2026-06-30
> 参考设计：2026-06-30-core-loop-design.md

---

## 1. 项目结构

```
junkiverse/
├── frontend/                    # 前端 H5 单页应用
│   ├── index.html              # 入口页面
│   ├── css/
│   │   └── main.css            # 主样式
│   ├── js/
│   │   ├── app.js              # 主应用逻辑
│   │   ├── camera.js           # 拍照/相册功能
│   │   ├── background-remover.js # 抠图功能
│   │   ├── canvas-editor.js    # 拼贴编辑器
│   │   └── api.js              # 后端 API 调用
│   └── assets/
│       └── images/             # 静态图片资源
│
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/junkiverse/
│   │   ├── JunkiverseApplication.java
│   │   ├── controller/
│   │   │   └── GenerateController.java
│   │   ├── service/
│   │   │   ├── GenerateService.java
│   │   │   └── AiApiService.java
│   │   ├── repository/
│   │   │   └── WorkRepository.java
│   │   ├── entity/
│   │   │   ├── Work.java
│   │   │   └── WorkStatus.java
│   │   ├── dto/
│   │   │   ├── GenerateRequest.java
│   │   │   └── GenerateResponse.java
│   │   └── config/
│   │       └── WebConfig.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
│
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-06-30-core-loop-design.md
│
└── README.md
```

---

## 2. 实施步骤

### 阶段一：后端基础设施（1-2 天）

#### 2.1 初始化 Spring Boot 项目
- [ ] 创建 Maven 项目，配置 pom.xml
- [ ] 引入依赖：Spring Web, Spring Data JPA, MySQL Driver, Lombok
- [ ] 配置 application.yml（数据库连接、端口）
- [ ] 启动验证

#### 2.2 数据层
- [ ] 创建 Work 实体类
- [ ] 创建 WorkRepository
- [ ] 配置 H2 数据库（MVP 阶段）或 MySQL
- [ ] 编写单元测试

#### 2.3 API 层
- [ ] 创建 GenerateController
  - POST /api/generate/character
  - GET /api/generate/{id}
  - POST /api/works
  - GET /api/works/{id}
- [ ] 创建 DTO 类
- [ ] 配置跨域（CORS）

#### 2.4 AI 服务层（Mock）
- [ ] 创建 AiApiService（先写 Mock 实现）
- [ ] 定义 AI Prompt 模板
- [ ] 实现异步生成（Future/CompletableFuture）

---

### 阶段二：前端基础设施（1-2 天）

#### 2.5 项目初始化
- [ ] 创建 frontend 目录结构
- [ ] 创建 index.html（5 个页面的容器）
- [ ] 引入 CSS 样式

#### 2.6 页面框架
- [ ] 实现 SPA 路由（简单的 hash 路由）
- [ ] 创建 5 个页面组件：首页、拍照页、编辑器页、加载页、结果页
- [ ] 实现页面切换动画

#### 2.7 API 调用层
- [ ] 创建 api.js，封装 fetch 调用
- [ ] 配置后端 API 地址
- [ ] 处理加载状态和错误

---

### 阶段三：核心功能实现（2-3 天）

#### 2.8 拍照/上传功能
- [ ] 实现相机调用（navigator.mediaDevices）
- [ ] 实现相册选择（input type=file）
- [ ] 图片预览和裁剪

#### 2.9 抠图功能
- [ ] 集成 @imgly/background-removal
- [ ] 实现抠图进度显示
- [ ] 抠图结果预览和调整
- [ ] 导出透明背景 PNG

#### 2.10 拼贴编辑器
- [ ] 实现 Canvas 基础画布
- [ ] 实现部件拖拽（mousedown/mousemove/mouseup）
- [ ] 实现部件缩放和旋转
- [ ] 实现图层管理（上移/下移/删除）
- [ ] 导出拼贴图为 base64

#### 2.11 AI 生成对接
- [ ] 实现生成请求发送
- [ ] 实现结果轮询
- [ ] 实现加载动画
- [ ] 对接真实 AI API（或继续 Mock）

#### 2.12 结果展示
- [ ] 展示角色立绘
- [ ] 展示档案故事卡片
- [ ] 实现保存图片功能
- [ ] 实现分享功能（Web Share API 或复制链接）

---

### 阶段四：收尾（1 天）

#### 2.13 联调测试
- [ ] 前后端联调
- [ ] 移动端适配测试
- [ ] 异常场景测试（网络断开、AI 超时等）

#### 2.14 部署准备
- [ ] 前端构建优化
- [ ] 后端 Docker 化（或简单 JAR 部署）
- [ ] 配置域名和 HTTPS

---

## 3. 任务清单

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|------|------|--------|----------|------|
| 1 | 初始化 Spring Boot 项目 | P0 | 0.5d | ⬜ |
| 2 | 数据层（Work 实体 + Repository） | P0 | 0.5d | ⬜ |
| 3 | API Controller 实现 | P0 | 0.5d | ⬜ |
| 4 | 前端项目初始化 | P0 | 0.5d | ⬜ |
| 5 | SPA 路由和页面框架 | P0 | 0.5d | ⬜ |
| 6 | 拍照/上传功能 | P0 | 0.5d | ⬜ |
| 7 | 抠图功能（@imgly） | P0 | 1d | ⬜ |
| 8 | Canvas 拼贴编辑器 | P0 | 1.5d | ⬜ |
| 9 | AI 生成对接 | P0 | 1d | ⬜ |
| 10 | 结果展示页 | P0 | 0.5d | ⬜ |
| 11 | 分享功能 | P1 | 0.5d | ⬜ |
| 12 | 联调测试 | P0 | 1d | ⬜ |
| 13 | 部署上线 | P0 | 0.5d | ⬜ |

**总计：约 9.5 个工作日**

---

## 4. AI API 接入说明

MVP 阶段建议先接入国内性价比高的 AI 服务：

### 图片生成
- **文心一格**：百度出品，中文理解好
- **通义万相**：阿里云出品
- **Midjourney API**：效果最好但成本高

### 文本生成
- **文心一言**：百度
- **通义千问**：阿里
- **GPT-3.5**：OpenAI

### 接入建议
1. 先用免费额度或低价套餐测试
2. 实现 AI 服务抽象层，方便后续切换
3. 添加重试机制和降级策略

---

## 5. 注意事项

1. **移动端优先**：全程用手机测试，Canvas 触摸事件要处理好
2. **渐进增强**：如果 @imgly 模型加载慢，可以先做手动抠图降级
3. **性能优化**：Canvas 操作注意离屏渲染，大图要压缩
4. **错误处理**：AI 调用失败要给用户友好提示，支持重试

---

## 6. 下一步行动

建议按以下顺序开始：

1. **今天**：搭建 Spring Boot 项目骨架，跑通 REST API
2. **明天**：搭建前端项目骨架，实现页面跳转
3. **后天**：实现拍照和抠图功能
4. **大后天**：实现拼贴编辑器
5. **第五天**：对接 AI 生成

准备好了就开始吧！
