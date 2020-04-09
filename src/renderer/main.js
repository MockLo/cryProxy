import Vue from 'vue'
import ElementUI from 'element-ui'
import JsonViewer from 'vue-json-viewer'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
import proxyConfig from '../store/proxyConfig'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.config.productionTip = false

const ipcRenderer = require('electron').ipcRenderer
Vue.prototype.$ipcRenderer = ipcRenderer
Vue.prototype.$proxyConfig = proxyConfig

Vue.use(ElementUI)
Vue.use(JsonViewer)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: (h) => h(App),
  data: {
    proxyConfig: proxyConfig.state,
  },
  created() {
    ipcRenderer.on('to-get-cachePath', (event, path) => {
      proxyConfig.setCachePath(path)
    })
  },
}).$mount('#app')
