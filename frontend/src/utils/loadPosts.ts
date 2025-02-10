import matter from 'gray-matter'
import { Buffer } from 'buffer'
import * as yaml from 'js-yaml'
import { marked } from 'marked'

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

