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
@import '@/assets/styles/Layout.css';
</style>