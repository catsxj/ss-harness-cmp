<template>
  <div class="history">
    <common-detail @goBack="back" title="报表历史">
      <template #item_container>
        <AdvanceTable :data="list" :searchConfigs="reportHistorySearchConfigs" :params="params" :total="total" :columns="reportHistoryColumns" :get-list="getData"
          :loading="loading" ref="table">
          <template #reportName="reportName, record">
            <el-button type="text" @click="view(record)">
              {{reportName}}
            </el-button>
          </template>
        </AdvanceTable>
      </template>
    </common-detail>
    <detail v-if="detailDialog.show" :dialog="detailDialog"></detail>
  </div>
</template>

<script>
import { getReportsHistorys } from 'services/task/inspect'
export default {
  components: {
    detail: () => import('./historyDetail')
  },
  props: {
    dialog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      reportHistorySearchConfigs: [
        {
          label: '报表名称',
          value: 'name',
          type: 'Input',
          sign: 'LK'
        },
        {
          label: '生成',
          value: 'gmtCreate',
          type: 'DateRange'
        },
        {
          label: '',
          value: 'reportId',
          type: 'Const',
          initValue: this.dialog.id
        }
      ],
      reportHistoryColumns: [
        { label: '报表名称', prop: 'reportName', scopedSlots: { customRender: 'reportName' } },
        { label: '生成时间', prop: 'gmtCreate' }
      ],
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      superSearchList: [],
      searchData: [],
      detailDialog: {
        show: false,
        title: ''
      }
    }
  },
  computed: {
    canDelete() {
      return this.idList && this.idList.length > 0
    }
  },
  methods: {
    back() {
      this.dialog.show = false
    },
    getData(data) {
      getReportsHistorys(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    view(row) {
      this.detailDialog.show = true
      this.detailDialog.id = row.id
      this.detailDialog.reportId = this.dialog.id
      // this.detailDialog.title = row.name
      // this.detailDialog.id = row.id
      // this.detailDialog.isview = true
      // this.detailDialog.name = row?.name
    },
    handleSelectItem(selection) {
      this.idList = []
      selection.forEach((item) => {
        this.idList.push(item.id)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.history {
  background: #fff;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 99;

  .detail-content {
    padding: 20px;
  }
}
</style>
