# 个人博客

这是一个个人博客项目，计划使用前后端分离开发，部署在vercel上。

（因为github pages与router的history有兼容问题，部署未成功）

前端框架：vue3+ElementPlus+Ts+axios

后端框架：maven+Springboot+Mybatis

计划实现功能
- [x] 基本博客功能
    - [x] 前端
        - [x] 基本布局
        - [x] css动画
    - [ ] 后端
        - [ ] 登录管理
        - [ ] admin上传md直接发布？
- [ ] 用户登录后可评论
- [ ] AI接口
- [ ] 每日~~新鲜事~~bug
- [ ] 同步flowus笔记

# 使用教程

## 前端部分

前端位于frontend文件夹里，将文章和图片文件夹放在@/src/posts里就可以正常展示博文内容了，注意命名需要和markdown标头内容里的slug项一样。

### 安装依赖

首先，确保你已经安装了 Node.js 和 npm。然后在终端中导航到 `frontend` 文件夹，并运行以下命令来安装依赖：

```bash
cd frontend
npm install --legacy-peer-deps
```

### 运行开发服务器

安装依赖后，可以运行以下命令来启动开发服务器：
```bash
npm run dev
```

### 构建项目
如果你准备将项目部署到生产环境，可以运行以下命令来构建项目：
```bash
npm run build
```

