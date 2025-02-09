declare module 'particles.js' {
    export const particlesJS: {
      load: (tagId: string, pathConfigJson: string, callback?: () => void) => void;
    };
  }