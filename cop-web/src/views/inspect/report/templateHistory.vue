<template>
  <div class="template_history">
    <common-detail @goBack="back" title="报表历史">
      <!-- <div slot="detail_header" class="pull-right">
        <el-button type="primary" @click="down('pdf')">PDF导出</el-button>
        <el-button type="primary" @click="down('excel')">EXCEL导出</el-button>
      </div> -->
      <template #item_container>
        <div class="content" v-loading="loading" element-loading-text="报表生成中" element-loading-spinner="el-icon-loading">
          <div class="title">{{dialog.name}}</div>
          <el-row></el-row>
          <el-row>
            <el-col :span="24" class="item" v-for="(listItem, lindex) in list" :key="`lindex${lindex}`">
              <el-row>
                <el-col class="item" :span="12">
                  <span>{{listItem.name}}</span>
                </el-col>
                <el-col class="item" :span="8">
                  <span>{{listItem.status}}</span>
                </el-col>
                <el-col class="item" :span="4">
                  <span v-if="listItem.status === '总体正常'">详情</span>
                  <span v-else class="detail-href" @click="view(listItem)">详情</span>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </div>
      </template>
    </common-detail>
    <detail v-if="detailDialog.show" :dialog="detailDialog"></detail>
  </div>
</template>

<script>
import { getReportsHistorys, downloadTpl } from 'services/task/inspect'
export default {
  components: {
    detail: () => import('./templateHistoryDetail')
  },
  props: {
    dialog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      detailDialog: {
        show: false,
        title: ''
      },
      list: [],
      listId: null
    }
  },
  created() {
    this.getData()
  },
  methods: {
    back() {
      this.dialog.show = false
    },
    getData(data) {
      const params = {}
      params.params = JSON.stringify([
        {
          param: { reportId: this.dialog.id },
          sign: 'EQ'
        }
      ])
      getReportsHistorys(params).then((data) => {
        if (data.success) {
          this.list = JSON.parse(data.data.rows[0]?.baseMsg)
          this.listId = data.data.rows[0]?.id
        }
      })
    },
    view(row) {
      this.detailDialog.show = true
      this.detailDialog.id = row.key
      this.detailDialog.reportId = this.listId
      this.detailDialog.name = row.name
      this.detailDialog.ids = row.inspectId || []
    },
    down(type) {
      const id = this.listId
      if (type == 'pdf') {
        downloadTpl(id, 'pdfAll')
      } else if (type == 'excel') {
        downloadTpl(id, 'excelAll')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.template_history {
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
