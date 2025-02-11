import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as buffer from "buffer"; //引入buffer

// 解决Buffer未定义问题
if (typeof (window as any).Buffer === "undefined") { // 判断当前环境是否有Buffer对象
   (window as any).Buffer = buffer.Buffer; // Buffer对象不存在则创建导入的buffer
}


createApp(App).use(router).use(ElementPlus).mount('#app')

