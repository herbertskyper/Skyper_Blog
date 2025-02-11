import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '../views/Home.vue'
import BlogList from '../views/BlogList.vue'
import BlogPost from '../views/BlogPost.vue'
import About from '../views/About.vue'
import Tags from '../views/Tags.vue'
import TagPost from '../views/TagPostList.vue'
import Search from '../views/Search.vue'
import axios from 'axios'
import matter from 'gray-matter'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: HomePage, name: 'home', meta: { title: 'Skyper\'s Blog' } },
  { path: '/home', component: BlogList, name: 'blogList', meta: { title: '博客列表' } },
  { path: '/post/:slug', component: BlogPost, name: 'blogPost', meta: { title: '' } },
  { path: '/about', component: About, name: 'about', meta: { title: '关于' } },
  { path: '/search', component: Search, name: 'search', meta: { title: '搜索' } },
  { path: '/tags', component: Tags, name: 'tags', meta: { title: '标签' } },
  { path: '/tags/:tag', component: TagPost, name: 'tagPost', meta: { title: '标签: ' } },
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
  } 
  else if (to.params.slug) {
    try {
      const response = await axios.get(`/src/posts/${to.params.slug}.md`);
      const { data } = matter(response.data);
      title = data.title || title;
    } catch (error) {
      console.error('Error fetching markdown file:', error);
    }
    document.title = title || defaultTitle;
  } 
  else {
    document.title = title || defaultTitle;
  }
  next();
})

export default router