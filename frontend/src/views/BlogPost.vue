<template>
  <Layout v-loading="loading">
    <div class="back-button">
      <el-button type="primary" @click="goBack">返回</el-button>
    </div>
    <div class="post-container">
      <div class="post-content">
        <div class="post-header">
          <div class="tags">
            <li v-for="(tag,index) in postTags" :key="tag" :class="['tag-item', 'tag-default']">
              <el-check-tag checked @change="handleTagClick(tag)">{{ tag }}</el-check-tag>
            </li>
          </div>
          <h1 class="post-title">{{ postTitle }}</h1>
          <p class="post-date"><el-icon><Calendar /></el-icon> {{ formatDate(postDate) }}</p>
          <div class="toc-divider"></div>
        </div>
        
        <div class="markdown-body" v-html="content"></div>
      </div>
    </div>
    <template #toc-content>
      <div v-if="tocItemCount > 1" class="post-toc">
          <h2>目录</h2>
          <div class="toc-divider"></div>
          <el-scrollbar max-height="500px">
            <div v-html="tocContent"></div>
          </el-scrollbar>
      </div>
    </template>
  </Layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import Layout from '@/components/Layout.vue'
import { renderMath } from '../utils/katex-renderer'
import 'katex/dist/katex.min.css'
import { Calendar } from '@element-plus/icons-vue'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-table-of-contents'
import markdownItTocDoneRight from 'markdown-it-toc-done-right'
import '@/assets/css/markdown-styles.css' 
import hljs from 'highlight.js'
import { sl } from 'element-plus/es/locale'

