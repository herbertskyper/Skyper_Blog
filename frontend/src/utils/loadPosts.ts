import matter from 'gray-matter'
import { Buffer } from 'buffer'
import * as yaml from 'js-yaml'
import { marked } from 'marked'

/**
 * 加载所有 Markdown 格式的博客文章，并解析其内容和元数据。
 * 
 * @returns {Promise<Array<Object>>} 返回一个包含所有博客文章的数组，每篇文章包含以下属性：
 * - id: 文章的唯一标识符
 * - path: 文章的文件路径
 * - title: 文章的标题
 * - tags: 文章的标签数组
 * - date: 文章的发布日期
 * - slug: 文章的 slug
 * - content: 文章的纯文本内容
 */

export async function loadPosts() {
  const posts = import.meta.glob('@/posts/*.md', { as: 'raw' }) as Record<string, () => Promise<string>>
  const postList = []

  for (const path in posts) {
    const postContent = await posts[path]()
    const { data, content } = matter(postContent, { 
      engines: { yaml: (s) => yaml.load(s, { schema: yaml.DEFAULT_SCHEMA }) } 
    })
    // 等待 marked 函数的结果
    let markedContent = await marked(content)
    markedContent = markedContent.replace(/\$\$?([^$]+?)\$\$?/g, '$1')
    markedContent = markedContent.replace(/!\[.*?\]\(.*?\)/g, '') // 去除 ![]() 引用
    const plainTextContent = markedContent.replace(/<[^>]+>/g, '')
    // console.log(plainTextContent)
    
    postList.push({
      id: data.slug || path.match(/\/([^\/]+)\.md$/)?.[1],
      path,
      title: data.title || '未命名文章',
      tags: data.tags || [],
      date: data.date || '',
      slug: data.slug || path.match(/\/([^\/]+)\.md$/)?.[1],
      content: plainTextContent || ''
    })
  }

  return postList
}

