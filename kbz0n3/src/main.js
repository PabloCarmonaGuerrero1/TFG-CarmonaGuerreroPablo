import { createApp } from 'vue'
import App from './App.vue'
import router from './Modules/ModuleA/route/Router'

createApp(App).use(router).mount('#app')
