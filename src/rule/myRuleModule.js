export default {
  // 模块介绍
  summary: 'my customized rule for AnyProxy',
  // 发送请求前拦截处理
  *beforeSendRequest(requestDetail) {
    let host = requestDetail.requestOptions.hostname
    let port = requestDetail.requestOptions.port
    if ((host === 'localhost' || host === '127.0.0.1') && port === 9345) {
      return {
        response: {
          statusCode: 403,
          header: { 'content-type': 'text/html' },
          body: '<b>You are founding localhost:9345</b>'
        }
      }
    }
    /* ... */
  },
  // 发送响应前处理
  *beforeSendResponse(requestDetail, responseDetail) {
    /* ... */
  },
  // 是否处理https请求
  *beforeDealHttpsRequest(requestDetail) {
    /* ... */
  },
  // 请求出错的事件
  *onError(requestDetail, error) {
    /* ... */
  },
  // https连接服务器出错
  *onConnectError(requestDetail, error) {
    /* ... */
  }
}
