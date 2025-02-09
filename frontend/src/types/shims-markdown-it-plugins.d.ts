declare module 'markdown-it-anchor' {
    import MarkdownIt from 'markdown-it';
    const markdownItAnchor: (md: typeof MarkdownIt, options?: any) => void;
    export default markdownItAnchor;
}