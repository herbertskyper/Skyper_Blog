declare module 'katex' {
    export function renderToString(
      tex: string,
      options?: {
        displayMode?: boolean
        throwOnError?: boolean
        errorColor?: string
        macros?: { [key: string]: string }
        minRuleThickness?: number
        colorIsTextColor?: boolean
        maxSize?: number
        maxExpand?: number
        strict?: boolean | string | ((errorCode: string, errorMsg: string, token: string | null) => boolean)
        trust?: boolean | ((context: { command: string, url: string }) => boolean)
        globalGroup?: boolean
      }
    ): string
  }