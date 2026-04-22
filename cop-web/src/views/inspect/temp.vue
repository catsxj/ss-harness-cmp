<template>
  <div>
    <AdvanceTable title="巡检模板列表" :data="list" :params="params" :total="total" :searchConfigs="inspectTempSearchConfigs" :columns="inspectTempColumns" :get-list="getList" :loading="loading" ref="multipleTable">
      <template #action>
        <el-button type="primary" @click="add" icon="el-icon-plus">
          新增
        </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="view(record)">
          {{ val }}
        </span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="edit(record)">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)" icon="el-icon-delete"> 删除 </el-button>
      </template>
    </AdvanceTable>
    <add-temp v-if="addDialog.show" :dialog="addDialog" @getList="getList"></add-temp>
  </div>
</template>

<script>
import { getTemplates, removeTemplates } from 'services/task/inspect'
import { inspectTempColumns, inspectTempSearchConfigs } from './config'

export default {
  components: {
    addTemp: () => import('./components/addTemp')
  },
  data() {
    return {
      inspectTempColumns,
      inspectTempSearchConfigs,
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      searchData: [],
      addDialog: {
        show: false,
        title: ''
      }
    }
  },
  methods: {
    getList(data) {
      getTemplates(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleDelete(data) {
      this.$confirm(`是否确认删除【${data.name}】`, '操作确认', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeTemplates(data.id).then((data) => {
          if (data.success) {
            this.$message({ message: '删除成功', type: 'success' })
            this.getList()
          }
        })
      })
    },
    view(row) {
      this.addDialog.show = true
      this.addDialog.title = row.name
      this.addDialog.id = row.id
      this.addDialog.isview = true
      this.addDialog.name = row?.name
    },
    // 新增
    add() {
      this.addDialog.show = true
      this.addDialog.title = '新增模板'
      this.addDialog.id = null
      this.addDialog.isview = false
    },
    edit(data) {
      this.addDialog.show = true
      this.addDialog.title = '编辑模板'
      this.addDialog.id = data?.id
      this.addDialog.name = data?.name
      this.addDialog.isview = false
    }
  }
}
</script>
