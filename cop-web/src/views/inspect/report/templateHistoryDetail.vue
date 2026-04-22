<template>
  <div class="reportDetail">
    <common-detail @goBack="back" title="巡检报表详情">
      <!-- <div slot="detail_header" class="pull-right">
        <el-button type="primary" @click="down('pdf')" :loading="downBtnPdf">PDF导出</el-button>
        <el-button type="primary" @click="down('excel')" :loading="downBtnExcel">EXCEL导出</el-button>
      </div> -->
      <template #item_container>
        <div class="content">
          <basic-table border :data="historyData" maxHeight="500">
            <el-table-column label="资源组名称" prop="groupName" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="主机名称" prop="resourceName" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="主机ip" prop="ip" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="指标项" prop="itemName" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="指标值" prop="inspectValue" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{`${scope.row.valueName || ''}:`}} {{scope.row.value}}</span>
              </template>
            </el-table-column>
            <el-table-column label="告警" show-overflow-tooltip>
              <template slot-scope="scope">
                <span :style="{color: scope.row.color}">
                  {{scope.row.warnText}}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="规则" prop="rule" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="阈值" prop="threshold" show-overflow-tooltip>
            </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </div>
      </template>
    </common-detail>
  </div>
</template>

<script>
import { getReportsHistorysTemplateDetail } from 'services/task/inspect'
export default {
  props: {
    dialog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      downBtnPdf: false,
      downBtnExcel: false,
      historyData: [],
      baseMsg: [],
      listMsg: [],
      title: '',
      transRule: {
        GT: '大于',
        EQ: '等于',
        LT: '小于',
        GE: '大于等于',
        LE: '小于等于',
        NEQ: '不等于',
        IN: '包含',
        NIN: '不包含'
      },
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
      const that = this
      getReportsHistorysTemplateDetail({ id: this.dialog.reportId, key: this.dialog.id }).then((data) => {
        this.historyData = data.data.map((item) => {
          const JT = JSON.parse(item.targetRule)
          item.color = JT.color || ''
          item.warnText = JT.description || ''
          item.rule = that.transRule[JT.rule] || ''
          item.threshold = JT.threshold || ''
          return item
        })
      })
    },
    // 导出数据
    down(type) {
      let url = '/api/cop/v1/inspect/report/export/excelOfReportId'
      if (type === 'pdf') {
        url = '/api/cop/v1/inspect/report/export/pdfOfReportId'
      }
      if (type === 'pdf') {
        this.downBtnPdf = true
      } else {
        this.downBtnExcel = true
      }
      const params = {}
      params.params = JSON.stringify({ ids: this.dialog.ids, name: this.dialog.name })
      this.$exportData(url, params).finally((_) => {
        if (type === 'pdf') {
          this.downBtnPdf = false
        } else {
          this.downBtnExcel = false
        }
      })
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
  padding: 0;

  .content {
    margin: 20px;
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
