<!-- 博客内容 -->

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
            <div class="toc-content" v-html="tocContent"></div>
          </el-scrollbar>
      </div>
    </template>
  </Layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import Layout from '@/components/Layout.vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Calendar } from '@element-plus/icons-vue'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-table-of-contents'
import '@/assets/styles/markdown-styles.css' 
import hljs from 'highlight.js'
import markdownItTexmath from 'markdown-it-texmath'
import markdownItTaskLists from 'markdown-it-task-lists';

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
    let headingObserver: IntersectionObserver | null = null
    let tocClickHandler: ((event: Event) => void) | null = null
    let markdownClickHandler: ((event: Event) => void) | null = null
    let tocResizeHandler: (() => void) | null = null

    const slugify = (text: string) =>
      text
        .trim()
        .toLowerCase()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w\u4e00-\u9fa5-]/g, '')

    const createMarkdownRenderer = () =>
      new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str: string, lang: string) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code><button type="button" class="copy-button">复制</button></pre>';
            } catch (__) {}
          }
          return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code><button type="button" class="copy-button">复制</button></pre>';
        }
      })
      .use(markdownItAnchor, {
        level: [1, 2, 3, 4],
        slugify,
        permalinkAttrs: () => ({ 'aria-hidden': true })
      })
      .use(markdownItToc, {
        includeLevel: [1, 2, 3, 4],
        format: (heading: string) => heading,
        containerClass: 'toc',
        listType: 'ul'
      })
      .use(markdownItTexmath, {
        engine: katex,
        delimiters: 'dollars',
        katexOptions: {
          throwOnError: false,
          strict: 'ignore'
        }
      })
      .use(markdownItTaskLists)
    
    // 初始化 MarkdownIt 实例
    const md = createMarkdownRenderer()

    const normalizeSlug = (slug: string | string[] | undefined) => {
      if (Array.isArray(slug)) {
        return slug[0] || ''
      }
      return slug || ''
    }

    const updateTocActive = (headingId: string) => {
      const ensureTocVisible = (target: HTMLElement) => {
        const tocScrollWrap =
          (target.closest('.el-scrollbar__wrap') as HTMLElement | null) ||
          (document.querySelector('.post-toc .el-scrollbar__wrap') as HTMLElement | null)

        if (!tocScrollWrap) {
          return
        }

        const itemRect = target.getBoundingClientRect()
        const wrapRect = tocScrollWrap.getBoundingClientRect()
        const buffer = 12

        if (itemRect.top < wrapRect.top + buffer) {
          tocScrollWrap.scrollTop -= wrapRect.top + buffer - itemRect.top
        } else if (itemRect.bottom > wrapRect.bottom - buffer) {
          tocScrollWrap.scrollTop += itemRect.bottom - (wrapRect.bottom - buffer)
        }
      }

      document.querySelectorAll('.post-toc a').forEach(anchor => {
        anchor.classList.remove('active')
        const li = anchor.closest('li')
        if (li) {
          li.classList.remove('active_li')
        }
      })

      if (!headingId) {
        return
      }

      for (const anchor of Array.from(document.querySelectorAll('.post-toc a'))) {
        const href = anchor.getAttribute('href')
        if (href && href.substring(1) === headingId) {
          anchor.classList.add('active')
          const li = anchor.closest('li')
          if (li) {
            li.classList.add('active_li')
          }
          ensureTocVisible(anchor as HTMLElement)
          break
        }
      }
    }

    const setupHeadingObserver = () => {
      headingObserver?.disconnect()
      headingObserver = null

      const headings = Array.from(
        document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4')
      ) as HTMLElement[]

      if (headings.length === 0) {
        activeHeading.value = ''
        updateTocActive('')
        return
      }

      const pickCurrentHeading = () => {
        let currentId = headings[0]?.id || ''
        for (const heading of headings) {
          const rect = heading.getBoundingClientRect()
          if (rect.top <= 90) {
            currentId = heading.id
          }
        }
        activeHeading.value = currentId
        updateTocActive(currentId)
      }

      headingObserver = new IntersectionObserver(
        () => {
          pickCurrentHeading()
        },
        {
          root: null,
          rootMargin: '-80px 0px -65% 0px',
          threshold: [0, 1]
        }
      )

      headings.forEach(heading => headingObserver?.observe(heading))
      pickCurrentHeading()
    }

    const setupTocClick = () => {
      const tocWrapper = document.querySelector('.post-toc')
      if (!tocWrapper) {
        return
      }

      tocWrapper.querySelectorAll('.toc-content li').forEach(item => {
        const li = item as HTMLLIElement
        const anchor = li.querySelector(':scope > a') as HTMLAnchorElement | null
        if (!anchor) {
          return
        }

        const removableNodes: ChildNode[] = []
        let trailingText = ''

        li.childNodes.forEach(node => {
          if (node === anchor) {
            return
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            if (element.tagName === 'OL' || element.tagName === 'UL') {
              return
            }
          }

          const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
          if (text) {
            trailingText = `${trailingText} ${text}`.trim()
          }
          removableNodes.push(node)
        })

        if (trailingText) {
          const merged = `${(anchor.textContent || '').replace(/\s+/g, ' ').trim()} ${trailingText}`
            .replace(/\s+/g, ' ')
            .trim()
          anchor.textContent = merged
        }

        removableNodes.forEach(node => node.remove())
      })

      tocWrapper.querySelectorAll('a').forEach(anchor => {
        const text = (anchor.textContent || '').replace(/\s+/g, ' ').trim()
        if (text) {
          anchor.textContent = text
          anchor.setAttribute('title', text)
        }
      })

      const refreshTocOverflowState = () => {
        tocWrapper.querySelectorAll('.toc-content li').forEach(item => {
          const li = item as HTMLLIElement
          const anchor = li.querySelector(':scope > a') as HTMLAnchorElement | null
          if (!anchor) {
            return
          }

          const fullText = (anchor.textContent || '').replace(/\s+/g, ' ').trim()
          const isOverflow = anchor.scrollWidth > anchor.clientWidth + 1

          if (isOverflow && fullText) {
            li.classList.add('toc-overflow')
            li.setAttribute('data-full-title', fullText)
          } else {
            li.classList.remove('toc-overflow')
            li.removeAttribute('data-full-title')
          }
        })
      }

      requestAnimationFrame(refreshTocOverflowState)
      tocResizeHandler = () => {
        refreshTocOverflowState()
      }
      window.addEventListener('resize', tocResizeHandler)

      tocClickHandler = (event: Event) => {
        const target = event.target as HTMLElement
        const anchor = target.closest('a')
        if (!anchor) {
          return
        }
        event.preventDefault()
        const href = anchor.getAttribute('href')
        if (!href) {
          return
        }
        const targetId = href.substring(1)
        const targetElement = document.getElementById(targetId)
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop + 80,
            behavior: 'smooth'
          })
        }
      }

      tocWrapper.addEventListener('click', tocClickHandler)
    }

    const setupMarkdownBehavior = () => {
      const markdownBody = document.querySelector('.markdown-body')
      if (!markdownBody) {
        return
      }

      document.querySelectorAll('.markdown-body a').forEach(anchor => {
        const href = anchor.getAttribute('href') || ''
        if (!href.startsWith('#')) {
          anchor.setAttribute('target', '_blank')
          anchor.setAttribute('rel', 'noopener noreferrer')
        }
      })

      markdownClickHandler = (event: Event) => {
        const target = event.target as HTMLElement
        const button = target.closest('.copy-button') as HTMLElement | null
        if (!button) {
          return
        }
        copyCode(event)
      }

      markdownBody.addEventListener('click', markdownClickHandler)
    }

    const clearDomListeners = () => {
      headingObserver?.disconnect()
      headingObserver = null

      if (tocClickHandler) {
        const tocWrapper = document.querySelector('.post-toc')
        tocWrapper?.removeEventListener('click', tocClickHandler)
        tocClickHandler = null
      }

      if (markdownClickHandler) {
        const markdownBody = document.querySelector('.markdown-body')
        markdownBody?.removeEventListener('click', markdownClickHandler)
        markdownClickHandler = null
      }

      if (tocResizeHandler) {
        window.removeEventListener('resize', tocResizeHandler)
        tocResizeHandler = null
      }
    }

    const loadPost = async (slugParam: string | string[] | undefined) => {
      const slug = normalizeSlug(slugParam)
      if (!slug) {
        content.value = ''
        tocContent.value = ''
        tocItemCount.value = 0
        loading.value = false
        return
      }

      loading.value = true
      clearDomListeners()

      try {
        const response = await fetch(`/src/posts/${slug}.md`)
        const text = await response.text()
        const { content: markdownContent, data } = matter(text)

        postTitle.value = data.title || '无标题'
        postDate.value = data.date || ''
        postTags.value = data.tags || []

        const processedContent = markdownContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
          if (!src.startsWith('http')) {
            src = `/src/posts/${src}`
          }
          return `![${alt}](${src})`
        })

        let htmlContent = md.render(processedContent)
        content.value = htmlContent

        const tocMd = createMarkdownRenderer()
        const tocHtml = tocMd.render('[[toc]]\n' + markdownContent)
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = tocHtml

        const tocDiv = tempDiv.querySelector('.toc')
        tocContent.value = tocDiv?.innerHTML || ''
        tocItemCount.value = tocDiv ? tocDiv.querySelectorAll('a').length : 0

        await nextTick()
        setupTocClick()
        setupMarkdownBehavior()
        setupHeadingObserver()
      } finally {
        loading.value = false
      }
    }

    // 组件挂载时加载文章内容
    onMounted(async () => {
      await loadPost(route.params.slug)
    })
    watch(
      () => route.params.slug,
      async (nextSlug, prevSlug) => {
        if (nextSlug !== prevSlug) {
          await loadPost(nextSlug)
        }
      }
    )

    onUnmounted(() => {
      clearDomListeners()
    })
    
    // 返回上一页
    const goBack = () => {
      router.go(-1)
    }

    // 格式化日期
    const formatDate = (date: string) => {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString(undefined, options)
    }

    // 复制代码
    const copyCode = (event: Event) => {
      const button = event.target as HTMLElement
      const buttonEl = button.closest('.copy-button') as HTMLElement | null
      const pre = buttonEl?.closest('pre')
      if (pre) {
        const code = pre.querySelector('code')
        if (code) {
          navigator.clipboard.writeText(code.textContent || '').then(() => {
            if (!buttonEl) {
              return
            }
            buttonEl.textContent = '已复制'
            setTimeout(() => {
              buttonEl.textContent = '复制'
            }, 1000)
          })
        }
      }
    }

    // 处理标签点击事件，跳转到对应标签的文章列表
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

