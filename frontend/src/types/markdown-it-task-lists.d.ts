declare module 'markdown-it-task-lists' {
  import MarkdownIt from 'markdown-it';

  interface TaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }

  const taskLists: (md: typeof MarkdownIt, options?: TaskListsOptions) => void;
  export default taskLists;
}