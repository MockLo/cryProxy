<template>
  <div id="app">
    <el-container style="width: 100vw; height: 100vh;">
      <el-aside style="width: 150px; background-color: #545c64;">
        <div class="up">
          <div class="appTitle">Cry<span>Proxy</span></div>
          <StatusLight :status="recordingStatus" />
        </div>
        <el-menu
          default-active="1"
          style="width: 150px;"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          class="navMenu"
        >
          <el-menu-item index="1">
            <i class="el-icon-receiving"></i>
            <span slot="title">Record</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-tickets"></i>
            <span slot="title">Rule</span>
          </el-menu-item>
          <el-menu-item index="3">
            <i class="el-icon-guide"></i>
            <span slot="title">Map</span>
          </el-menu-item>
          <el-menu-item index="4">
            <i class="el-icon-truck"></i>
            <span slot="title">Tool</span>
          </el-menu-item>
          <el-menu-item index="5">
            <i class="el-icon-setting"></i>
            <span slot="title">Setting</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="appPage">
        <component :is="currentTabComponent"></component>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import StatusLight from './components/StatusLight'
import RecordPage from './components/Pages/Record'

export default {
  name: 'cryapi',

  components: { StatusLight, RecordPage },

  data() {
    return {
      currentTabComponent: 'RecordPage',
    }
  },

  computed: {
    recordingStatus() {
      return this.$proxyConfig.state.recording
    },
  },
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
  color: #303133;
}

.up {
  display: flex;
  flex-direction: column;
}

.appTitle {
  text-align: center;
  font-size: 2em;
  margin: 20px 0;
  color: #fff;

  & > span {
    font-weight: lighter;
  }
}

.appPage {
  padding: 10px;
}
</style>
