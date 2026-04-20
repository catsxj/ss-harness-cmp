<template>
  <div>
    <AdvanceTable :card-border="false" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button @click="handleAdd" type="primary">创建</el-button>
      </template>
      <template #isAutoAllocate="val">
        {{ val ? '是' : '否' }}
      </template>
      <template #operate="val, record">
        <el-button v-if="record.ack !== true" type="text" @click="handleEdit(record)">编辑</el-button>
        <el-button v-if="record.ack !== true" type="text" @click="handleDel(record)">删除</el-button>
      </template>
    </AdvanceTable>
    <createAallocationRules :dialog="dialog" v-if="dialog.visible" @getList="getList"></createAallocationRules>
  </div>
</template>

<script>
import { getSplitRule, removeSplitRule } from 'services/services/bill'
import createAallocationRules from './createAallocationRules'

export default {
  components: { createAallocationRules },
  data() {
    return {
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '自动分摊',
          prop: 'isAutoAllocate',
          scopedSlots: { customRender: 'isAutoAllocate' }
        },
        {
          label: '资源ID',
          prop: 'resourceId'
        },

        {
          label: '分摊' + this.$store.getters.systemConfig.projectConfigLabel + '数量',
          prop: 'projectCount'
        },
        {
          label: '创建人',
          prop: 'creatorName'
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        },
        {
          label: '操作',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      loading: false,
      list: [],
      total: null,
      listQuery: {
        name: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      searchConfigs: [
        { label: '名称', value: 'name', type: 'Input' },
        {
          label: '自动分摊',
          value: 'isAutoAllocate',
          type: 'Select',
          data: [
            { id: true, name: '是' },
            { id: false, name: '否' }
          ]
        },
        { label: '资源ID', value: 'resourceId', type: 'Input' }
      ],
      searchParams: {
        params: []
      },
      selectList: [],
      dialog: {
        visible: false,
        title: ''
      }
    }
  },
  watch: {
    $route: function (val, oldVal) {
      this.handleSearch()
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    handleDel(record) {
      if (!record) record = this.selectList
      else record = [record]
      this.$confirm('您确定要删除该规则吗?', '提示', {
        type: 'warning'
      }).then(() => {
        removeSplitRule(record.map(({ id }) => id)).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.getList()
          }
        })
      })
    },

    handleAdd() {
      this.dialog = {
        visible: true,
        title: '创建分摊规则',
        type: 'add'
      }
    },
    handleEdit(data) {
      this.dialog = {
        visible: true,
        title: '编辑分摊规则',
        type: 'edit',
        data: data
      }
    },

    goBack() {
      this.detailFlag = false
    },

    getList() {
      this.loading = true
      this.dialog.visible = false
      getSplitRule({ params: this.params }).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        name: this.listQuery.name
      })
      this.getList()
    }
  }
}
</script>
<style scoped>
.key-name {
  display: inline-block;
  width: 120px;
  text-align: right;
  margin-bottom: 10px;
}
.tenant-name {
  display: block;
  font-size: 30px;
  margin-left: 50px;
}
.count {
  font-size: 60px;
  font-weight: bolder;
  margin-left: 50px;
}
</style>
