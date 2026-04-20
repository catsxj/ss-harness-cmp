<template>
  <el-card class="wrapper">
    <common-detail v-if="detaildialogVisible" :setting="detailSetting" :data="detail" @goBack="detaildialogVisible = false">
      <el-tabs value="second">
        <el-tab-pane label="公钥" name="second">
          <div style="width: 100%; word-break: break-all">
            {{ detail.publicKey }}
          </div>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable :card-border="false" :search-configs="searchConfigs" :data="secretData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="add"> 新增 </el-button>
      </template>
      <template #name="val, record">
        <el-button type="text" @click="getDetail(record.id)">{{ record.name }}</el-button>
      </template>
      <template #region="val, record">
        <span>{{ record.regionName }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="dropdownClick({ id: record.id })"> 删除 </el-button>
        <el-button type="text" @click="setTags(record)"> 分配标签 </el-button>
      </template>
    </AdvanceTable>
    <add :add-data="addData" v-if="addData.dialog" @back="getData"></add>
    <tags :add-data="tagData" v-if="tagData.dialog" @back="getData"></tags>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import add from './dialog/add.vue'
import { getRegion, conditionCloudVendor, getKey, removeKey, detailKey } from 'services/platform/index'
import { azureRegion } from 'filters'
import tags from '@/components/tag/index.vue'
import { downloadFile } from 'utils'
const searchConfigs = [{ type: 'Input', label: '名称', value: 'name' }]
const columns = [
  {
    label: '密钥名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '所属平台',
    prop: 'vendorName'
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
  components: { add, tags },
  data() {
    return {
      detailSetting: {
        type: 'miyao',
        columns: [
          [
            { name: '密钥名称', value: 'name' },
            { name: '资源组', value: 'resourceGroupName' },
            { name: '指纹', value: 'fingerprint' }
          ],
          [
            { name: '区域', value: 'regionName' },
            { name: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectName' },
            { name: '标签', value: 'tags' }
          ]
        ]
      },
      detaildialogVisible: false,
      detail: {},
      addData: {
        dialog: false,
        data: {}
      },
      loading: false,
      searchConfigs,
      columns,
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      vendorList: [],
      secretData: [],
      total: 0,
      createWays: [
        { name: '创建密钥', value: 'create', isRegionActive: true },
        {
          name: '导入密钥',
          value: 'daoru',
          isRegionActive: false
        }
      ],
      way: 'create',
      regionList: [],
      tagData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    onmessage(data) {
      this.getData()
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
          action: 'KEYPAIR',
          tags: tags
        }
      }
    },
    getDetail(id) {
      this.detaildialogVisible = true
      detailKey(id).then(data => {
        if (data.success) {
          this.detail = data.data
        }
      })
    },
    chooseRegion1(item) {
      this.way = item.value
      this.createWays.forEach((data, index) => {
        data.isRegionActive = false
        if (data.name == item.name) {
          data.isRegionActive = !item.isRegionActive
        }
      })
    },
    getVendorList() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'poolProviders',
          types: ['OPENSTACK', 'TENCENT', 'HUAWEI']
        })
      }).then(data => {
        if (data.success) {
          this.vendorList = data.data
        }
      })
    },
    getRegion() {
      getRegion({ vendorId: this.addData.vendorId }).then(data => {
        if (data.success) {
          this.regionList = data.data
        }
      })
    },
    changeVendor() {
      this.vendorList.forEach(item => {
        if (item.id === this.addData.vendorId) this.addData.vendorType = item.type
        if (item.type === 'HUAWEI') this.getRegion()
      })
    },
    handleClose(done) {
      this.cancel('addData')
    },
    add() {
      this.addData = {
        dialog: true,
        data: {
          publicKey: '',
          name: '',
          vendorId: '',
          region: '',
          availablitiyZone: ''
        }
      }
    },
    addOk(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.addOkGet()
        } else {
          return false
        }
      })
    },
    dropdownClick(command) {
      this.$confirm('该操作为不可逆操作，确定后将永久删除该密钥，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeKey(command.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
          }
        })
      })
    },
    getData() {
      this.loading = true
      getKey(this.params).then(data => {
        if (data.success) {
          this.secretData = data.data.rows
          this.total = data.data.total
        }
        this.loading = false
      })
    },
    cancel(formName) {
      this.addFlag = false
      this.$refs[[formName]].resetFields()
    }
  }
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}

.vm-region {
  height: 42px;
  width: 110px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 0 10px 0 0;
  border: 1px solid #ddd;
  line-height: 42px;
  font-size: 12px;
  text-align: center;
  color: #666;
  cursor: pointer;
  border-radius: 0;
  display: inline-block;
}

.vm-region:hover {
  border-color: #43bfe3 !important;
}

.vm-region-text {
  border-color: #43bfe3 !important;
}

.region-active {
  background-color: deepskyblue;
  color: #fff;
}
</style>
