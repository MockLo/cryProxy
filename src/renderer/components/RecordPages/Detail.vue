<template>
  <el-drawer
    :visible.sync="drawer"
    :withHeader="false"
    size="40%"
    :modal="false"
    :modal-append-to-body="false"
    :destroy-on-close="true"
  >
    <el-tabs type="card" class="record-detail">
      <el-tab-pane label="Request">
        <el-collapse v-model="activeNames_Req">
          <el-collapse-item title="General" name="0">
            <div v-for="(v, k, i) in req_general" :key="i" class="detail-item">
              <span>{{ k }}</span>
              <span>{{ v }}</span>
            </div>
          </el-collapse-item>
          <el-collapse-item title="Header" name="1">
            <div v-for="(v, k, i) in req_header" :key="i" class="detail-item">
              <span>{{ k }}</span>
              <span>{{ v }}</span>
            </div>
          </el-collapse-item>
          <el-collapse-item v-if="Authorization" title="Authorization" name="2">
            <div class="detail-item">
              <span>{{ authType }}</span>
              <span>
                {{ authDecodeStatus ? authDecode : authMsg }}
                <i
                  :class="authDecodeStatus ? 'el-icon-lock' : 'el-icon-unlock'"
                  @click="authDecodeStatus = !authDecodeStatus"
                  style="cursor: pointer;"
                >
                </i>
              </span>
            </div>
          </el-collapse-item>
          <el-collapse-item v-if="Cookie" title="Cookie" name="3">
            <div v-for="(v, k, i) in cookieObj" :key="i" class="detail-item">
              <span>{{ k }}</span>
              <span>{{ v }}</span>
            </div>
          </el-collapse-item>
          <el-collapse-item v-if="req_body" title="Body" name="4">
            <div v-if="reqBodyType === 'urlencoded'">
              <el-switch v-model="urlencodedSwitchStatus" inactive-text="Raw" active-text="Format"></el-switch>
              <div v-show="urlencodedSwitchStatus">
                <div v-for="(v, k, i) in urlencodedObj" :key="i" class="detail-item">
                  <span>{{ k }}</span>
                  <span>{{ v }}</span>
                </div>
              </div>
              <div v-show="!urlencodedSwitchStatus">
                <div class="body-text">{{ req_body }}</div>
              </div>
            </div>

            <div v-else>
              <div class="body-text">{{ req_body }}</div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>

      <el-tab-pane label="Response">
        <el-collapse v-model="activeNames_Res">
          <el-collapse-item title="General" name="0">
            <div v-for="(v, k, i) in res_general" :key="i" class="detail-item">
              <span>{{ k }}</span>
              <span>{{ v }}</span>
            </div>
          </el-collapse-item>
          <el-collapse-item title="Header" name="1">
            <div v-for="(v, k, i) in res_header" :key="i" class="detail-item">
              <span>{{ k }}</span>
              <span>{{ v }}</span>
            </div>
          </el-collapse-item>
          <el-collapse-item v-if="SetCookie" title="Set-Cookie" name="2">
            <div v-for="(v, k, i) in setCookieObj" :key="i" class="detail-item">
              <span>{{ k }}</span>
              <span>{{ v }}</span>
            </div>
          </el-collapse-item>
          <el-collapse-item v-if="resBody" title="Body" name="3">
            <div v-if="resBodyType === 'json'">
              <el-switch v-model="jsonSwitchStatus" inactive-text="Raw" active-text="Format"></el-switch>
              <div v-show="jsonSwitchStatus">
                <json-viewer :value="resBody_json" :expand-depth="5" copyable boxed sort></json-viewer>
              </div>
              <div v-show="!jsonSwitchStatus">
                <div class="body-text">{{ resBody }}</div>
              </div>
            </div>

            <div v-else-if="resBodyType === 'image'" class="res-image">
              <p class="image-preview-tip">Image Preview :</p>
              <el-image :src="res_image_url" :preview-src-list="[res_image_url]">
                <div slot="error" class="image-preview-error">Image Load Error</div>
              </el-image>
            </div>

            <div v-else-if="resBodyType === 'font'" class="res-font">
              <el-alert title="Preview Not Available For Font" type="info" show-icon :closable="false"></el-alert>
              <el-link type="primary" icon="el-icon-view" @click="seeMoreInBrowser">Download It By Browser</el-link>
            </div>

            <div v-else class="res-text">
              <el-alert
                v-if="isResBodyTooMany"
                title="Response Body Too Big To Show A Part Of It"
                type="info"
                show-icon
                :closable="false"
              ></el-alert>
              <div class="body-text">{{ isResBodyTooMany ? previewResBodyWhenTooMany : resBody }}</div>
              <el-link v-if="isResBodyTooMany" type="primary" icon="el-icon-view" @click="seeMoreInBrowser">
                Explore It In Browser
              </el-link>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script>
