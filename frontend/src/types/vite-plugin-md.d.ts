// filepath: /Users/skyper/Desktop/codes/Skyper_Blog/frontend/src/types/vite-plugin-md.d.ts
declare module 'vite-plugin-md' {
    import { Plugin } from 'vite';
    const markdownPlugin: () => Plugin;
    export default markdownPlugin;
}