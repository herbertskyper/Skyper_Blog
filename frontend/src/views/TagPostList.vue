<!-- 展示目标标签对应的文章 -->

<template>
  <Layout>
    <div class="back-button">
      <el-button type="primary" @click="goTags">返回</el-button>
    </div>
    <div class="tag-header">
      <h4 class="article-count">{{ filteredPosts.length }} 个页面</h4>
      <h1 class="tag-name">{{ tag }}</h1>
    </div>
    <ul class="blog-list">
      <li v-for="post in paginatedPosts" :key="post.id" class="blog-card">
        <RouterLink :to="'/post/' + post.slug" @click="saveCurrentPage" class="posts-title">{{ post.title }}</RouterLink>
        <p><el-icon><Calendar /></el-icon> {{ formatDate(post.date) }}</p>
      </li>
    </ul>
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </Layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadPosts } from '../utils/loadPosts'
import Layout from '../components/Layout.vue'
import { Calendar } from '@element-plus/icons-vue'

export default defineComponent({
  components: {
    Layout,
    Calendar
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    // 返回标签页
    const goTags = () => {
      router.go(-1)
      
    }

    return {
      goTags
    }
  },
  data() {
    return {
      posts: [] as Array<{ id: string, path: string, title: string, tags: string[], date: string, slug: string }>,
      currentPage: 1,
      postsPerPage: 4,
      tag: ''
    }
  },
  computed: {
    // 过滤出包含当前标签的文章
    filteredPosts() {
      return this.posts.filter(post => post.tags.includes(this.tag))
    },
    // 按日期排序文章
    sortedPosts() {
      return this.filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    // 计算总页数
    totalPages() {
      return Math.ceil(this.sortedPosts.length / this.postsPerPage)
    },
    // 获取当前页的文章
    paginatedPosts() {
      const start = (this.currentPage - 1) * this.postsPerPage
      const end = start + this.postsPerPage
      return this.sortedPosts.slice(start, end)
    }
  },
  async mounted() {
    const route = useRoute()
    this.tag = route.params.tag as string
    this.posts = await loadPosts()
    const savedPage = localStorage.getItem(`currentPage_${this.tag}`)
    if (savedPage) {
      this.currentPage = parseInt(savedPage, 10)
    }
  },
  methods: {
    // 格式化日期
    formatDate(date: string) {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString(undefined, options)
    },
    // 跳转到下一页
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        localStorage.setItem(`currentPage_${this.tag}`, this.currentPage.toString())
      }
    },
    // 返回上一页
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        localStorage.setItem(`currentPage_${this.tag}`, this.currentPage.toString())
      }
    },
    // 保存当前页码
    saveCurrentPage() {
      localStorage.setItem(`currentPage_${this.tag}`, this.currentPage.toString())
    }
  }
})
</script>

<style scoped>
.tag-header {
  margin-bottom: 20px;
  margin-left: 10px;
}

.article-count {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.tag-name {
  font-size: 32px;
  color: #333;
  margin: 0;
}
</style>