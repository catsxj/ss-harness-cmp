<template>
  <div>
    <AdvanceTable title="巡检指标列表" :data="list" :searchConfigs="inspectNormSearchConfigs" :params="params" :total="total" :columns="inspectNormColumns" :get-list="getList" :loading="loading" ref="multipleTable">
      <template #action>
        <el-button type="primary" @click="create()" icon="el-icon-plus">
          新增
        </el-button>
      </template>
      <template #name="name, record">
        <span class="detail-href" @click="view(record)">
          {{ name }}
        </span>
      </template>
      <template #targetType="targetType">
        {{ getName(targetType) }}
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="create(record)">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)" icon="el-icon-delete"> 删除 </el-button>
      </template>
    </AdvanceTable>
    <create-norm v-if="dialogVisible" :status="status" :id="targetId" @goBack="handleGoBack"></create-norm>
  </div>
</template>

<script>
import CreateNorm from './createNorm'
import { normList } from './utils/index'
import { getInspectItem, removeInspectItem, removeBatchInspectItem } from 'services/task/inspect'
import { inspectNormColumns, inspectNormSearchConfigs } from './config'
export default {
  components: {
    CreateNorm
  },
  data() {
    return {
      inspectNormColumns,
      inspectNormSearchConfigs,
      loading: false,
      removeAllLoading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      dialogVisible: false,
      targetId: '',
      status: 'create'
    }
  },
  methods: {
    getName(code) {
      for (const item of normList) {
        if (item.code === code) {
          return item.name
        }
      }
    },
    getList(data) {
      getInspectItem(this.params).then((data) => {
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
        removeInspectItem(data.id).then((data) => {
          if (data.success) {
            this.$message({ message: '删除成功', type: 'success' })
            this.getList()
          }
        })
      })
    },
    view(row) {
      this.targetId = row.id
      this.status = 'view'
      this.dialogVisible = true
    },
    create(row) {
      if (row) {
        this.targetId = row.id
        this.status = 'update'
        this.dialogVisible = true
      } else {
        this.targetId = ''
        this.status = 'create'
        this.dialogVisible = true
      }
    },
    handleGoBack(val) {
      this.dialogVisible = false
      if (val) {
        this.getList()
      }
    }
  }
}
</script>
