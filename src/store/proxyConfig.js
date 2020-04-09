import defaultProxyConfig from '../../static/config/proxy'
import { globalProxy } from '../lib/js/proxy'

const state = defaultProxyConfig

export default {
  debug: true,
  state: state,

  getConfig() {
    return {
      port: this.state.port,
      rule: null,
      webInterface: {
        enable: true,
        webPort: this.state.port + 1,
      },
      throttle: this.state.throttleStatus ? this.state.throttle : 10000,
      forceProxyHttps: true,
      wsIntercept: true, // websocket代理
      silent: false,
    }
  },

  /**
   * @param {number} newPort
   */
  setPort(newPort) {
    if (newPort === this.state.port) return
    if (this.debug) console.log('set port: ', newPort)
    this.state.port = newPort
    require('electron').ipcRenderer.send('reload-my-proxy')
  },

  /**
   * @param {string} newRulePath
   */
  setRulePath(newRulePath) {
    if (newRulePath === this.state.rulePath) return
    if (this.debug) console.log('set rulePath: ', newRulePath)
    this.state.rulePath = newRulePath
    require('electron').ipcRenderer.send('reload-my-proxy')
  },

  /**
   * @param {number} newThrottle
   */
  setThrottle(newThrottle) {
    if (newThrottle === this.state.throttle) return
    if (this.debug) console.log('set throttle: ', newThrottle)
    this.state.throttle = newThrottle
    require('electron').ipcRenderer.send('reload-my-proxy')
  },

  setThrottleStatus(newStatus) {
    if (newStatus === this.state.throttleStatus) return
    if (this.debug) console.log('set throttleStatus: ', newStatus)
    this.state.throttleStatus = newStatus
    require('electron').ipcRenderer.send('reload-my-proxy')
  },

  /**
   * @param {boolean} newValue
   */
  setRecording(newValue) {
    if (newValue === this.state.recording) return
    if (this.debug) console.log('set recording: ', newValue)
    if (newValue) {
      globalProxy.enable(this.state.port)
      this.state.recordingHttps && globalProxy.enableHttps(this.state.port)
    } else {
      globalProxy.disable()
      globalProxy.disableHttps()
      this.state.recordingHttps = false
    }
    this.state.recording = newValue
  },

  /**
   * @param {boolean} newValue
   */
  setRecordingHttps(newValue) {
    if (newValue === this.state.recordingHttps) return
    if (this.debug) console.log('set recordingHttps: ', newValue)
    if (newValue) {
      this.state.recording && globalProxy.enableHttps(this.state.port)
    } else {
      globalProxy.disableHttps()
    }
    this.state.recordingHttps = newValue
  },

  /**
   * @param {string} newCachePath
   */
  setCachePath(newCachePath) {
    if (newCachePath === this.state.cachePath) return
    if (this.debug) console.log('set cachePath: ', newCachePath)
    this.state.cachePath = newCachePath
  },
}
