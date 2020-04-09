<template>
  <div class="pageRecord">
    <el-row class="ctrlBar" :gutter="20" type="flex" align="middle" justify="space-between">
      <el-col :span="4">
        <el-tooltip :content="recordingStatus ? 'Stop Recording' : 'Start Recording'" placement="bottom">
          <el-button
            :type="recordingStatus ? 'danger' : 'primary'"
            icon="el-icon-video-play"
            circle
            @click="switchProxyStatus"
          ></el-button>
        </el-tooltip>
        <el-tooltip content="Clear History" placement="bottom">
          <el-button type="warning" icon="el-icon-brush" circle @click="clearProxyHistory"></el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="14">
        <el-input v-model="filterInput">
          <template slot="prepend">Filter :</template>
        </el-input>
      </el-col>
      <el-col :span="4" class="ctrlBar_right">
        <el-popover placement="bottom" width="150" trigger="hover">
          <el-table :data="switchData" :show-header="false" size="small">
            <el-table-column width="100" prop="name"></el-table-column>
            <el-table-column width="50">
              <el-switch
                slot-scope="scope"
                v-model="scope.row.status"
                @change="statusChange($event, scope.row.name)"
              ></el-switch>
            </el-table-column>
          </el-table>
          <el-button slot="reference" icon="el-icon-open" circle></el-button>
        </el-popover>
        <el-popover class="info" placement="bottom" width="180" trigger="hover">
          <el-table :data="infoData" :show-header="false" size="small">
            <el-table-column width="100">
              <span slot-scope="scope" style="font-weight: bold;">{{ scope.row.name }}</span>
            </el-table-column>
            <el-table-column width="80" prop="value" align="right"></el-table-column>
          </el-table>
          <el-button slot="reference" icon="el-icon-info" circle></el-button>
        </el-popover>
      </el-col>
    </el-row>

    <el-divider></el-divider>

    <keep-alive>
      <el-tabs v-model="activeTabName" type="card">
        <el-tab-pane>
          <span slot="label"><i class="el-icon-folder-opened"></i> Structure</span>
          <Structure v-if="activeTabName === '0'" />
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"><i class="el-icon-s-data"></i> Sequence</span>
          <Sequence v-if="activeTabName === '1'" :list="showingList" :eventBus="bus" />
        </el-tab-pane>
      </el-tabs>
    </keep-alive>

    <Detail :detail="crtReq" @closed="detailClosing" />
  </div>
</template>

<script>
import Vue from 'vue'
import Structure from '../RecordPages/Structure'
import Sequence from '../RecordPages/Sequence'
import Detail from '../RecordPages/Detail'

const bus = new Vue()

export default {
  components: { Structure, Sequence, Detail },

  data() {
    return {
      bus,

      activeTabName: '1',

      filterInput: '',

      recordingStatus: this.$proxyConfig.state.recording,

      httpsStatus: this.$proxyConfig.state.recordingHttps,

      throttleStatus: this.$proxyConfig.state.throttle !== 10000,

      reqDataMap: {},

      crtReq: null,
    }
  },

  computed: {
    switchData() {
      return [
        { name: 'HTTPS', status: this.httpsStatus },
        { name: 'Throttle', status: this.throttleStatus },
      ]
    },

    infoData() {
      return [
        { name: 'Port', value: this.$proxyConfig.state.port },
        { name: 'Recording', value: this.recordingStatus ? 'ON' : 'OFF' },
        { name: 'HTTPS', value: this.httpsStatus ? 'ON' : 'OFF' },
        {
          name: 'Throttle',
          value: this.$proxyConfig.state.throttleStatus
            ? this.$proxyConfig.state.throttle === 10000
              ? 'No Limit'
              : this.$proxyConfig.state.throttle + 'kb/s'
            : 'OFF',
        },
      ]
    },

    showingList() {
      let arr = []
      for (const key in this.reqDataMap) {
        if (this.reqDataMap.hasOwnProperty(key)) {
          const _arr = this.reqDataMap[key]
          arr.push(_arr[_arr.length - 1])
        }
      }
      return arr
    },
  },

  watch: {
    recordingStatus(newV) {
      if (!newV) {
        // 停止记录，关闭全局代理
        this.$ipcRenderer.removeAllListeners('to-get-req')
        this.$proxyConfig.setRecording(false)
      } else {
        // 开始记录，开启全局代理
        this.$ipcRenderer.on('to-get-req', this.getReqHanlder)
        this.httpsStatus && this.$proxyConfig.setRecordingHttps(true)
        this.$proxyConfig.setRecording(true)
      }
    },

    httpsStatus(newV) {
      this.$proxyConfig.setRecordingHttps(newV)
    },

    throttleStatus(newV) {
      this.$proxyConfig.setThrottleStatus(newV)
    },
  },

  methods: {
    switchProxyStatus() {
      let status = this.recordingStatus
      this.recordingStatus = !status
      const loading = this.$loading({
        lock: true,
        text: status ? 'Stopping' : 'Starting',
      })
      setTimeout(() => {
        loading.close()
      }, 1000)
    },

    clearProxyHistory() {
      this.reqDataMap = {}
    },

    statusChange(newV, flag) {
      switch (flag) {
        case 'HTTPS':
          this.httpsStatus = newV
          break
        case 'Throttle':
          this.throttleStatus = newV
          break
        default:
          break
      }
    },

    detailClosing() {
      this.bus.$emit('clear-select')
    },

    getReqHanlder(event, reqData) {
      let data = JSON.parse(reqData)
      let id = data.id
      let key = 'reqId-' + id

      if (!this.reqDataMap.hasOwnProperty(key)) {
        this.$set(this.reqDataMap, key, [data])
      } else {
        this.reqDataMap[key].push(data)
      }
    },
  },

  mounted() {
    this.recordingStatus && this.$ipcRenderer.on('to-get-req', this.getReqHanlder)
    this.$ipcRenderer.send('ready-to-init-proxy')
    this.bus.$on('select-item', (arg) => {
      this.crtReq = arg
    })
  },
}
</script>

<style lang="scss">
.pageRecord {
  i.el-icon-s-data {
    transform: rotate(90deg);
  }

  i.el-icon-brush {
    transform: rotate(180deg);
  }

  div.el-tabs__item {
    height: 30px;
    line-height: 30px;
    font-weight: 400;
  }

  div.el-divider--horizontal {
    margin: 12px 0;
  }
}

.ctrlBar {
  padding: 0 30px;
  margin-bottom: 10px;

  button.el-button {
    padding: 6px;
  }

  button.el-button--danger {
    background-image: url('../../assets/stop.png');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 14px;

    & > i {
      opacity: 0;
    }
  }

  div.el-input-group__prepend {
    padding: 0 10px;
    font-size: 12px;
  }

  input.el-input__inner {
    height: 30px;
    line-height: 30px;
  }
}

.ctrlBar_right {
  display: flex;
  justify-content: flex-end;
}

.info {
  margin-left: 10px;
}

.el-drawer {
  outline: none;
}
</style>
