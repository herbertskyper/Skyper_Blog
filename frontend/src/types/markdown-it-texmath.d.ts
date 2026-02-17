declare module 'markdown-it-texmath' {
  import MarkdownIt from 'markdown-it'

  const markdownItTexmath: (md: MarkdownIt, options?: any) => void
  export default markdownItTexmath
}
