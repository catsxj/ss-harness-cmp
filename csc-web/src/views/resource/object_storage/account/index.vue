<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="installDetail" @goBack="goBack">
      <el-tabs value="0">
        <el-tab-pane label="容器" name="0">
          <containers :detail="installDetail" @isShow="containersDetailFun"></containers>
        </el-tab-pane>
        <el-tab-pane label="密钥" name="1">
          <el-form ref="key" :model="installDetail">
            <el-form-item label="密钥1：">
              <el-input v-model="installDetail.primaryKey" disabled></el-input>
              <el-button type="text" @click="revive('key1')">再生</el-button>
            </el-form-item>
            <el-form-item label="密钥2：">
              <el-input v-model="installDetail.secondaryKey" disabled></el-input>
              <el-button type="text" @click="revive('key2')">再生</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="网络" name="2">
          <network :detail="installDetail" @back="getDetail(installDetail.id)"></network>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <common-detail
      v-if="containersDetail.if"
      :setting="{
        type: 'image',
        columns: [
          [
            { name: '名称', value: 'name' },
            { name: 'URL', value: 'url' },
            { name: '上次修改时间', value: 'lastModified' }
          ],
          [
            { name: 'ETAG', value: 'etag' },
            { name: '租约锁定状态', value: 'leaseStatus', filter: leaseState },
            { name: '租约可用状态', value: 'leaseState', filter: leaseState }
          ],
          [
            { name: '租约期限', value: 'leaseDuration' },
            { name: '存储账号', value: 'storageAccountName' },
            { name: '用户名称', value: 'userName' }
          ],
          [
            { name: '租户名称', value: 'tenantName' },
            { name: $store.getters.systemConfig.projectConfigLabel, value: 'projectName' }
          ]
        ]
      }"
      :data="containersDetail.detail"
      @goBack="goBackContainersDetail"
    >
      <el-tabs value="1">
        <el-tab-pane label="Blob" name="1">
          <blob :detail="containersDetail.detail"></blob>
        </el-tab-pane>
        <el-tab-pane label="元数据" name="0">
          <smart-table :data="containersDetail.detail.metaDatas">
            <el-table-column prop="key" label="KEY"></el-table-column>
            <el-table-column prop="value" label="VALUE"></el-table-column>
          </smart-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable :card-border="false" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="add"> 新增 </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ record.name }}</span>
      </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleOperate({ flag: 5, row: record })"> 删除 </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多操作<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleOperate({ flag: 6, row: record })"> 自定义域名 </el-dropdown-item>
            <!-- <el-dropdown-item :disabled="scope.row.sku == 'Standard_ZRS' || scope.row.sku == 'Premium_LRS'" @click.native="handleOperate({flag:7,row:scope.row})">
              更新冗余
            </el-dropdown-item> -->
            <el-dropdown-item @click.native="handleOperate({ flag: 8, row: record })"> 更改TLS版本 </el-dropdown-item>
            <el-dropdown-item @click.native="handleOperate({ flag: 9, row: record })"> 分配标签 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <add :add-data="addData" v-if="addData.dialog" @back="getList"></add>
    <domain :add-data="domainData" v-if="domainData.dialog" @back="getList"></domain>
    <sku :add-data="skuData" v-if="skuData.dialog" @back="getList"></sku>
    <tls :add-data="tlsData" v-if="tlsData.dialog" @back="getList"></tls>
    <tags :add-data="tagData" v-if="tagData.dialog" @back="getList"></tags>
  </el-card>
