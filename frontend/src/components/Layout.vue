<template>
  <html>
  <el-container :class="{'dark-mode': isDarkMode}" class="layout-container">
    <el-header>
      <el-row type="flex" justify="center" align="middle">
        <el-col :span="leftColSpan"></el-col> <!-- 左侧空列 -->
        <el-col :span="mainColSpan">
          <div class="header-content">

            
            <h1 class="blog-title" @click="goHome(true)">Skyper's Blog</h1>
            <a href="https://github.com/herbertskyper" target="_blank" class="github-link">
              <el-icon><Icon icon="mdi:github" /></el-icon>
            </a>

            <div v-if="isWideEnough" class="nav-links">
              <router-link to="/home" class="nav-link" :class="{ 'active': activeIndex === '1' }" @click="navigateAndRefresh('/home', '1')">
                <el-icon><HomeFilled /></el-icon>
                  首页
              </router-link>
              <router-link to="/tags" class="nav-link" :class="{ 'active': activeIndex === '2' }" @click="navigateAndRefresh('/tags', '2')">
                <el-icon><Collection /></el-icon>
                  标签
              </router-link>
              <router-link to="/about" class="nav-link" :class="{ 'active': activeIndex === '3' }" @click="navigateAndRefresh('/about', '3')">
                <el-icon><InfoFilled /></el-icon>
                  关于
              </router-link>
              <router-link to="/search" class="nav-link" :class="{ 'active': activeIndex === '4' }" @click="navigateAndRefresh('/search', '4')">
                <el-icon><Search /></el-icon>
                  搜索
              </router-link>
              <div class="nav-link" :class="{ 'active': activeIndex === '5' }" @click="toggleTheme">
                <el-icon v-if="isDarkMode" class="theme-icon"><Icon icon="mdi:weather-sunny" /></el-icon>
                <el-icon v-else class="theme-icon"><Icon icon="mdi:weather-night" /></el-icon>
              </div>
              <router-link to="/language" class="nav-link disabled" :class="{ 'active': activeIndex === '6' }">
                <el-icon class="theme-icon"><Icon icon="mdi:translate" /></el-icon>
              </router-link>
            </div>
            <el-button v-else type="primary" class="drawer-button"  @click="drawerVisible = true">
              <el-icon class="theme-icon"><Icon icon="mdi:menu"/></el-icon>
            </el-button>
          </div>
        </el-col>
        <el-col :span="rightColSpan"></el-col> <!-- 右侧空列 -->
      </el-row>
    </el-header>
    <el-main>
      <el-row>
        <el-col :span="leftColSpan"></el-col> <!-- 左侧空列 -->
        <el-col :span="mainColSpan">
          <div class="content-container">
            <slot></slot> <!-- 内容居中 -->
          </div>
        </el-col>
        <el-col :span="rightColSpan">
          <div v-if="isWideEnough" class="toc-container">
            <slot name="toc-content"></slot>
            <el-backtop :right="100" :bottom="100" />
          </div>
        </el-col> <!-- 右侧空列 -->
      </el-row>
    </el-main>
    <el-footer>
      <el-row type="flex" justify="center" align="top">
        <el-col :span="leftColSpan"></el-col> <!-- 左侧空列 -->
        <el-col :span="mainColSpan" class="footer-content">
          <p>© 2025 Skyper's Blog  |  All rights reserved.</p>
          <p><a href="https://vuejs.org/" target="_blank" class="no-visited">Powered by Vue.js</a></p>
        </el-col>
        <el-col :span="rightColSpan"></el-col> <!-- 右侧空列 -->
      </el-row>
    </el-footer>
    <el-drawer v-model="drawerVisible" direction="ltr" size="50%">
      <div class="nav-links-drawer">
        <div class="avatar-container">
          <a href="https://github.com/herbertskyper" target="_blank">
            <el-avatar src="/profile.png" :size="90"></el-avatar>
          </a>
        </div>
        <router-link to="/home" class="nav-link-drawer" :class="{ 'active': activeIndex === '1' }" @click="navigateAndRefresh('/home', '1')">
          <el-icon class="drawer-icon"><HomeFilled /></el-icon>
          首页
        </router-link>
        <router-link to="/tags" class="nav-link-drawer" :class="{ 'active': activeIndex === '2' }" @click="navigateAndRefresh('/tags', '2')">
          <el-icon class="drawer-icon"><Collection /></el-icon>
          标签
        </router-link>
        <router-link to="/about" class="nav-link-drawer" :class="{ 'active': activeIndex === '3' }" @click="navigateAndRefresh('/about', '3')">
          <el-icon class="drawer-icon"><InfoFilled /></el-icon>
          关于
        </router-link>
        <router-link to="/search" class="nav-link-drawer" :class="{ 'active': activeIndex === '4' }" @click="navigateAndRefresh('/search', '4')">
          <el-icon class="drawer-icon"><Search /></el-icon>
          搜索
        </router-link>

        <div class="nav-link-drawer-container">
          <div class="nav-link-drawer" @click="toggleTheme">
            <el-icon v-if="isDarkMode" class="theme-icon"><Icon icon="mdi:weather-sunny" /></el-icon>
            <el-icon v-else class="theme-icon"><Icon icon="mdi:weather-night" /></el-icon>
          </div>
          <router-link to="/language" class="nav-link-drawer disabled">
            <el-icon class="theme-icon"><Icon icon="mdi:translate" /></el-icon>
          </router-link>
        </div>
        
      </div>
    </el-drawer>
    
  </el-container></html>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import 'element-plus/dist/index.css'
