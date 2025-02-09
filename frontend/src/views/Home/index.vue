<template>
  <div>
    <div :class="isMobile ? 'container-phone' : 'container'">
      <div class="blog-home">
				<header>
						<h1>欢迎来到我的博客</h1>
						<p>一个CS学生的个人博客，在这里分享我的想法和经验。</p>
				</header>
				<button @click="goToBlogList" class="blog-list-button">查看所有博客文章</button>
                
				<section class="blog-posts">
					<article v-for="post in posts" :key="post.id" class="blog-post">
						<a :href="post.link">
							<h2>{{ post.title }}</h2>
							<p>{{ post.excerpt }}</p>
							阅读更多
						</a>
					</article>
        </section>
      </div>
    </div>
        
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'BlogHome',
    data() {
        return {
            posts: [
                { id: 1, title: '第一篇博客文章', excerpt: '这是第一篇博客文章的简介...', link: '/post/first-blog' },
                { id: 2, title: '第二篇博客文章', excerpt: '这是第二篇博客文章的简介...', link: '/post/second-blog' },
                { id: 3, title: '第三篇博客文章', excerpt: '这是第三篇博客文章的简介...', link: '/post/third-blog' },
            ],
            isMobile: false
        };
    },
    setup() {
        const router = useRouter();
        const isMobile = ref(false);

        const checkMobile = () => {
            isMobile.value = window.innerWidth <= 768;
        };

        onMounted(() => {
            checkMobile();
            window.addEventListener('resize', checkMobile);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('resize', checkMobile);
        });

        const goToBlogList = () => {
            router.push('/home');
        };

        return { goToBlogList, isMobile };
    }
});
</script>

<style scoped>
    @import '@/assets/styles/Home.css';
</style>