import { getMimeType } from '../../../lib/js/mime'

export default {
  props: {
    detail: {
      type: Object,
      default() {
        return {
          id: null,
          url: '-',
          method: '-',
          protocol: '-',
          statusCode: '-',
        }
      },
    },
  },

  data() {
    return {
      drawer: false,

      activeNames_Req: ['0', '1', '2', '3', '4'],
      activeNames_Res: ['0', '1', '2', '3'],

      statusTxt: '',

      Authorization: null,
      authDecodeStatus: false,
      Cookie: null,
      reqBodyType: null,
      urlencodedSwitchStatus: false,

      resBody: null,
      resBodyType: null,
      SetCookie: null,
      jsonSwitchStatus: false,
    }
  },

  computed: {
    req_general() {
      if (!this.detail) return {}
      return {
        Url: this.detail.url,
        Method: this.detail.method,
        Protocol: this.detail.protocol,
      }
    },

    req_header() {
      if (!this.detail) return {}
      this.Authorization = this.detail.reqHeader.Authorization
      this.Cookie = this.detail.reqHeader.Cookie || this.detail.reqHeader.cookie
      this.reqBodyType = getMimeType(this.detail.reqHeader['Content-Type'] || this.detail.reqHeader['content-type'])
      delete this.detail.reqHeader.Authorization
      delete this.detail.reqHeader.Cookie
      delete this.detail.reqHeader.cookie
      return this.detail.reqHeader
    },

    req_body() {
      if (!this.detail) return null
      return this.detail.reqBody
    },

    authType() {
      if (!this.Authorization) return null
      return this.Authorization.split(' ')[0]
    },

    authMsg() {
      if (!this.Authorization) return null
      return this.Authorization.split(' ')[1]
    },

    authDecode() {
      if (!this.Authorization) return null
      return atob(this.authMsg)
    },

    cookieObj() {
      return this.cookie2Obj(this.Cookie)
    },

    res_general() {
      if (!this.detail) return {}
      return { 'Status Code': this.detail.statusCode + ' ' + this.statusTxt }
    },

    res_header() {
      if (!this.detail) return {}
      this.SetCookie = this.detail.resHeader['Set-Cookie'] || this.detail.resHeader['set-cookie']
      this.resBodyType = getMimeType(this.detail.resHeader['Content-Type'] || this.detail.resHeader['content-type'])
      delete this.detail.resHeader['Set-Cookie']
      delete this.detail.resHeader['set-cookie']
      return this.detail.resHeader
    },

    setCookieObj() {
      return this.cookie2Obj(this.SetCookie)
    },

    urlencodedObj() {
      if (!this.detail || this.reqBodyType !== 'urlencoded') return null
      return this.urlencoded2Obj(this.req_body)
    },

    resBody_json() {
      if (!this.detail || this.resBodyType !== 'json') return null
      return ['{', '['].includes(this.resBody.slice(0, 1)) ? JSON.parse(this.resBody) : null
    },

    res_image_url() {
      if (!this.detail || this.resBodyType !== 'image') return null
      return `file://${this.$proxyConfig.state.cachePath}/res_body_${this.detail.id}`
    },

    isResBodyTooMany() {
      if (!this.detail) return false
      let lmt = 300 * 1024 // 300KB
      return this.detail.length > lmt
    },

    previewResBodyWhenTooMany() {
      return this.isResBodyTooMany ? this.resBody.slice(0, 500) : ''
    },
  },

  watch: {
    'detail.id'(newId) {
      this.$forceUpdate()
      if (newId) {
        this.$ipcRenderer.send('fetch-status-code', this.detail.statusCode)
        this.$ipcRenderer.send('fetch-res-body', newId)

        this.isResBodyTooMany

        // this.jsonSwitchStatus = this.urlencodedSwitchStatus = false  // delete last choice
      }
    },

    drawer(newStatus) {
      if (newStatus) {
      } else {
        this.$emit('closed')
      }
    },
  },

  methods: {
    getObjFromStr(str, splitStr, equalStr = '=') {
      if (!str) return null
      let obj = {}
      str.split(splitStr).forEach((i) => {
        i = i.replace(/^\s+/g, '')
        if (i) {
          let firstEqualIndex = i.indexOf(equalStr)
          obj[i.slice(0, firstEqualIndex)] = i.slice(firstEqualIndex + 1)
        }
      })
      return obj
    },

    cookie2Obj(str) {
      return this.getObjFromStr(str, ';')
    },

    urlencoded2Obj(str) {
      return this.getObjFromStr(str, '&')
    },

    seeMoreInBrowser() {
      const { shell } = require('electron')
      shell.openExternal(this.detail.url)
    },
  },

  mounted() {
    this.$ipcRenderer.on('reply-status-code', (event, arg) => {
      this.statusTxt = arg
    })
    this.$ipcRenderer.on('reply-res-body', (event, resBody) => {
      this.resBody = resBody
      this.drawer = true
    })
    this.$ipcRenderer.on('reply-res-body-error', (event, error) => {
      console.error(error)
      this.$message.error({
        message: 'Load Response Error: ' + error.message,
        offset: 100,
      })
    })
  },
}
</script>

