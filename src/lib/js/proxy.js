const AnyProxy = require('anyproxy')

const getProxyServer = (cfg) => new AnyProxy.ProxyServer(cfg)

/** 全局HTTP代理 */
const globalProxy = {
  /**
   * 开启
   * @param {number} port
   */
  enable(port) {
    AnyProxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', '' + port)
  },

  /**
   * 开启
   * @param {number} port
   */
  enableHttps(port) {
    AnyProxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', '' + port, 'https')
  },

  /** 关闭 */
  disable() {
    AnyProxy.utils.systemProxyMgr.disableGlobalProxy()
  },

  /** 关闭 */
  disableHttps() {
    AnyProxy.utils.systemProxyMgr.disableGlobalProxy('https')
  },
}

/** 证书管理 */
const certMgr = () => {
  if (AnyProxy.utils.certMgr.ifRootCAFileExists()) return
  AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
    // let users to trust this CA before using proxy
    if (!error) {
      const certDir = require('path').dirname(keyPath)
      console.log('The cert is generated at', certDir)
      const isWin = /^win/.test(process.platform)
      const exec = require('child_process').exec
      if (isWin) {
        exec('start .', { cwd: certDir })
      } else {
        exec('open .', { cwd: certDir })
      }
    } else {
      console.error('error when generating rootCA', error)
    }
  })
}

// const isMbankAPI = (host, path) => HTTP_CONSTANT.CMBC_HOST.includes(host) && path.endsWith('.json')

//响应请求的函数
// const processRequest = (request, response) => {
//   let opt = url.parse(request.url)
//   opt.headers = request.headers
//   let pathName = decodeURI(opt.pathname)

//   console.log(`\n======================== HTTP Proxy Start ========================`)
//   console.log(`${request.method}: ${opt.href}`)

//   let DEBUG = isMbankAPI(opt.host, pathName)

//   let req = http.request(
//     opt,
//     // {
//     //   host: 'd26.cmbccdn.cn',
//     //   path: '/mock/11' + pathName.replace('/mbank/', '/'),
//     //   method: 'POST'
//     // },
//     res => {
//       let resBody = ''
//       res.on('data', chunk => {
//         resBody += chunk
//         response.write(chunk, 'binary')
//       })
//       res.on('end', function() {
//         if (DEBUG) {
//           console.log(`----------------加密后响应：\n${resBody}`)
//           console.log(`----------------解密后响应：\n${decrypt(JSON.parse(resBody).response)}`)
//           response.write(
//             JSON.stringify({
//               response: encrypt(resBody),
//               code: 'AAAAAA'
//             })
//           )
//         }
//         response.end()
//         console.log(`======================== HTTP Proxy End ========================`)
//       })
//       console.log(`--statusCode: ${res.statusCode}`)
//       response.writeHead(res.statusCode, res.headers)
//     }
//   )

//   req.on('error', err => {
//     console.error(`请求转发: ${err}`)
//     response.end('' + err)
//   })

//   let requestBody = ''
//   request.on('data', chunk => {
//     requestBody += chunk
//     req.write(chunk, 'binary')
//   })
//   request.on('end', () => {
//     if (!opt.host) {
//       response.end('<h1>你看到了啥？</h1>')
//       console.log(`======================== over ========================`)
//       return
//     }

//     if (DEBUG) {
//       let temp_body = JSON.parse(requestBody)
//       UUID = temp_body['request']['header']['device']['uuid']
//       console.log(`UUID: ${UUID}`)
//       console.log(`----------------加密后POST：\n${requestBody}`)
//       let _origin_post = decrypt(temp_body.request.body)
//       console.log(`----------------未加密POST：\n${_origin_post}`)
//     }

//     req.end()
//   })
// }

export { getProxyServer, globalProxy, certMgr }