export default defineComponent({
  components: {
    Layout,
    Calendar
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const content = ref('')
    const tocContent = ref('')
    const postTitle = ref('')
    const postDate = ref('')
    const postTags = ref<string[]>([])
    const tocItemCount = ref(0)
    const activeHeading = ref('')
    const loading = ref(true)
    
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str:string, lang:string) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre class="hljs"><code>' +
                  hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                  '</code><button type="primary" class="copy-button" @click="copyCode">复制</button></pre>';
          } catch (__) {}
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code><button type="primary" class="copy-button" @click="copyCode">复制</button></pre>';
      }
    })
    .use(markdownItAnchor, {
      // permalink: true,
      // permalinkBefore: true,
      // permalinkSymbol: '#',
      level: [1, 2, 3, 4], // 确保所有级别的标题都有锚点
      permalinkAttrs: () => ({ 'aria-hidden': true })
    })
    .use(markdownItToc, {
      includeLevel: [1, 2, 3, 4], // 确保目录包含所有级别的标题
      format: (heading: string) => heading,
      containerClass: 'toc',
      listType: 'ol'
    })

    onMounted(async () => {
      const slug = route.params.slug
      const response = await fetch(`/src/posts/${slug}.md`)
      const text = await response.text()
      const { content: markdownContent, data } = matter(text)
      // 解析文章信息
      postTitle.value = data.title || '无标题'
      postDate.value = data.date || ''
      postTags.value = data.tags || []

      const processedContent = markdownContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        if (!src.startsWith('http')) {
          src = `/src/posts/${src}`
        }
        return `![${alt}](${src})`
      })

      // 先用markdown-it渲染Markdown
      let htmlContent = md.render(processedContent)
      // 再用katex渲染数学公式
      htmlContent = renderMath(htmlContent)
      content.value = htmlContent
      // 生成目录
      const tocMd = new MarkdownIt().use(markdownItToc, {
        includeLevel: [1, 2, 3],
        format: (heading: string) => heading,
        containerClass: 'toc',
        listType: 'ol' // 使用有序列表
      })
      const tocHtml = tocMd.render('[[toc]]\n' + markdownContent)

      // 创建一个临时的 DOM 元素来解析 HTML 字符串
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = tocHtml

      // 提取第一个 div 里面的内容
      const firstDivContent = tempDiv.querySelector('div')?.innerHTML || ''

      // 将提取的内容赋值给 tocContent
      tocContent.value = firstDivContent

      // 统计目录中的条目数量
      const tocItems = tempDiv.querySelectorAll('div > ul > li')
      tocItemCount.value = tocItems.length  //这里不能用const xxx = xxx，这样会无法传递到全局的变量中，导致无法传给template真实值 
      // console.log('目录条目数量:', tocItemCount) // 调试日志

      // 监听目录中的链接点击事件
      nextTick(() => {
        document.querySelectorAll('.post-toc a,.post-toc ::before').forEach(anchor => {
          anchor.addEventListener('click', (e) => {
            e.preventDefault()
            const href = anchor.getAttribute('href')
            if (href) {
              const targetId = href.substring(1)
              const targetElement = document.getElementById(targetId)
              if (targetElement) {
                window.scrollTo({
                  top: targetElement.offsetTop+80,
                  behavior: 'smooth'
                })
              }
            }
          })
        })

        document.querySelectorAll('.copy-button').forEach(button => {
          button.addEventListener('click', copyCode)
        })
      })
      const sleep = (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms))
      }
      // await sleep(10000)
      loading.value = false
      
    })
    
    window.addEventListener('scroll', () => {
      const headings = document.querySelectorAll('h1, h2, h3')
      let lastVisibleHeading = ''
      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 80) {
          lastVisibleHeading = heading.id
        }
      })
      activeHeading.value = lastVisibleHeading

      // 移除所有目录项的 active 类
      document.querySelectorAll('.post-toc a').forEach(anchor => {
        anchor.classList.remove('active')
        const li = anchor.closest('li')
        if (li) {
          li.classList.remove('active_li')
        }
      })

      // 为当前可见的标题对应的目录项添加 active 类
      for (const anchor of Array.from(document.querySelectorAll('.post-toc a'))) {
        const href = anchor.getAttribute('href') 
        if (href && href.substring(1) === activeHeading.value) {
          anchor.classList.add('active')
          // console.log('activeHeading:', activeHeading.value)
          const li = anchor.closest('li')
          if (li) {
            li.classList.add('active_li')
            // console.log('activeHeading:', activeHeading.value)
          }
          break
        }
      }

      document.querySelectorAll('.markdown-body a').forEach(anchor => {
          anchor.setAttribute('target', '_blank')
        })

    })
    

    const goBack = () => {
      router.go(-1)
    }

    const formatDate = (date: string) => {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString(undefined, options)
    }

    const copyCode = (event: Event) => {
      console.log('复制代码')
      const button = event.target as HTMLElement
      const pre = button.closest('pre')
      if (pre) {
        const code = pre.querySelector('code')
        if (code) {
          navigator.clipboard.writeText(code.textContent || '').then(() => {
            button.textContent = '已复制'
            setTimeout(() => {
              button.textContent = '复制'
            }, 1000)
          })
        }
      }
    }

    const handleTagClick = (tag: string) => {
      router.push(`/tags/${tag}`)
    }

    return {
      tocItemCount,
      content,
      tocContent,
      postTitle,
      postDate,
      postTags,
      goBack,
      formatDate,
      activeHeading,
      loading,
      copyCode,
      handleTagClick
    }
  }
})
</script>

<style scoped>

.toc-divider {
  border-bottom: 1px solid #ccc; /* 添加细线 */
  margin-top: 10px; /* 添加一些间距 */
}


.post-container {
  display: inline;
  justify-content: space-between;
}

.post-content {
  flex: 1;

}



.dark-mode .post-toc {
  background-color: #333;
}

.post-header {
  margin-bottom: 20px;
}

.post-title {
  font-size: 25px;
  color: #333;
  margin-top: 10px;
  margin-bottom: 5px;
}

.post-date {
  color: #666;
  display: flex;
  align-items: center;
  margin: 10px 0;
}

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

.el-icon {
  margin-right: 5px;
}

.post-content {
  color: #333; /* 默认文字颜色 */
}

.dark-mode .post-content {
  color: #fff; /* 深色模式下的文字颜色 */
}

.dark-mode .post-title {
  color: #fff; /* 深色模式下的标题颜色 */
}

.dark-mode .post-date {
  color: #ccc; /* 深色模式下的日期颜色 */
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