<style lang="scss">
.record-detail {
  padding: 10px;

  div.el-collapse-item__header::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 60%;
    background-color: #409eff;
    margin-right: 10px;
  }

  div.el-collapse-item__content {
    margin: 0 20px;
  }

  .detail-item {
    display: flex;
    color: #606266;
    padding: 2px 15px;
    align-items: center;
    justify-content: space-between;

    &:not(:last-child) {
      border-bottom: 1px solid #f2f6fc;
    }

    &:nth-child(2n) {
      background-color: #fafafa;
    }

    &:hover {
      background-color: #f7fbff;
    }

    & > span:first-child {
      font-weight: bold;
      margin-right: 20px;
    }

    & > span:last-child {
      max-width: 65%;
      text-align: right;
      word-break: break-word;
    }

    &:first-child > span:last-child {
      max-width: 85%;
    }
  }

  div.el-tabs__item {
    box-shadow: none !important;
  }

  div.el-tabs__content {
    overflow: auto;
    height: calc(100vh - 80px);
  }

  div.el-switch {
    margin: 15px;
  }

  .body-text {
    background-color: #f7fbff;
    overflow-x: scroll;
    padding: 10px 15px;
    font-family: Consolas, Menlo, Courier, monospace;
    font-size: 12px;
  }

  .res-image {
    padding: 0 15px;

    .image-preview-tip {
      margin-bottom: 15px;
    }

    .image-preview-error {
      background-color: #f7fbff;
      padding: 5px 15px;
      color: #909399;
      border-radius: 5px;
    }
  }

  .el-alert {
    margin-bottom: 15px;
  }

  a.el-link {
    width: 100%;
    font-weight: 400;
    font-size: 12px;
    background-image: linear-gradient(rgba(247, 251, 255, 0.74), rgb(255, 255, 255), #fff);
    margin-top: -40px;
    padding-top: 20px;
  }

  div.jv-container {
    font-size: 12px;
  }
}
</style>