import { HomeFilled, Collection, InfoFilled, Search, Menu, Edit } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { useDark, useToggle } from '@vueuse/core'

export default defineComponent({
  name: 'Layout',
  components: {
    HomeFilled,
    Collection,
    InfoFilled,
    Search,
    Menu,
    Icon
  },
  setup() {
    const router = useRouter()
    const activeIndex = ref(localStorage.getItem('activeIndex') || '1')
    const isDarkMode = ref(localStorage.getItem('isDarkMode') === 'true')
    const isWideEnough = ref(window.innerWidth > 1400) // 设置宽度阈值
    const drawerVisible = ref(false) // 控制 el-drawer 的显示
    const leftColSpan = ref(6)
    const mainColSpan = ref(11)
    const rightColSpan = ref(7)
    const loading = ref(true)
    

    const isDark = useDark()
    const toggleDark = useToggle(isDark)

    const updateColSpans = () => {
      if (window.innerWidth > 1200) {
        leftColSpan.value = 6
        mainColSpan.value = 11
        rightColSpan.value = 7
      } else if (window.innerWidth > 992) {
        leftColSpan.value = 4
        mainColSpan.value = 16
        rightColSpan.value = 4
      } else {
        leftColSpan.value = 0
        mainColSpan.value = 24
        rightColSpan.value = 0
      }
    }

    const navigateAndRefresh = (path: string, index: string, if_fresh: boolean = false) => {
      if (if_fresh) {
        window.location.href = path 
      } else {
        router.push(path)
      }
      localStorage.setItem('activeIndex', index)
    }

    const goHome = (if_fresh: boolean = false) => {
      navigateAndRefresh('/home', '1', if_fresh)
    }

    const toggleTheme = () => {
      toggleDark()
      isDarkMode.value = !isDarkMode.value
      if (isDarkMode.value) {
        document.body.classList.add('dark-mode')
        localStorage.setItem('isDarkMode', 'true')
      } else {
        document.body.classList.remove('dark-mode')
        localStorage.setItem('isDarkMode', 'false')
      }
    }

    const handleResize = () => {
      isWideEnough.value = window.innerWidth > 1400
      updateColSpans()
    }

    onMounted(() => {
      if (isDarkMode.value) {
        document.body.classList.add('dark-mode')
      } else {
        document.body.classList.remove('dark-mode')
      }
      activeIndex.value = localStorage.getItem('activeIndex') || '1'
      updateColSpans()
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      activeIndex,
      navigateAndRefresh,
      goHome,
      isDarkMode,
      toggleTheme,
      toggleDark,
      isWideEnough,
      drawerVisible,
      leftColSpan,
      mainColSpan,
      rightColSpan,
      loading
    }
  }
})
</script>
<style>
.blog-card {
  background-color: #f9f9f9; /* 更浅的背景颜色 */
  margin: 20px 0; /* 调整外边距 */
  padding: 20px; /* 调整内边距 */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
  transition: transform 0.3s, box-shadow 0.3s;
  width: auto; /* 设置宽度 */
  height: auto; /* 自动高度 */
}


.layout-container {
  min-height: 100vh;
}

.el-header {
  background: linear-gradient(90deg, #2c3e50, #4a69bd); /* 渐变背景 */
  color: #fff;
  /* line-height: 60px; */
}

.header-content {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.blog-title {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin: 0;
  margin-right: 20px; /* 添加右边距 */
  cursor: pointer; /* 添加鼠标指针样式 */
  transition: color 0.3s; /* 添加颜色过渡效果 */
}

.blog-title:hover {
  color: #66b1ff; /* 悬停时的颜色 */
}

.github-link {
  font-size: 30px; /* 添加左边距 */
  color: #fff;
  transition: color 0.3s;
  margin-top: 10px;
}

.github-link:hover {
  color: #66b1ff; /* 悬停时的颜色 */
}

.github-icon {
  font-size: 40px !important; /* 调整图标大小，并使用 !important 提高优先级 */
}

.nav-links {
  display: flex;
  margin-left: auto; 
}

.nav-link {
  display: flex;
  align-items: center;
  margin-left: 20px;
  color: #fff;
  text-decoration: none;
  transition: color 0.3s, background-color 0.3s;
}

.nav-link:hover {
  color: #66b1ff;
}

.nav-link.active {
  background-color: #1e3799;
  border-radius: 4px;
  padding: 5px 10px;
}

.nav-link.disabled {
  pointer-events: none; /* 禁用点击事件 */
  opacity: 0.5; /* 调整透明度使其看起来不可选 */
}

.el-main {
  background-color: #f5f5fa; /* 浅灰色 */
  padding: 5px;
}

.content-container {
  background-color: #fff; /* 白色背景 */
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-footer {
  background: linear-gradient(90deg, #2c3e50, #4a69bd); /* 渐变背景 */
  color: #fff;
  text-align: center;
  /* line-height: 60px; */
}

.footer-content {
  display: flex;
  justify-content: space-between; /* 在同一行显示并均匀分布 */
  
}

.no-visited {
  color: inherit; /* 继承父元素的颜色 */
  text-decoration: none; /* 移除下划线 */
}

.no-visited:visited {
  color: inherit; /* 点击后保持颜色不变 */
}


.dark-mode {
  background-color: #2c3e50;
  color: #fff;
}

.dark-mode .el-header {
  background: linear-gradient(90deg, #1e272e, #485460); /* 深色渐变背景 */
}

.dark-mode .el-main {
  background-color: #1e272e; /* 深色背景 */
}

.dark-mode .content-container {
  background-color: #485460; /* 深色背景 */
}

.dark-mode .el-footer {
  background: linear-gradient(90deg, #1e272e, #485460); /* 深色渐变背景 */
}

.theme-icon {
  font-size: 25px; /* 调整主题图标的大小 */
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* 增加悬停时的阴影效果 */
}

.blog-card a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  display: block;
  transition: color 0.3s;
}

.blog-card a:hover {
  color: #ff6f61; /* 更鲜艳的颜色 */
}

.blog-card p {
  margin: 10px 0 0;
  color: #666;
}

.dark-mode .blog-card {
  background-color: #2c3e50; /* 深色背景 */
  color: #fff; /* 深色模式下的文字颜色 */
}

.dark-mode .blog-card a {
  color: #fff; /* 深色模式下的链接颜色 */
}

.dark-mode .blog-card a:hover {
  color: #ff6f61; /* 深色模式下的链接悬停颜色 */
}

.dark-mode .blog-card p {
  color: #ccc; /* 深色模式下的段落文字颜色 */
}

.blog-list {
  list-style: none;
  padding: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  margin: 0 10px;
  padding: 5px 10px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  margin: 0 10px;
}

.dark-mode .pagination button {
  background-color: #1e272e; /* 深色模式下的按钮背景颜色 */
  color: #fff; /* 深色模式下的按钮文字颜色 */
}

.dark-mode .pagination button:disabled {
  background-color: #666; /* 深色模式下的禁用按钮背景颜色 */
}

.dark-mode .pagination span {
  color: #fff; /* 深色模式下的分页文字颜色 */
}

.back-button {
  margin-bottom: 20px;
}

.back-button button {
  padding: 10px 20px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button button:hover {
  background-color: #66b1ff;
}

.dark-mode .back-button button {
  background-color: #1e272e; /* 深色模式下的按钮背景颜色 */
  color: #fff; /* 深色模式下的按钮文字颜色 */
}

.dark-mode .back-button button:hover {
  background-color: #485460; /* 深色模式下的按钮悬停背景颜色 */
}

.dark-mode .post-content {
  color: #fff; /* 深色模式下的文字颜色 */
}

.posts-title {
  font-size: 25px;
  margin-top: 10px;
}

/* 以下这些样式如果写在另一个vue文件无法直接作用，原因未知 */
.post-toc {
  width: auto;
  min-width: 300px;
  max-width: 400px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  top: 90px;
  height: auto;
  overflow: auto;
  position: fixed;  /* 固定在页面上,视口不变 */
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  font-family: monospace; 
  font-size: 16px;
}

.post-toc a {
  text-decoration: none; /* 移除下划线 */
  color: inherit ; /* 使用继承的颜色 */
  display: inline-block;
  vertical-align: top;
}

.post-toc ::before {
  display: inline-block;
  vertical-align: top;
  margin-right: 10px;
}

/* 一级标题 */
.post-toc ol {
  list-style-type: none;
  padding-left: 0;
  counter-reset: item; /* 初始化计数器 */
  margin-left: 0px;
}

.post-toc ol > li {
  counter-increment: item; /* 递增计数器 */
  margin-bottom: 8px;
}

.post-toc ol > li:before {
  content: counters(item, ".") ". "; /* 使用计数器生成编号 */
  font-weight: bold; /* 加粗编号 */
}
/* 二级标题 */
.post-toc ol ol {
  counter-reset: item; /* 初始化嵌套计数器 */
}


.post-toc ol ol > li {
  counter-increment: item; /* 递增嵌套计数器 */
  margin-left: 20px;
  margin-bottom: 8px;
  margin-top: 6px;
}

.post-toc ol ol > li:before {
  content: counters(item, ".") ". "; /* 使用嵌套计数器生成编号 */
  font-weight: bold; /* 加粗嵌套编号 */
}

/* 三级标题 */
.post-toc ol ol ol >li {
  margin-bottom: 8px;
  /* counter-increment: item; */
  /* margin-bottom: 10px; */
}

/* 自定义 TOC 链接样式 */
.post-toc a {
  text-decoration: none; /* 移除下划线 */
  color: inherit ; /* 使用继承的颜色 */
}

.post-toc a:visited {
  color: inherit; /* 移除访问过的链接颜色 */
}

.post-toc a:hover {
  color: #409eff; /* 鼠标悬停时的颜色 */
}

.dark-mode .post-toc a:hover {
  color: #b3c7e6; /* 深色模式下的鼠标悬停颜色 */
}

.post-toc .active_li::before {
  border-left: #409eff 4px solid; /* 添加左边框 */
}

.dark-mode .post-toc .active_li::before {
  border-left: #b3c7e6 4px solid; /* 添加左边框 */
}

.post-toc ol  .active_li:before {
  font-weight: bold; /* 加粗编号 */
  padding-left: -4px;
  margin-left: 0px;
}

.post-toc ol ol  .active_li:before {
  font-weight: bold; /* 加粗编号 */
  padding-left: 16px;
  margin-left: -20px;
}

.post-toc ol ol ol .active_li:before {
  font-weight: bold; /* 加粗编号 */
  padding-left: 36px;
  margin-left: -40px;
}

.post-toc .active {
  font-weight: bold; /* 加粗字体 */
}

/* end */

.nav-link {
  display: flex;
  /* align-items: center; */
  margin-left: 20px;
  color: #fff;
  text-decoration: none;
  transition: color 0.3s, background-color 0.3s;
}

.nav-link:hover {
  color: #66b1ff;
}

.nav-link.active {
  background-color: #1e3799;
  border-radius: 4px;
  padding: 5px 10px;
}

.nav-link.disabled {
  pointer-events: none; /* 禁用点击事件 */
  opacity: 0.5; /* 调整透明度使其看起来不可选 */
}

.nav-actions {
  white-space: nowrap; /* 不换行 */
  display: flex;
  gap: 20px;
}

.drawer-button {
  /* background-color: #000; */
  margin-left: auto;
}

.drawer-button {
  margin-left: auto;
}

.dark-mode .drawer-button {
  background-color: #000;
  border-color: #000;
  color: #fff; /* 深色模式下的按钮文字颜色 */
}

.dark-mode .drawer-button:hover {
  background-color: #333; /* 深色模式下的按钮悬停背景颜色 */
}

.el-drawer {
  background-color: #f5f5f5; /* 默认背景颜色 */
  size: 10%;
}

.dark-mode .el-drawer {
  background-color: #2c3e50; /* 黑暗模式背景颜色 */
}

.nav-link-drawer {
  display: flex;
  align-items: center;
  margin: 10px 5px; /* 调整外边距 */
  color: #333; /* 默认文字颜色 */
  text-decoration: none;
  transition: color 0.3s, background-color 0.3s;
  padding: 10px 15px; /* 调整内边距 */
  border-radius: 4px; /* 添加圆角 */
}

.nav-link-drawer:hover {
  color: #409eff; /* 悬停时的文字颜色 */
  background-color: #e6f7ff; /* 悬停时的背景颜色 */
}

.nav-link-drawer.active {
  background-color: #409eff; /* 激活状态的背景颜色 */
  color: #fff; /* 激活状态的文字颜色 */
}

.nav-link-drawer.disabled {
  pointer-events: none; /* 禁用点击事件 */
  opacity: 0.5; /* 调整透明度使其看起来不可选 */
}

.dark-mode .nav-link-drawer {
  color: #fff; /* 黑暗模式下的文字颜色 */
}

.dark-mode .nav-link-drawer:hover {
  color: #66b1ff; /* 黑暗模式下悬停时的文字颜色 */
  background-color: #1e3799; /* 黑暗模式下悬停时的背景颜色 */
}

.dark-mode .nav-link-drawer.active {
  background-color: #1e3799; /* 黑暗模式下激活状态的背景颜色 */
  color: #fff; /* 黑暗模式下激活状态的文字颜色 */
}

.dark-mode .nav-link-drawer.disabled {
  opacity: 0.5; /* 黑暗模式下调整透明度使其看起来不可选 */
}

.nav-links {
  display: flex;
  margin-left: auto; 
}

.drawer-icon {
  margin-right: 35px;
}

.nav-link-drawer-container {
  display: flex;
  align-items: center;
}

.nav-links-drawer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80%;
  
}

.avatar-container {
  margin-bottom: 40px;
}

.tag-item {
  display: inline-block;
  margin: 8px;
}

.el-check-tag {
  cursor: pointer;
  padding: 8px 13px;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
  background-color: inherit;
  font-weight: normal;
}

.el-check-tag.el-check-tag--primary.is-checked {
  background-color: inherit;
  color: inherit;
  display: inline;
}

.el-check-tag:hover {
  background-color: #409eff;
  color: #fff;
}


/* 定义不同标签的颜色 */
.tag-0  {
  background-color: #df7988;
  color: #fff;
}

.tag-1  {
  background-color: #078507;
  color: #fff;
}

.tag-2  {
  background-color: #0177b8;
  color: #fff;
}

.tag-3  {
  background-color: #e6a715;
  color: #fff;
}

.tag-4  {
  background-color: #6b69b6;
  color: #fff;
}

.tag-default {
  background-color: #34495e;
  color: #fff;
}

</style>