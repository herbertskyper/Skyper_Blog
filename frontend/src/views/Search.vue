<!-- 搜索功能 -->

<template>
  <Layout>
    <div class="search-container">
      <div class="back-button">
        <el-button type="primary" @click="goBack">返回</el-button>
      </div>
      <el-input
        v-model="searchQuery"
        placeholder="搜索..."
        clearable
        @input="searchPosts"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div v-if="searchQuery" class="search-results">
        <div v-if="filteredPosts.length">
          <ul class="results-list">
            <li v-for="post in filteredPosts" :key="post.id" class="search-result">
              <el-card class="result-card">
                <router-link :to="'/post/' + post.slug" @click="saveCurrentPage" class="result-link">
                  <h2 class="search-result-title" v-html="highlight(post.title)"></h2>
                  <p class="search-result-content" v-html="highlightSnippet(post.content)"></p>
                </router-link>
              </el-card>
            </li>
          </ul>
        </div>
        <div v-else class="no-results">
          没有找到结果
        </div>
      </div>
    </div>
  </Layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import Layout from '../components/Layout.vue'
import { Search } from '@element-plus/icons-vue'
import { loadPosts } from '../utils/loadPosts'
// if you just want to import css

export default defineComponent({
  components: {
    Layout,
    Search
  },
  setup() {
    const searchQuery = ref(localStorage.getItem('searchQuery') || '')
    const posts = ref([] as Array<{ id: string, title: string, content: string, slug: string }>)
    const filteredPosts = ref(JSON.parse(localStorage.getItem('filteredPosts') || '[]') as Array<{ id: string, title: string, content: string, slug: string }>)

    // 搜索文章
    const searchPosts = () => {
      if (searchQuery.value) {
        const queries = searchQuery.value.toLowerCase().split(' ').filter(q => q)
        const postMatches = posts.value.map(post => {
          const matchCount = queries.reduce((count, query) => {
            return count + (post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query) ? 1 : 0)
          }, 0)
          return { ...post, matchCount }
        })
        filteredPosts.value = postMatches
          .filter(post => post.matchCount > 0)
          .sort((a, b) => b.matchCount - a.matchCount)
        localStorage.setItem('filteredPosts', JSON.stringify(filteredPosts.value))
      } else {
        filteredPosts.value = []
        localStorage.removeItem('filteredPosts')
      }
      localStorage.setItem('searchQuery', searchQuery.value)
    }

    // 高亮显示搜索结果中的匹配部分
    const highlight = (text: string) => {
      if (!searchQuery.value) return text
      let queries1 = searchQuery.value.split(' ').filter(q => q)
      for(let i = 0; i < queries1.length; i++) {
        if('[…]'.includes(queries1[i])) {
          queries1[i] = ''
        }
      }

      const queriesString = queries1.join(' ').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const queries = queriesString.split(' ').filter(q => q);
      const matches: { start: number, end: number }[]  = []

      queries.forEach(query => {
        const regex = new RegExp(`(${query})`, 'gi')
        let match
        while ((match = regex.exec(text)) !== null) {
          matches.push({ start: match.index, end: regex.lastIndex })
        }
      })

      matches.sort((a, b) => a.start - b.start)

      let highlightedText = ''
      let lastIndex = 0

      matches.forEach(match => {
        highlightedText += text.substring(lastIndex, match.start)
        highlightedText += `<span class="highlight">${text.substring(match.start, match.end)}</span>`
        lastIndex = match.end
      })

      highlightedText += text.substring(lastIndex)

      return highlightedText
    }


    // 高亮显示搜索结果中的匹配部分，并生成显示片段
    const highlightSnippet = (text: string) => {
      
      const queries = searchQuery.value.toLowerCase().split(' ').filter(q => q)
      const indices: number[] = []
      
      queries.forEach(query => {
        let index = text.toLowerCase().indexOf(query)
        while (index !== -1) {
          indices.push(index)
          index = text.toLowerCase().indexOf(query, index + query.length)
        }
      })

      indices.sort((a, b) => a - b)

      const snippetParts: string[] = []

      let prevStart = 0
      let prevEnd = 30
      
      indices.forEach((index) => {
        const partStart = Math.max(0, index - 30)
        const partEnd = Math.min(text.length, index + queries[0].length + 30)
        if (partStart > prevEnd) {
          // console.log(prevStart, prevEnd)
          snippetParts.push(text.substring(prevStart, prevEnd) + '[…]')
          // console.log(snippetParts)
          prevStart = partStart
        }
        prevEnd = partEnd
      })

      snippetParts.push(text.substring(prevStart,prevEnd) + '[…]')
      // console.log(snippetParts)

      const highlightedSnippet = snippetParts.join('')

      return highlight(highlightedSnippet)
    }
    
    // 返回上一页
    const goBack = () => {
      window.history.back()
      localStorage.setItem('activeIndex', '1')
    }

    // 保存当前页码
    const saveCurrentPage = () => {
      localStorage.setItem('currentPage', '1')
    }


    // 组件挂载时加载所有文章
    onMounted(() => {
      loadPosts().then(loadedPosts => {
        posts.value = loadedPosts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content || '', // 确保有 content 字段
          slug: post.slug
        }))
        if (searchQuery.value) {
          searchPosts()
        }
      })
    })

    return {
      searchQuery,
      filteredPosts,
      searchPosts,
      highlight,
      highlightSnippet,
      goBack,
      saveCurrentPage
    }
  }
})
</script>

<style scoped>
.search-container {
  padding: 5px;
}

.dark-mode .search-container {
  background-color: #2c3e50;
  color: #fff;
}


.back-button {
  margin-bottom: 20px;
}

.dark-mode .back-button button {
  background-color: #1e272e;
  color: #fff;
}

.dark-mode .back-button button:hover {
  background-color: #485460;
}


.search-input {
  width: 100%;
  margin-bottom: 20px;
}

.search-results {
  margin-top: 20px;
}

.results-list {
  list-style-type: none;
  padding: 0;
}

.result-link {
  text-decoration: none;
  color: inherit;
}

.result-link:hover {
  text-decoration: none;
}

.result-link:visited {
  color: inherit;
}

.dark-mode .result-link {
  color: #fff;
}

.dark-mode .result-link:hover {
  color: #66b1ff;
}

.search-result {
  margin-bottom: 10px;
}

.search-result h3 {
  margin: 0;
}

.search-result p {
  margin: 5px 0 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 10; /* 最大显示行数 */
  line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results {
  text-align: center;
  color: #999;
}

.dark-mode .no-results {
  color: #ccc;
}

:deep(.highlight) {
  background-color: yellow;
}

.search-result-content {
  font-size: 14px; /* 调整字体大小 */
  color: #a5a4a4; /* 调整字体颜色 */
}

.dark-mode .search-result-content {
  color: #ccc;
}

.result-card {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s; /* 添加浮动动画效果 */
  background-color:#f9f9f9;
}

.result-card:hover {
  transform: translateY(-10px); /* 添加浮动效果 */
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
}

.dark-mode .result-card {
  background-color: #1e272e;
  border-color: #485460;
  color: #fff;
}

.search-result-title {
  margin-top: 5px;
}


</style>