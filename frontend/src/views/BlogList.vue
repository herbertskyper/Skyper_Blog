<template>
  <Layout>
    <h1>博客列表</h1>
    <ul class="blog-list" v-loading="loading">
      <li v-for="post in paginatedPosts" :key="post.id" class="blog-card">
        <div class="tags">
          <li v-for="tag in post.tags" :key="tag" class="tag-item">
            <el-check-tag :style="{ backgroundColor: tagColors[tag], color: '#fff', display: 'inline' }" @change="handleTagClick(tag)">{{ tag }}</el-check-tag>
          </li>
        </div>
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
import { defineComponent,ref,onMounted } from 'vue'
import { loadPosts } from '../utils/loadPosts'
import Layout from '../components/Layout.vue'
import { Calendar } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  components: {
    Layout,
    Calendar
  },
  setup() {
    const router = useRouter()
    const tags = ref<string[]>([])
    const tagColors = ref<{ [key: string]: string }>({})

    const generateTagColors = (tags: string[]) => {
      const colors = ['#df7988', '#078507', '#0177b8', '#e6a715', '#6b69b6']
      const tagColorMap: { [key: string]: string } = {}
      tags.forEach((tag, index) => {
        tagColorMap[tag] = colors[index % colors.length]
      })
      return tagColorMap
    }

    onMounted(async () => {
      const posts = await loadPosts()
      const allTags = new Set<string>()

      posts.forEach(post => {
        if (post.tags) {
          post.tags.forEach((tag: string) => allTags.add(tag))
        }
      })

      tags.value = Array.from(allTags)
      tagColors.value = generateTagColors(tags.value)
      // console.log('Extracted tags:', tags.value) // 调试日志
      // console.log('Tag colors:', tagColors.value) // 调试日志
    })

    const handleTagClick = (tag: string) => {
      router.push(`/tags/${tag}`)
    }

    return {
      tags,
      tagColors,
      handleTagClick
    }
  },
  data() {
    return {
      posts: [] as Array<{ id: string, path: string, title: string, tags: string[], date: string, slug: string }>,
      currentPage: 1,
      postsPerPage: 4,
      loading: true
    }
  },
  computed: {
    sortedPosts() {
      return this.posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    totalPages() {
      return Math.ceil(this.sortedPosts.length / this.postsPerPage)
    },
    paginatedPosts() {
      const start = (this.currentPage - 1) * this.postsPerPage
      const end = start + this.postsPerPage
      return this.sortedPosts.slice(start, end)
    }
  },
  async mounted() {
    this.posts = await loadPosts()
    const savedPage = localStorage.getItem('currentPage')
    if (savedPage) {
      this.currentPage = parseInt(savedPage, 10)
    }
    this.loading= false
  },
  methods: {
    formatDate(date: string) {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString(undefined, options)
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        localStorage.setItem('currentPage', this.currentPage.toString())
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        localStorage.setItem('currentPage', this.currentPage.toString())
      }
    },
    saveCurrentPage() {
      localStorage.setItem('currentPage', this.currentPage.toString())
    },
    changeActive() {
      localStorage.setItem('activeIndex', '2')
    }
  }
})
</script>

<style scoped>

.tags {
  list-style: none;
  margin-left: -8px;
}

.tag {
  display: inline-block;
  margin: 8px;
}

.tag a {
  text-decoration: none;
  color: #409eff;
  padding: 5px 10px;
  border: 1px solid #409eff;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}

.tag a:hover {
  background-color: #66b1ff;
  color: #fff;
}

.dark-mode .tag a {
  color: #b3c7e6;
  border-color: #b3c7e6;
}

.dark-mode .tag a:hover {
  background-color: #b3c7e6;
  color: #000;
}
</style>