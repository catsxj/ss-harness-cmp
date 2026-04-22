<template>
  <div class="reportDetail">
    <common-detail @goBack="back" title="打印报表预览">
      <div slot="detail_header" class="pull-right">
        <el-button type="primary" @click="down('pdf')">PDF导出</el-button>
        <el-button type="primary" @click="down('excel')">EXCEL导出</el-button>
      </div>
      <template #item_container>
        <div class="content" v-loading="loading" element-loading-text="报表生成中" element-loading-spinner="el-icon-loading">
          <div class="title">{{title}}</div>
          <el-row></el-row>
          <el-row v-for="(baseItem, bindex) in baseMsg" :key="`bindx${bindex}`">
            <el-col class="item bgdd" :span="4">
              {{baseItem.remark}}
            </el-col>
            <el-col class="item" :span="20">
              {{baseItem.value}}
            </el-col>
          </el-row>
          <el-row type="flex">
            <el-col class="item" v-for="(listItem, lindex) in listMsg" :key="`lindex${lindex}`">
            </el-col>
          </el-row>
          <basic-table border :data="historyData">
            <el-table-column v-for="(listItem, lindex) in listMsg" :key="`lindex${lindex}`" :label="listItem.name" show-overflow-tooltip>
              <template slot-scope="scope">
                <span style="white-space: pre-line">{{scope.row[listItem.code]}}</span>
              </template>
            </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </div>
      </template>
    </common-detail>
  </div>
</template>

<script>
import { getReportsHistorysDetail, downloadTpl } from 'services/task/inspect'
export default {
  props: {
    dialog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      historyData: [],
      baseMsg: [],
      listMsg: [],
      title: '',
      runStatusList: [
        { id: 'STARTING', name: '启动中' },
        { id: 'RUNNING', name: '执行中' },
        { id: 'SUCCESS', name: '成功' },
        { id: 'ERROR', name: '错误' }
      ],
      warningStatusList: [
        { id: false, code: 'false', name: '正常' },
        { id: true, code: 'true', name: '告警' }
      ]
    }
  },
  created() {
    this.getRecordDetail()
  },
  methods: {
    back() {
      this.dialog.show = false
    },
    getRecordDetail() {
      getReportsHistorysDetail(this.dialog.id)
        .then((data) => {
          this.title = data.data?.title
          this.baseMsg = JSON.parse(data.data.baseMsg)
          this.listMsg = JSON.parse(data.data.listMsg)
          this.historyData = data.data.listObjects
        })
        .finally((_) => {
          this.loading = false
        })
    },
    down(type) {
      const id = this.dialog.id
      downloadTpl(id, type)
    }
  }
}
</script>
<style lang="scss" scoped>
.reportDetail {
  background: #fff;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  overflow-x: hidden;
  padding: 20 80px;

  .content {
    margin: 40px;
    text-align: center;

    .title {
      border: 1px solid #eee;
      height: 80px;
      line-height: 80px;
      background: #f5f7fa;
      font-size: 18px;
      font-weight: 550;
    }

    .item {
      border: 1px solid #eee;
      height: 32px;
      line-height: 32px;
    }

    .bgdd {
      background: #f5f7fa;
      font-weight: 550;
    }
  }
}
</style>
