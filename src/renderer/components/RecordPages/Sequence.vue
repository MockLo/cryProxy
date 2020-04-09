<template>
  <div class="page-recorder-sequence">
    <el-table
      ref="sequenceTable"
      :data="list"
      size="mini"
      :height="'calc(93vh - 70px)'"
      :stripe="true"
      highlight-current-row
      @current-change="handleCurrentChange"
    >
      <!-- <el-table-column width="50" label="#" prop="id"></el-table-column> -->
      <el-table-column width="90" label="Protocol" align="center">
        <template slot-scope="scope">
          {{ scope.row.protocol || scope.row.url.split('://')[0] }}
          <i v-if="!isHTTP(scope.row.protocol)" class="el-icon-lock"></i>
        </template>
      </el-table-column>
      <el-table-column width="100" label="Method" prop="method" align="center"></el-table-column>
      <el-table-column width="80" label="Code" align="center">
        <span slot-scope="scope" :class="getCodeClass(scope.row.statusCode)">{{ scope.row.statusCode }}</span>
      </el-table-column>
      <el-table-column width="200" label="Host" prop="host" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column min-width="200" label="Path" prop="path" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column width="200" label="MIME" prop="mime" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column width="80" label="Start" :formatter="fmtDate"></el-table-column>
      <el-table-column width="80" label="Duration" :formatter="fmtDuration" align="right"></el-table-column>
      <el-table-column width="90" label="Size" :formatter="fmtSize" align="right"></el-table-column>
      <!-- <span slot="append" ref="appendLine">&nbsp;</span> -->
    </el-table>
  </div>
</template>

<script>
import dateFormat from 'dateformat'

export default {
  name: 'Sequence',

  props: {
    list: {
      type: Array,
      default() {
        return []
      },
    },

    eventBus: {
      required: true,
    },
  },

  methods: {
    isHTTP: (protocol) => protocol.toLowerCase() === 'http',

    fmtDate: (row) => dateFormat(row.startTime, 'isoTime'),

    fmtDuration: (row) => {
      let { duration } = row
      return duration < 1000
        ? `${duration} ms`
        : duration < 60000
        ? `${(duration / 1000).toFixed(2)} s`
        : `${(duration / 60000).toFixed(2)} min`
    },

    fmtSize: (row) => {
      let { length } = row
      return length < 1024
        ? `${length} B`
        : length < 1048576
        ? `${(length / 1024).toFixed(2)} KB`
        : `${(length / 1048576).toFixed(2)} MB`
    },

    getCodeClass(code) {
      let firstNum = +('' + code).slice(0, 1)
      switch (firstNum) {
        case 1:
          return 'codeStatus-temp'
        case 2:
          return 'codeStatus-success'
        case 3:
          return 'codeStatus-warn'
        case 4:
        case 5:
          return 'codeStatus-error'
        default:
          return ''
      }
    },

    handleCurrentChange(crtRow) {
      this.eventBus.$emit('select-item', crtRow)
    },

    clearSelect() {
      this.$refs.sequenceTable && this.$refs.sequenceTable.setCurrentRow()
    },
  },

  mounted() {
    this.eventBus.$on('clear-select', () => {
      this.clearSelect()
    })
  },
}
</script>

<style lang="scss">
.page-recorder-sequence {
  & > div {
    overflow: auto;
  }

  & span.codeStatus-temp {
    color: #909399;
  }

  & span.codeStatus-success {
    color: #67c23a;
  }

  & span.codeStatus-warn {
    color: #e6a23c;
  }

  & span.codeStatus-error {
    color: #f56c6c;
  }

  & table > tbody {
    cursor: pointer;
  }

  tr.current-row td {
    background-color: rgba(84, 92, 100, 0.78) !important;
    color: #fff;
  }
}
</style>