:deep(.post-toc .el-scrollbar__view) {
  min-width: 0;
}

:deep(.post-toc .toc-content ol),
:deep(.post-toc .toc-content ul),
:deep(.post-toc .toc-content li) {
  min-width: 0;
}

:deep(.post-toc .toc-content ul) {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

:deep(.post-toc .toc-content ul ul) {
  padding-left: 18px;
}

:deep(.post-toc .toc-content li) {
  position: relative;
  min-width: 0;
  margin: 0;
  padding: 0;
  line-height: 1.7;
  font-size: 15px;
  letter-spacing: 0.01em;
}

:deep(.post-toc .toc-content ol) {
  padding-left: 20px;
}

:deep(.post-toc .toc-content a) {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 3px 12px 3px 22px;
  border-radius: 6px;
  margin: 2px 0;
  transition: background 0.18s, color 0.18s;
}

:deep(.post-toc .toc-content a.active) {
  color: #2176d2;
  font-weight: 700;
  background: rgba(64, 158, 255, 0.12);
  position: relative;
  border-left: none !important;
  box-shadow: none !important;
  letter-spacing: 0.02em;
}

:deep(.post-toc .toc-content a.active::before) {
  content: '';
  position: absolute;
  left: 10px;
  top: 22%;
  width: 3px;
  height: 56%;
  border-radius: 2px;
  background-color: #409eff;
}

:deep(.post-toc .toc-content a:hover) {
  background: rgba(64, 158, 255, 0.08);
  color: #2176d2;
  text-decoration: underline;
}

:deep(.post-toc .toc-content li.toc-overflow:hover::after) {
  content: attr(data-full-title);
  position: absolute;
  left: 22px;
  top: 100%;
  margin-top: 6px;
  max-width: 320px;
  padding: 6px 9px;
  border-radius: 6px;
  background: rgba(32, 33, 36, 0.95);
  color: #fff;
  font-size: 13px;
  line-height: 1.45;
  letter-spacing: 0;
  white-space: normal;
  word-break: break-word;
  z-index: 30;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

:deep(.post-toc .toc-content li.active_li) {
  box-shadow: none !important;
  border-radius: 0;
}

.dark-mode :deep(.post-toc .toc-content a.active) {
  color: #b3c7e6;
  background: rgba(179, 199, 230, 0.13);
}

.dark-mode :deep(.post-toc .toc-content a.active::before) {
  background-color: #b3c7e6;
}

.dark-mode :deep(.post-toc .toc-content a:hover) {
  background: rgba(179, 199, 230, 0.09);
  color: #b3c7e6;
}

.dark-mode :deep(.post-toc .toc-content li.toc-overflow:hover::after) {
  background: rgba(245, 245, 245, 0.95);
  color: #222;
}





</style>