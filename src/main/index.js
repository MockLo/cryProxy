import { app, BrowserWindow } from 'electron'
import { proxyStart, proxyStop, getResBody } from './myProxy'
import http from 'http'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    title: 'CryProxy',
    webPreferences: {
      backgroundThrottling: false, // 当页面被置于非激活窗口的时候是否停止动画和计时器
      webSecurity: false, // 以可以加载本地图片
    },
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('quit', () => {
  proxyStop()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

const { ipcMain } = require('electron')

ipcMain.on('ready-to-init-proxy', function () {
  console.log('ready-to-init-proxy')
  proxyStart(mainWindow)
})

ipcMain.on('reload-my-proxy', function () {
  console.log('reload-my-proxy')
  proxyStart(mainWindow)
})

ipcMain.on('fetch-status-code', function (event, arg) {
  let codeText = http.STATUS_CODES[arg]
  console.log('fetch-status-code', arg, codeText)
  event.sender.send('reply-status-code', codeText)
})

ipcMain.on('fetch-res-body', function (event, arg) {
  console.log('fetch-res-body')
  getResBody(arg).then(
    (content) => {
      event.sender.send('reply-res-body', content)
    },
    (error) => {
      console.error('fetch-res-body, error: ', error)
      event.sender.send('reply-res-body-error', error)
    }
  )
})
