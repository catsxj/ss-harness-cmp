<template>
  <el-dialog title="分配" width="800px" :close-on-click-modal="false" top="10vh" :visible.sync="addData.dialog">
    <el-form :inline="true">
      <el-form-item>
        <el-input class="search-item" placeholder="请输入名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input class="search-item" placeholder="请输入IP" v-model="searchData.ip"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="getVmList">搜索</el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="vmList" @select="handleSelect" @select-all="handleSelect" class="m-b" max-height="500px">
      <el-table-column type="selection"> </el-table-column>
      <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
      <el-table-column show-overflow-tooltip label="IP">
        <template slot-scope="{ row }">
          <div v-if="row.vendorType == 'OPENSTACK' || row.vendorType == 'EASYSTACK' || row.vendorType == 'MANAGEONE' || row.vendorType == 'FUSIONCLOUD'">
            <span v-for="item in row.privateIpsList" :key="item.networkId">
              <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
            </span>
          </div>
          <div v-else-if="row.vendorType == 'VMWARE' || row.vendorType == 'INSPURRAIL' || row.vendorType == 'POWERVC'">
            <div v-for="item in row.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </div>
          <div v-else-if="row.vendorType == 'HUAWEI' || row.vendorType == 'HCSO'">
            <div v-for="item in row.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </div>
          <div v-else-if="row.vendorType == 'QCLOUD'">
            <div v-for="(item, index) in row.privateIpsList" :key="index">(内网){{ item.address }}</div>
          </div>
          <div v-else-if="row.vendorType == 'AZURE' || row.vendorType == 'AWS'">
            <div v-for="item in row.privateIpsList" :key="item">(内网){{ item }}</div>
          </div>
          <div v-else-if="row.vendorType == 'SMARTX' || row.vendorType == 'CLOUDTOWER'">
            <div>{{ row.managerIp ? '(内网)' + row.managerIp : '--' }}</div>
          </div>
          <div v-else-if="row.vendorType == 'JDCLOUD'">
            <div v-for="(item, index) in row.privateIpsList" :key="index">(内网){{ item }}</div>
          </div>
          <div v-else-if="row.vendorType == 'VOLCENGINE'">
            <!-- <div v-for="(item, index) in row.privateIpsList" :key="index">(内网){{ item.primaryIpAddress }}</div> -->
            <div v-if="JSON.parse(row.privateIps)[0].primaryIpAddress">{{ JSON.parse(row.privateIps)[0].primaryIpAddress }}(内网)</div>
            <div v-if="JSON.parse(row.privateIps)[0].eipAddress">{{ JSON.parse(row.privateIps)[0].eipAddress }}(公网)</div>
          </div>
          <div v-else-if="row.vendorType == 'SANGFOR'">
            <div>{{ row.privateIps }}</div>
          </div>
          <div v-else>
            <div v-for="item in row.privateIpsList" :key="item">(内网){{ item }}</div>
          </div>
          <div v-if="row.floatingIp">(公网){{ row.floatingIp }}</div>
          <div v-if="row.vendorType == 'TENCENT' || row.vendorType == 'ALIYUN' || row.vendorType == 'AZURE' || row.vendorType == 'AWS' || row.vendorType == 'QCLOUD'">
            <div v-for="(item, index) in JSON.parse(row.publicIps)" :key="index">(公网){{ item }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="状态">
        <template slot-scope="{ row }">
          <status-icon :type="row.status | vmStatusColor">{{ row.status | openstackServer }}</status-icon>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="规格">
        <template slot-scope="{ row }"> {{ (row.cpu ? row.cpu : 0) + 'C/' + (row.memory ? row.memory : 0) + 'GB/' }}{{ row.disk == null ? 0 : row.disk + 'GB' }} </template>
      </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
    <basic-form :model="formData" label-width="100px" ref="authData">
      <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '列表：'" prop="projectId">
        <el-select v-model="formData.projectId" placeholder="请选择" clearable filterable @change="getUserList">
          <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <!-- <basic-form-item label="用户：" prop="userId" validate="required">
        <el-select v-model="formData.userId" filterable clearable>
          <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item> -->
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
      <el-button type="primary" @click.native="authSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getProject } from 'services/system/project'
import { getTenant } from 'services/system/tenant'
import { getUser } from 'services/system/user'
import { getVm, vmUsersByCmp } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          dialog: false
        }
      }
    },
    resourceCategory: {
      type: String,
      required: true,
      default: () => ''
    },
    vendorType: {
      type: String,
      required: true,
      default: () => ''
    }
  },
  data() {
    return {
      vmList: [],
      searchData: { name: '', ip: '' },
      userList: [],
      projectList: [],
      loading: false,
      formData: {
        userId: '',
        projectId: '',
        tenantId: '',
        ids: []
      }
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {
    this.getProjectList()
    // this.getUserList()
  },
  methods: {
    handleSelect(selection) {
      this.formData.ids = selection.map(({ id }) => id)
    },
    getVmList() {
      if (!this.searchData.name && !this.searchData.ip) return this.$message.error('请输入搜索内容')
      const params = {
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          isAssign: false,
          isTemplate: false,
          vendorType: this.vendorType,
          'name:LK': this.searchData.name,
          'privateIps:LK': this.searchData.ip
        })
      }
      getVm(params).then(data => {
        if (data.success) {
          this.vmList = data.data.rows.map(item => {
            if (item.vendorType === 'SANGFOR' && item.privateIps) {
              item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map(item => ({ address: Object.keys(item)[0] })))
            }
            if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
            if (item.publicIps) item.publicIpsList = JSON.parse(item.publicIps)
            return item
          })
        }
      })
    },
    getUserList() {
      getUser({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          tenantId: this.formData.projectId ? '' : this.userData.tenantId,
          projectId: this.formData.projectId
        })
      }).then(data => {
        if (data.success) {
          this.userList = data.data.rows
        }
      })
    },
    getProjectList() {
      getProject({
        page: 1,
        rows: 9999
      }).then(data => {
        if (data.success) {
          this.projectList = data.data.rows
          if (this.projectList.length) this.formData.projectId = this.projectList[0].id
        }
      })
    },
    authSubmit() {
      this.$refs.authData.validate(valid => {
        if (valid) {
          this.loading = true
          const obj = {
            ids: this.formData.ids,
            // userId: this.formData.userId,
            // 默认使用当前登录用户的 id
            userId: this.userData.id,
            projectId: this.formData.projectId,
            tenantId: this.userData.tenantId,
            tenantIds: [this.userData.tenantId],
            resourceCategory: this.resourceCategory,
            vendorType: this.vendorType
          }
          vmUsersByCmp(obj)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.addData.dialog = false
                this.$emit('back')
              }
            })
            .finally(() => (this.loading = false))
        }
      })
    }
  }
}
</script>
