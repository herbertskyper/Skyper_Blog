<template>
  <Layout>
    <div class="back-button">
      <el-button type="primary" @click="goHome">返回</el-button>
    </div>
    <div class="markdown-body">
      <div  v-html="content" class="post-content"></div>
    </div>
  </Layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import Layout from '@/components/Layout.vue'
import { renderMath } from '../utils/katex-renderer'
import 'katex/dist/katex.min.css'
import '@/assets/css/markdown-styles.css' 
import hljs from 'highlight.js'

export default defineComponent({
  components: {
    Layout
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const content = ref('')
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str:string, lang:string) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre class="hljs"><code>' +
                  hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                  '</code></pre>';
          } catch (__) {}
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
      }
    })

    onMounted(async () => {
      const response = await fetch(`/src/pages/about.md`)
      const text = await response.text()
      const { content: markdownContent } = matter(text)
      // 先用markdown-it渲染Markdown
      let htmlContent = md.render(markdownContent)
      // 再用katex渲染数学公式
      htmlContent = renderMath(htmlContent)
      content.value = htmlContent
    })

    const goHome = () => {
      router.push('/home')
      localStorage.setItem('activeIndex', '1')
    }

    return {
      content,
      goHome
    }
  }
})
</script>

<style scoped>
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

.post-content {
  color: #333; /* 默认文字颜色 */
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
</style>