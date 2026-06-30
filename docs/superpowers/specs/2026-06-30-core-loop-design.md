# 废物星人改造计划 · 核心闭环 MVP 设计

> 版本：v0.1.0
> 日期：2026-06-30
> 状态：草稿

## 1. 项目概述

**项目名称**：废物星人改造计划（Junkiverse）

**核心功能**：拍照抠图 → 2D 拼贴 → AI 生成角色立绘与故事

**MVP 目标**：用最短时间验证"用废品拼贴 + AI 生成角色"这个玩法是否有趣、用户是否愿意分享。

---

## 2. 技术选型

| 维度 | 选择 | 说明 |
|------|------|------|
| 平台 | 网页版 H5 | 手机浏览器直接用，不用下载，分享方便 |
| 抠图 | 前端 AI 模型 | @imgly/background-removal，本地运行，零成本零延迟 |
| 拼贴编辑器 | 自由画布 | Canvas API，支持拖动、缩放、旋转部件 |
| AI 生成 | 第三方 API | 绘画 + 文本生成，效果好 |
| 架构 | Spring Boot + 前端 | 后端代理 AI 调用，存储作品数据 |

**技术栈**：
- **前端**：HTML5 + CSS3 + Vanilla JS，Canvas API，@imgly/background-removal
- **后端**：Spring Boot 3.x + Java 17，MySQL / H2，RestTemplate

---

## 3. 系统架构

```
┌─────────────┐
│   前端 H5   │  拍照 / 抠图 / 拼贴
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────┐
│ Spring Boot │  AI 代理 / 作品存储
└──────┬──────┘
       │ API 调用
       ↓
┌─────────────┐  ┌─────────────┐
│ AI 绘画 API │  │ AI 文本 API │
└─────────────┘  └─────────────┘
```

---

## 4. 核心数据流

1. **用户拍照 / 上传图片** → 前端调用相机或文件选择
2. **前端 AI 抠图** → 浏览器端模型本地处理，零延迟零成本
3. **2D 自由拼贴** → Canvas 上拖动、缩放、旋转部件
4. **提交生成请求** → 导出拼贴图 + 部件信息，发送到后端
5. **后端调用 AI API** → 拼接 prompt，调用绘画和文本生成接口
6. **返回结果** → 返回角色立绘和档案故事

---

## 5. 页面流程

```
首页 → 拍照抠图 → 拼贴编辑 → 生成中 → 结果展示
```

### 5.1 首页 / 创作入口
- 产品介绍和核心玩法说明
- "开始创作"主按钮
- 最近作品入口（可选）

### 5.2 拍照 / 上传页
- 拍照或从相册选择图片
- AI 自动抠图（前端模型）
- 抠图结果预览，支持重拍
- 确认后进入拼贴

### 5.3 拼贴编辑器
- Canvas 自由画布
- 支持拖拽、缩放、旋转部件
- 可添加新部件（返回拍照页）
- 支持删除部件、调整图层顺序
- "生成角色"按钮提交到后端

### 5.4 生成加载页
- AI 生成中的加载动画
- 趣味文案提示（"废品星人正在觉醒..."）
- 完成后跳转到结果页

### 5.5 结果展示页
- 展示 AI 生成的角色立绘
- 展示角色档案故事卡片
- 保存图片到本地
- 一键分享到社交平台
- "再来一个"返回拍照页

---

## 6. 后端 API 设计

### 6.1 生成角色
```
POST /api/generate/character
Request:
{
  "collageImage": "base64或URL",
  "parts": [
    {"name": "瓶盖", "position": {...}, "rotation": 0}
  ]
}
Response:
{
  "id": "work-uuid",
  "status": "GENERATING"
}
```

### 6.2 查询生成结果
```
GET /api/generate/{id}
Response:
{
  "id": "work-uuid",
  "status": "DONE",
  "characterImage": "URL",
  "characterName": "瓶盖侠",
  "characterStory": "..."
}
```

### 6.3 保存作品
```
POST /api/works
Request: { "generateId": "work-uuid" }
Response: { "id": 1, "savedAt": "..." }
```

### 6.4 获取作品
```
GET /api/works/{id}
Response: { ... Work 完整对象 }
```

---

## 7. 数据模型

```java
@Entity
public class Work {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String collageImage;      // 拼贴图存储路径
    private String characterImage;    // AI 生成立绘 URL
    private String characterName;    // 角色名称
    private String characterStory;    // 档案故事
    private WorkStatus status;        // GENERATING / DONE / FAILED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

public enum WorkStatus {
    GENERATING, DONE, FAILED
}
```

---

## 8. AI Prompt 策略（MVP）

### 角色立绘
```
将以下废品部件组合成一个可爱的角色立绘：
部件列表：{parts}
风格：Q版插画，萌系，色彩鲜明
要求：保留部件的原始形状特征，背景简洁
```

### 档案故事
```
根据以下角色部件，生成一个有趣的"废物星人档案"：
角色名：{name}
部件：{parts}
要求：幽默风格，包含角色背景、性格特点、口头禅
字数：100-200字
```

---

## 9. MVP 发布目标

- **完成标准**：用户在手机上完成一次完整的"拍照→拼贴→生成→分享"闭环
- **发布方式**：静态托管（Vercel / Netlify），链接即可访问
- **核心指标**：完成率、分享率

---

## 10. 后续迭代方向（不在 MVP 范围内）

- 用户系统（注册/登录）
- 作品集和个人主页
- 社区功能（点赞、评论、关注）
- 素材库管理（历史抠图复用）
- AI 模型增强（自部署或更高质量 API）
