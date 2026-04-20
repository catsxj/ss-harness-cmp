<template>
  <div class="wrapper">
    <!-- 密钥列表 -->
    <common-detail v-if="detaildialogVisible" :title="detail.name" @goBack="detaildialogVisible = false">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="指纹">{{ detail.fingerprint }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="公钥" name="second">
          <div style="width: 100%; word-break: break-all">
            {{ detail.publicKey }}
          </div>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate"> 新增</el-button>
      </template>
      <template #status="status">
        <status-icon :type="status | snapshotColor">{{ status | snapshot }}</status-icon>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.projectVisibility && record.projectVisibility != 'GLOBAL_PROJECT'" @click="handleOperate({ flag: 4, id: record.id })"> <i class="el-icon-delete"></i> 删除 </el-button>
      </template>
    </AdvanceTable>
    <add :add-data="addData" v-if="addData.dialog" @back="getData"></add>
  </div>
</template>

<script>
import add from './dialog/add.vue'
import { getKey, removeKey, detailKey } from 'services/platform/index'
const columns = [
  {
    label: '密钥名称',
    prop: 'name'
  },
  {
    label: '指纹',
    prop: 'fingerprint'
  },
  {
    label: '所属地域',
    prop: 'regionName'
  },
  {
    label: '资源组',
    prop: 'resourceGroupName'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: { add },
  data() {
    return {
      columns,
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      // 列表密钥数据
      tableData: [],
      // list列表分页
      total: 0,
      addData: {
        dialog: false,
        data: {}
      },
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorType', initValue: 'ALIYUN' }
      ],
      detaildialogVisible: false,
      detail: {}
    }
  },
  methods: {
    getData() {
      this.loading = true
      getKey(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    // 对密钥进行操作
    handleOperate(command) {
      switch (command.flag / 1) {
        case 4:
          // 删除
          this.handleTip(command.id, command.flag)
          break
      }
    },
    handleTip(id, index, groupId) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeKey(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getData()
          }
        })
      })
    },
    // 新增密钥
    handleCreate() {
      this.addData = {
        dialog: true,
        data: {}
      }
    },
    // 详情
    getDetail(id) {
      this.detaildialogVisible = true
      detailKey(id).then(data => {
        if (data.success) {
          this.detail = data.data
        }
      })
    }
  }
}
</script>

<style scoped></style>
