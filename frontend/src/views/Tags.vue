<!-- 展示所有标签 -->

<template>
  <Layout>
    <div class="back-button">
      <el-button type="primary" @click="goHome">返回</el-button>
    </div>
    <div>
      <h1>标签</h1>
      <ul class="tags-list">
        <li v-for="(tag,index) in tags" :key="tag" :class="['tag-item', getTagClass(index)]">
          <el-check-tag checked  @change="handleTagClick(tag)">{{'#' + tag }}</el-check-tag>
        </li>
      </ul>
    </div>
  </Layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '../components/Layout.vue'
import { loadPosts } from '../utils/loadPosts'

export default defineComponent({
  name: 'Tags',
  components: {
    Layout
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const tags = ref<string[]>([])

    // 组件挂载时加载所有文章并提取标签
    onMounted(async () => {
      const posts = await loadPosts()
      const allTags = new Set<string>()

      posts.forEach(post => {
        if (post.tags) {
          post.tags.forEach((tag: string) => allTags.add(tag))
        }
      })

      tags.value = Array.from(allTags)
      console.log('Extracted tags:', tags.value) // 调试日志
    })

    // 返回首页
    const goHome = () => {
      router.push('/home')
      localStorage.setItem('activeIndex', '1')
    }

    // 处理标签点击事件，跳转到对应标签的文章列表
    const handleTagClick = (tag: string) => {
      router.push(`/tags/${tag}`)
    }

    // 根据索引获取标签的样式类
    const getTagClass = (index:number) => {
      return `tag-${index%5}`
    }

    return {
      tags,
      goHome,
      handleTagClick,
      getTagClass
    }
  }
})
</script>

<style scoped>
.tags-list {
  list-style: none;
  padding: 0;
}

.tag-item a {
  text-decoration: none;
  color: #409eff;
  padding: 5px 10px;
  border: 1px solid #409eff;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}

.tag-item a:hover {
  background-color: #409eff;
  color: #fff;
}

.dark-mode .tag-item a {
  color: #b3c7e6;
  border-color: #b3c7e6;
}

.dark-mode .tag-item a:hover {
  background-color: #b3c7e6;
  color: #000;
}


</style>