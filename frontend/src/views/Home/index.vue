<template>
    <div class="container">
        <div class="blog-home">
            <header>
                <h1>欢迎来到我的博客</h1>
                <p>这里是我的个人博客，在这里我分享我的想法和经验。</p>
            </header>
            <button @click="goToBlogList" class="blog-list-button">查看所有博客文章</button>
            <section class="blog-posts">
                <article v-for="post in posts" :key="post.id" class="blog-post">
                <h2>{{ post.title }}</h2>
                <p>{{ post.excerpt }}</p>
                <a :href="post.link">阅读更多</a>
                </article>
            </section>
        </div>
    </div>
</template>

<script lang="ts">
// import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default{
    name: 'BlogHome',
    data() {
        return {
            posts: [
                { id: 1, title: '第一篇博客文章', excerpt: '这是第一篇博客文章的简介...', link: '/post/1' },
                { id: 2, title: '第二篇博客文章', excerpt: '这是第二篇博客文章的简介...', link: '/post/2' },
                { id: 3, title: '第三篇博客文章', excerpt: '这是第三篇博客文章的简介...', link: '/post/3' },
            ]
        };
    },
    setup() {
        const router = useRouter();
        const goToBlogList = () => {
            router.push('/blog-list');
        };
        return { goToBlogList };
    }
};
</script>

<style scoped>
    @import '@/assets/styles/Home.css';
</style>