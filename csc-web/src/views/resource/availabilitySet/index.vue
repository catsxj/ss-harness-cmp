<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="installDetail" @goBack="goBack">
      <el-tabs ref="tab" tab-position="top" type="border-card" value="1">
        <el-tab-pane label="云主机" name="1">
          <vm ref="vm" :detail="installDetail"></vm>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <!-- list -->
    <AdvanceTable :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="add"> 新增 </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ record.name }}</span>
      </template>
      <template #status="val, record">
        <status-icon :color="record.status | vmStatusColor">{{ record.status | openstackServer }}</status-icon>
      </template>
      <template #region="val, record">
        <span>{{ record.regionName }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleOperate({ flag: 5, imageUuid: record.imageUuid, id: record.id, azureResourceGroupName: record.azureResourceGroupName })"> 删除 </el-button>
        <el-button type="text" @click="setTags(record)"> 分配标签 </el-button>
      </template>
    </AdvanceTable>
    <add :add-data="addData" v-if="addData.dialog" @back="getList"></add>
    <tags :add-data="tagData" v-if="tagData.dialog" @back="getList"></tags>
  </el-card>
</template>
<script>
import { getSet, removeSet, detailSet } from 'services/platform/azure'
import add from './add.vue'
import webSocket from '@/common/mixins/getGlobalSocket'
import vm from './vm.vue'
import tags from '@/components/tag/index.vue'
const detailSetting = {
  type: 'image',
  columns: [
    [
      { name: '名称', value: 'name' },
      { name: '资源组', value: 'resourceGroupName' },
      { name: '区域', value: 'regionName' }
    ],
    [{ name: '标签', value: 'tags' }]
  ]
}
const searchConfigs = [{ type: 'Input', label: '名称', value: 'name' }]
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '资源组',
    prop: 'resourceGroupName'
  },
  {
    label: '区域',
    prop: 'region',
    scopedSlots: { customRender: 'region' }
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  mixins: [webSocket],
  components: { add, vm, tags },
  data() {
    return {
      // 自定义镜像分页
      params: {
        page: 1,
        rows: 10
      },
      detailSetting,
      searchName: '',
      // 自定义镜像
      list: [],
      // 自定义镜像分页
      total: 0,
      // 镜像总显隐
      detailFlag: false,
      installDetail: {},
      azureResourceGroupName: '',
      addData: {
        dialog: false,
        data: {}
      },
      tagData: {
        dialog: false,
        data: {}
      },
      searchConfigs,
      columns,
      loading: false
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) {
        this.getList()
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
          action: 'ASET',
          tags: tags
        }
      }
    },
    add() {
      this.addData = {
        dialog: true,
        data: {
          faultDomainCount: 1,
          updateDomainCount: 1
        }
      }
    },
    // 自定义镜像
    getList() {
      this.loading = true
      getSet(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
        this.loading = false
      })
    },
    getDetail(id) {
      detailSet(id).then(data => {
        if (data.success) {
          this.installDetail = data.data
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    // 做自定义镜像操作
    handleOperate(command) {
      switch (command.flag / 1) {
        case 5:
          // 删除镜像
          this.handleDelete(command.imageUuid, command.id, command.azureResourceGroupName)
          break
      }
    },
    // 删除
    handleDelete(imageUuid, id, azureResourceGroupName) {
      const params = {
        id: id,
        imageUuid: imageUuid,
        azureResourceGroupName: azureResourceGroupName
      }
      this.$confirm('该操作为不可逆操作，确定后将永久删除该可用性集，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeSet(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    }
  },
  created() {
    this.getList()
    if (this.$route.query.id) {
      this.getDetail(this.$route.query.id)
    }
  }
}
</script>

<style scoped></style>
