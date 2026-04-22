<template>
  <div>
    <AdvanceTable title="合规模板列表" :data="list" :params="params" :total="total" :searchConfigs="templateSearchConfigs" :columns="templateColumns" :get-list="getList" :loading="loading" ref="multipleTable" >
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
      <template #itemType="itemType">
        {{ getName(itemType) }}
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="edit(record)">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record, false)">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
      </template>
    </AdvanceTable>
    <add-template v-if="addDialog.show" :dialog="addDialog" @getList="getList"></add-template>
  </div>
</template>

<script>
import { getTemplateList, removeTemplate } from 'services/task/compliance'
import { templateColumns, templateSearchConfigs } from './config'

export default {
  components: {
    addTemplate: () => import('./components/addTemplate')
  },
  data() {
    return {
      templateColumns,
      templateSearchConfigs,
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      addDialog: {
        show: false,
        title: ''
      }
    }
  },
  methods: {
    getList(data) {
      getTemplateList(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    remove(row) {
      this.$confirm(`是否确认删除【${row.name}】`, '操作确认', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeTemplate(row.id).then((data) => {
          if (data.success) {
            this.$message.success(data.message)
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
