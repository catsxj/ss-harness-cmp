<template>
  <div>
    <common-detail-right v-if="detaildialogVisible" :title="detail.name" @goBack="detaildialogVisible = false">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="所属平台">{{ detail.vendorName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.serviceConfigLabel">{{ detail.businessName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel">{{ detail.projectName }}</common-detail-item>
        <common-detail-item label="创建者">{{ detail.creatorName }}</common-detail-item>
        <common-detail-item label="所有者">{{ detail.ownerName }}</common-detail-item>
        <common-detail-item label="维护者">{{ detail.menderName }}</common-detail-item>
      </template>
    </common-detail-right>
    <div class="wrapper">
      <AdvanceTable title="" :search-configs="searchConfigs" :data="secretData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
        <template v-slot:action>
          <router-link :to="{ name: 'ServiceFloatIpCreate', params: { type: 'TENCENT' } }" class="m-l-xs">
            <el-button type="primary">订购浮动IP</el-button>
          </router-link>
        </template>
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
        </template>
        <template #tag="tag, record">
          <tag :detail="record" type="FLOATING_IP" @back="getData"></tag>
        </template>
        <template #status="status">
          <status-icon :type="status | tcFloatIpColor">{{ status | tcFloatIp }}</status-icon>
        </template>
        <template #operate="val, record">
          <UnsubscribeService :data="record" @getList="getData" type="fip" :disabled="record.status === 'BIND'"> </UnsubscribeService>
          <div class="action-divider"></div>
          <el-button type="text" @click="bindIp(record)" v-if="record.status === 'UNBIND'"> 绑定云主机 </el-button>
          <el-button type="text" @click="unBind(record)" v-else> 解绑云主机 </el-button>
        </template>
      </AdvanceTable>
    </div>
    <bind :add-data="bindData" v-if="bindData.dialog"></bind>
  </div>
</template>

<script>
/* global $ */
import bind from './bind.vue'
import { getRegion, getFloatIp, removeFloatIp, detailFloatIp, removeFloatIpPorts } from 'services/platform/index'
import UnsubscribeService from '@/components/UnsubscribeService.vue'
import tag from '@/components/tag/index.vue'

export default {
  computed: {
    searchConfigs() {
      return [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'IP', value: 'floatingIpAddress' },
        { type: 'Const', value: 'vendorType', initValue: 'TENCENT' }
      ]
    }
  },
  components: {
    bind,
    UnsubscribeService,
    tag
  },
  data() {
    return {
      columns: [
        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: 'IP',
          prop: 'floatingIpAddress'
        },
        {
          label: '地域',
          prop: 'regionName'
        },
        {
          label: '绑定云主机',
          prop: 'serverName'
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '标签',
          prop: 'tag',
          scopedSlots: { customRender: 'tag' }
        },
        {
          label: this.$store.getters.systemConfig.serviceConfigLabel,
          prop: 'businessName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '创建者',
          prop: 'creatorName'
        },
        {
          label: '所有者',
          prop: 'ownerName'
        },
        {
          label: '维护者',
          prop: 'menderName'
        },
        {
          label: '所属平台',
          prop: 'vendorName'
        },
        {
          label: '操作',
          disabled: true,
          width: '220px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      loading: false,
      detaildialogVisible: false,
      detail: {},
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: '',
        regionId: ''
      },
      secretData: [],
      total: 0,
      regionList: [],
      bindData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    bindIp(data) {
      this.bindData = {
        dialog: true,
        data: {
          id: data.id,
          vendorId: data.vendorId,
          regionId: data.regionId
        }
      }
    },
    unBind(data) {
      this.$confirm('是否解绑该浮动IP？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFloatIpPorts({ id: data.id }).then(data => {
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
    // 删除
    remove(id) {
      this.$confirm('是否删除该浮动IP？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFloatIp(id).then(data => {
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
    // 详情
    getDetail(id) {
      this.detaildialogVisible = true
      detailFloatIp(id).then(data => {
        if (data.success) {
          this.detail = data.data
        }
      })
    },
    getData() {
      this.loading = true
      getFloatIp(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.secretData = data.data.rows
          this.total = data.data.total
          this.secretData.forEach(item => {
            if (item.projectVisibility && item.projectVisibility != 'GLOBAL_PROJECT') {
              item.disabled = true
            }
          })
        }
      })
    }
  }
}
</script>

<style></style>
