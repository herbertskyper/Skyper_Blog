import katex from 'katex';

export function renderMath(content: string): string {
  // 处理块级公式 $$...$$
  content = content.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false
      });
    } catch (e) {
      console.error('KaTeX block formula error:', e);
      return match;
    }
  });

  // 处理行内公式 $...$
  content = content.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false
      });
    } catch (e) {
      console.error('KaTeX inline formula error:', e);
      return match;
    }
  });

  return content;
}