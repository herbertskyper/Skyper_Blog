import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import axios from 'axios'
import matter from 'gray-matter'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: () => import('../views/Home.vue'), name: 'home', meta: { title: 'Skyper\'s Blog' } },
  { path: '/home', component: () => import('../views/BlogList.vue'), name: 'blogList', meta: { title: '博客列表' } },
  { path: '/post/:slug', component: () => import('../views/BlogPost.vue'), name: 'blogPost', meta: { title: '' } },
  { path: '/about', component: () => import('../views/About.vue'), name: 'about', meta: { title: '关于' } },
  { path: '/search', component: () => import('../views/Search.vue'), name: 'search', meta: { title: '搜索' } },
  { path: '/tags', component: () => import('../views/Tags.vue'), name: 'tags', meta: { title: '标签' } },
  { path: '/tags/:tag', component: () => import('../views/TagPostList.vue'), name: 'tagPost', meta: { title: '标签: ' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加标签页名称
router.beforeEach(async (to, from, next) => {
  const defaultTitle = 'Skyper\'s Blog';
  let title = to.meta.title as string;

  if (to.params.tag) {
    document.title = `${title}${to.params.tag}` || defaultTitle;
    next();
  } 
  else if (to.params.slug) {
    document.title = title || defaultTitle;
    next();
    axios.get(`/src/posts/${to.params.slug}.md`)
      .then((response) => {
        const { data } = matter(response.data)
        const markdownTitle = data.title || title || defaultTitle
        document.title = markdownTitle
      })
      .catch((error) => {
        console.error('Error fetching markdown file:', error)
      })
  } 
  else {
    document.title = title || defaultTitle;
    next();
  }
})

export default router