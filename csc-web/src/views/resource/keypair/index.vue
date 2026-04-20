<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input class="search-item" placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="add"> 新增 </el-button>
      </el-form-item>
    </el-form>
    <common-detail v-if="detaildialogVisible" :setting="detailSetting" :data="detail" @goBack="detaildialogVisible = false">
      <el-tabs value="second">
        <el-tab-pane label="公钥" name="second">
          <div style="width: 100%; word-break: break-all">
            {{ detail.publicKey }}
          </div>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <basic-table :data="secretData" :params="params" :get-list="getData" :total="total">
      <el-table-column label="密钥名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" @click="getDetail(scope.row.id)">{{ scope.row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="fingerprint" label="指纹" show-overflow-tooltip></el-table-column>
      <el-table-column prop="vendorName" label="所属平台" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="dropdownClick({ id: scope.row.id })"> <i class="el-icon-delete"></i> 删除 </el-button>
        </template>
      </el-table-column>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog" @back="getData"></add>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import add from './add/index'
import { getRegion, conditionCloudVendor, getKey, removeKey, detailKey } from 'services/platform/index'
export default {
  mixins: [webSocket],
  components: { add },
  data() {
    return {
      detailSetting: {
        type: 'miyao',
        columns: [
          [
            { name: '密钥名称', value: 'name' },
            { name: '所属平台', value: 'vendorName' },
            { name: '指纹', value: 'fingerprint' }
          ],
          [
            { name: '所属租户', value: 'tenantName' },
            { name: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectName' }
          ]
        ]
      },
      detaildialogVisible: false,
      detail: {},
      addData: {
        dialog: false,
        data: {}
      },
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
      regionList: []
    }
  },
  methods: {
    onmessage(data) {
      this.getData()
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
          types: ['OPENSTACK', 'TENCENT', 'HUAWEI', 'EASYSTACK']
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
      this.$confirm('此操作将永久删除该密钥, 是否继续?', '提示', {
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
      getKey(this.params).then(data => {
        if (data.success) {
          this.secretData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.searchData.name
      })
      this.getData()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getData()
    },
    cancel(formName) {
      this.addFlag = false
      this.$refs[[formName]].resetFields()
    }
  },
  created() {
    this.getData()
  },
  mounted() {},
  watch: {}
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
