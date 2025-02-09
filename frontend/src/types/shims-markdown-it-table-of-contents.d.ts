declare module 'markdown-it-table-of-contents' {
    import MarkdownIt from 'markdown-it';
    const markdownItTableOfContents: (md: typeof MarkdownIt, options: any) => void;
    export default markdownItTableOfContents;
}