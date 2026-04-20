<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="installDetail" @goBack="goBack">
      <template v-slot:item_container>
        <detail :detail="installDetail"></detail>
      </template>
    </common-detail>
    <AdvanceTable :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate"> 新增 </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ record.name }}</span>
      </template>
      <template #region="val, record">
        <span>{{ record.regionName }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleOperate({ flag: 1, row: record })"> 删除 </el-button>
        <el-button type="text" @click="setTags(record)"> 分配标签 </el-button>
      </template>
    </AdvanceTable>
    <add :add-data="addData" v-if="addData.dialog"></add>
    <tags :add-data="tagData" v-if="tagData.dialog" @back="getData"></tags>
  </el-card>
</template>

<script>
import { getResource, detailResource, removeResource } from 'services/platform/azure'
import add from './add.vue'
import webSocket from '@/common/mixins/getGlobalSocket'
import tags from '@/components/tag/index.vue'
import detail from './detail/index'
const detailSetting = {
  type: 'network',
  columns: [
    [
      { name: '名称', value: 'name' },
      { name: '区域', value: 'regionName' },
      { name: '供应状态', value: 'provisioningState' }
    ],
    [
      { name: 'ID', value: 'resourceGroupUuid' },
      { name: '平台名称', value: 'vendorName' }
    ],
    { name: '标签', value: 'tags' }
  ]
}
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '区域',
    prop: 'regionId',
    scopedSlots: { customRender: 'region' }
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
const searchConfigs = [{ type: 'Input', label: '名称', value: 'name' }]
export default {
  mixins: [webSocket],
  components: { add, detail, tags },
  data() {
    return {
      params: {
        page: 1,
        rows: 10
      },
      loading: false,
      columns,
      searchConfigs,
      detailSetting,
      searchData: {
        name: ''
      },
      tableData: [],
      total: 0,
      detailFlag: false,
      installDetail: {},
      addData: {
        dialog: false,
        data: {}
      },
      tagData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) {
        this.getData()
      }
    },
    setTags(data) {
      const tags = []
      if (data.tags) {
        const tag = JSON.parse(data.tags)
        for (const i in tag) {
          tags.push({ key: i, value: tag[i] })
        }
      }
      this.tagData = {
        dialog: true,
        data: {
          resourceId: data.id,
          action: 'RESOURCEGROUP',
          tags: tags
        }
      }
    },
    getData() {
      this.loading = true
      getResource(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
        this.loading = false
      })
    },
    handleCreatGroup() {
      this.group = true
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getData()
    },
    getDetail(id) {
      detailResource(id).then(data => {
        if (data.success) {
          this.detailFlag = true
          this.installDetail = data.data
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    handleCreate(id) {
      this.addData = {
        dialog: true,
        data: {}
      }
    },
    // 操作
    handleOperate(command) {
      switch (command.flag / 1) {
        case 1:
          // 删除
          this.$prompt(`警告! 资源组${command.row.name}的删除操作是不可逆的。无法撤消你将要执行的操作。继续操作将永久性删除此资源组及其内含的所有资源。请输入名称再次确认！`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValidator: val => {
              if (val == command.row.name) {
                return true
              } else {
                return false
              }
            },
            inputErrorMessage: '输入名称与要删除的资源组名称不匹配'
          }).then(({ value }) => {
            removeResource(command.row.id).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.getData(command.id)
              }
            })
          })
          break
      }
    }
  },
  created() {
    if (this.$route.query.id) {
      this.getDetail(this.$route.query.id)
    }
  },
  mounted() {}
}
</script>

<style scoped>
.no-searchBox {
  padding: 10px;
}

.diskDeviceItem {
  width: calc(100% - 80px);
}

.diskDeviceTitle {
  width: 50px;
  text-align: right;
  display: inline-block;
  vertical-align: middle;
}
</style>
