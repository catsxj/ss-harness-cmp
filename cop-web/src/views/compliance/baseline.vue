<template>
  <div>
    <AdvanceTable title="基线合规列表" :data="list" :params="params" :total="total" :searchConfigs="baselineSearchConfigs" :columns="baselineColumns" :get-list="getList" :loading="loading" ref="multipleTable" >
      <template #action>
        <el-button type="primary" @click="create()" icon="el-icon-plus">
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
        <el-button type="text" @click="create(record)">
          <i class="el-icon-edit"></i>
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record)">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
      </template>
    </AdvanceTable>
    <!-- 文件导入 -->
    <create-norm v-if="dialogVisible" :status="status" :id="targetId" @goBack="handleGoBack"></create-norm>
  </div>
</template>

<script>
import CreateNorm from './components/addBaseline'
import { normList } from './utils/index'
import { getBaseLineList, removeBaseLine } from 'services/task/compliance'
import { baselineColumns, baselineSearchConfigs } from './config'

export default {
  components: {
    CreateNorm
  },
  data() {
    return {
      baselineColumns,
      baselineSearchConfigs,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      dialogVisible: false,
      loading: false,
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
      getBaseLineList(this.params).then((data) => {
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
        removeBaseLine(row.id).then((data) => {
          if (data.success) {
            this.$notify.success(data.message)
            this.getList()
            this.idList = []
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