</template>
<script>
import { getResource, getAccount, removeAccount, detailAccount, postAccountKey } from 'services/platform/azure'
import webSocket from '@/common/mixins/getGlobalSocket'
import add from './add.vue'
import domain from './domain'
import sku from './sku'
import tls from './TLS'
import network from './network/index'
import containers from '../containers/index'
import blob from '../blob/index'
import tags from '@/components/tag/index.vue'
import { accountFilter, booleanFilter } from 'filters'
const detailSetting = {
  type: 'image',
  columns: [
    [
      { name: '名称', value: 'name' },
      { name: '资源组', value: 'resourceGroupName' },
      { name: '区域', value: 'regionName' }
    ],
    [
      { name: '账户类型', value: 'kind', filter: accountFilter },
      { name: '复制', value: 'sku', filter: accountFilter },
      { name: 'Blob 服务', value: 'primaryEndPoint' }
    ],
    [
      { name: '文件存储服务', value: 'fileEndPointPrimary' },
      { name: '队列服务', value: 'queueEndPointPrimary' },
      { name: '表服务', value: 'tableEndPointPrimary' }
    ],
    [
      { name: '域名', value: 'customDomain' },
      { name: 'TLS版本', value: 'minimumTlsVersion' },
      { name: '全部网络', value: 'isAccessAllNetworks', filter: booleanFilter }
    ],
    [{ name: '标签', value: 'tags' }]
  ]
}
const searchConfigs = [{ label: '名称', value: 'name', type: 'Input' }]
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
    prop: 'regionName'
  },
  {
    label: '操作',
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  mixins: [webSocket],
  components: { add, containers, blob, domain, sku, tls, network, tags },
  data() {
    return {
      // 自定义镜像分页
      columns,
      searchConfigs,
      params: {
        page: 1,
        rows: 10
      },
      loading: false,
      detailSetting,
      searchName: '',
      // 自定义镜像
      list: [],
      // 自定义镜像分页
      total: 0,
      // 镜像总显隐
      detailFlag: false,
      installDetail: {},
      addData: {
        dialog: false,
        data: {}
      },
      containersDetail: {
        if: false
      },
      domainData: {
        dialog: false,
        data: {}
      },
      skuData: {
        dialog: false,
        data: {}
      },
      tlsData: {
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
    revive(key) {
      const params = {
        id: this.installDetail.id,
        regenerateKey: key
      }
      postAccountKey(params).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.getDetail(this.installDetail.id)
        }
      })
    },
    containersDetailFun(data) {
      this.detailFlag = !data.if
      this.containersDetail = data
      console.log(this.containersDetail)
    },
    add() {
      this.addData = {
        dialog: true,
        data: {
          sku: 'Standard_LRS',
          kind: 'StorageV2',
          accessTier: 'Cool'
        }
      }
    },
    getList() {
      this.loading = true
      getAccount(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
        this.loading = false
      })
    },
    getDetail(id) {
      detailAccount(id).then(data => {
        if (data.success) {
          this.installDetail = data.data
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    goBackContainersDetail() {
      this.containersDetail = false
      this.detailFlag = true
    },
    // 做自定义镜像操作
    handleOperate(command) {
      switch (command.flag / 1) {
        case 5:
          // 删除镜像
          this.handleDelete(command.row)
          break
        case 6:
          // 添加自定义域名
          this.domainData = {
            dialog: true,
            data: {
              id: command.row.id,
              customDomain: command.row.customDomain ? command.row.customDomain : ''
            }
          }
          break
        case 7:
          // 更新复制级别
          this.skuData = {
            dialog: true,
            data: {
              id: command.row.id,
              sku: command.row.sku ? command.row.sku : ''
            }
          }
          break
        case 8:
          this.tlsData = {
            dialog: true,
            data: {
              id: command.row.id,
              minimumTlsVersion: command.row.minimumTlsVersion ? command.row.minimumTlsVersion : ''
            }
          }
          break
        case 9:
          this.setTags(command.row)
          break
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
          action: 'STORAGEACCOUNT',
          tags: tags
        }
      }
    },
    // 删除
    handleDelete(row) {
      console.log(row)
      this.$prompt(`警告! 存储账户${row.name}的删除操作是不可逆的。无法撤消你将要执行的操作。继续操作将永久性删除此存储账户。请输入名称再次确认！`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: val => {
          if (val == row.name) {
            return true
          } else {
            return false
          }
        },
        inputErrorMessage: '输入名称与要删除的存储账户名称不匹配'
      }).then(({ value }) => {
        removeAccount(row.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) {
        this.getList()
        if (this.detailFlag) this.getDetail(this.installDetail.id)
      }
    }
  },
  mounted() {
    this.getList()
  },
  created() {
    if (this.$route.query.id) {
      this.getDetail(this.$route.query.id)
    }
  }
}
</script>

<style scoped></style>
