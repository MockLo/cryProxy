const { getProxyServer, globalProxy, certMgr } = require('../lib/js/proxy')
import proxyConfig from '../store/proxyConfig'

let mainWindow = null
let myProxy = null
let myRecorder = null
let cachePath = ''

// let messageQueue = []
// let sendFlag = true
// setInterval(() => {
//   sendFlag = true
//   sendMessage()
// }, 50)
// const sendMessage = (data) => {
//   if (sendFlag && messageQueue.length > 0) {
//     mainWindow.webContents.send('to-get-req', JSON.stringify(messageQueue))
//     messageQueue = []
//     sendFlag = false
//   } else {
//     data && messageQueue.push(data)
//   }
// }

/**
 * 代理开启
 */
const proxyStart = (mw) => {
  // 如果已经有个实例，将其关闭
  myProxy && myProxy.close()

  myProxy = getProxyServer(proxyConfig.getConfig())
  console.log('new myProxy: ', myProxy)
  myRecorder = myProxy.recorder

  mainWindow = mw

  // 监听req
  myRecorder.on('update', (reqData) => {
    // sendMessage(reqData)ta
    mainWindow.webContents.send('to-get-req', JSON.stringify(reqData))
  })

  // 缓存路径
  cachePath = myProxy.recorder.cachePath
  console.log('cachePath: ', cachePath)
  mainWindow.webContents.send('to-get-cachePath', cachePath)

  myProxy.on('ready', () => {
    console.log('anyproxy 启动成功')
  })
  myProxy.on('error', (e) => {
    console.log('anyproxy 发生错误: ', e)
  })

  myProxy.start()

  if (proxyConfig.state.recording) {
    globalProxy.enable(proxyConfig.state.port)
    globalProxy.enableHttps(proxyConfig.state.port)
  }
}

/** 代理关闭 */
const proxyStop = () => {
  if (!myProxy) return
  myProxy.close()

  globalProxy.disable()
  globalProxy.disableHttps()
  myProxy = myRecorder = null
}

/** 获取响应体 */
const getResBody = (id) =>
  new Promise((resolve, reject) => {
    myRecorder.getDecodedBody(id, (err, content) => {
      err ? reject(err) : resolve(content.content)
    })
  })

export { proxyStart, proxyStop, getResBody }
