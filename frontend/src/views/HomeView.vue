<template>
  <div class="blog-home">
    <header>
      <h1>欢迎来到我的博客</h1>
      <p>这里是我的个人博客，在这里我分享我的想法和经验。</p>
    </header>
    <section class="blog-posts">
      <article v-for="post in posts" :key="post.id" class="blog-post">
        <h2>{{ post.title }}</h2>
        <p>{{ post.excerpt }}</p>
        <a :href="post.link">阅读更多</a>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'BlogHome',
  data() {
    return {
      posts: [
        { id: 1, title: '第一篇博客文章', excerpt: '这是第一篇博客文章的简介...', link: '/post/1' },
        { id: 2, title: '第二篇博客文章', excerpt: '这是第二篇博客文章的简介...', link: '/post/2' },
        { id: 3, title: '第三篇博客文章', excerpt: '这是第三篇博客文章的简介...', link: '/post/3' },
      ]
    };
  }
}
</script>

<style scoped>
.blog-home {
  font-family: Arial, sans-serif;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

.blog-posts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.blog-post {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 5px;
}

.blog-post h2 {
  margin-top: 0;
}

.blog-post a {
  color: #42b983;
  text-decoration: none;
}

.blog-post a:hover {
  text-decoration: underline;
}
</style>