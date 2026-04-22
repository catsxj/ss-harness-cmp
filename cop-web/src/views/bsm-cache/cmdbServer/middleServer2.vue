<template>
  <el-row :gutter="10">
    <el-col :span="24" v-if="!isPreview">
      <el-form-item label="服务器集：" class="m-b-sm">
        <el-button type="primary" size="small" class="pull-left" @click="selectServer" icon="el-icon-monitor"> 选择服务器 </el-button>
        <el-button type="danger" size="small" class="pull-right" @click="clearServer" icon="el-icon-delete"> 清空服务器 </el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <el-form-item :label="isPreview ? '服务器集:' : ''">
        <smart-table :data="itemData.hostList" class="target-table">
          <el-table-column label="主机名称" prop="rawName" show-overflow-tooltip> </el-table-column>
          <template v-if="path.includes('PatchDeploy')">
            <el-table-column label="IP" prop="ip"> </el-table-column>
          </template>
          <template v-else>
            <el-table-column label="IP">
              <template slot-scope="scope">
                <el-select v-model="scope.row.host" placeholder="请选择" :disabled="isPreview" @visible-change="getIps(scope.row)">
                  <el-option v-for="item in scope.row.privateIps" :key="item" :label="item" :value="item"> </el-option>
                </el-select>
              </template>
            </el-table-column>
          </template>
          <el-table-column label="端口">
            <template slot-scope="scope">
              <basic-form-item class="m-b-none" :prop="'hostList.' + scope.row.indexKey + '.port'" validate="required,port" required-message="请填写端口号">
                <el-input v-model="scope.row.port" type="number" :disabled="isPreview"></el-input>
              </basic-form-item>
            </template>
          </el-table-column>
          <el-table-column label="用户名" v-if="itemData.authenMode == 'SINGLE'">
            <template slot-scope="scope">
              <basic-form-item class="m-b-none" :prop="'hostList.' + scope.row.indexKey + '.user'" validate="required" required-message="请填写用户名">
                <el-input v-model="scope.row.user" :disabled="isPreview"></el-input>
              </basic-form-item>
            </template>
          </el-table-column>
          <el-table-column label="密码" v-if="itemData.authenMode == 'SINGLE'">
            <template slot-scope="scope">
              <basic-form-item class="m-b-none" :prop="'hostList.' + scope.row.indexKey + '.pasd'" validate="required" required-message="请填写密码">
                <el-input v-model="scope.row.pasd" type="password" :disabled="isPreview" show-password></el-input>
              </basic-form-item>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100px">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="delServer(scope.row.id)" :disabled="isPreview" icon="el-icon-delete"> 删除 </el-button>
            </template>
          </el-table-column>
        </smart-table>
      </el-form-item>
    </el-col>
    <el-dialog title="服务器列表" :close-on-click-modal="false" :visible.sync="dialogServerVisible" append-to-body width="60%">
      <el-form :inline="true">
        <el-form-item>
          <el-select clearable v-model="listQuery.vendorId" placeholder="所属平台">
            <el-option v-for="item in vendorOptions" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input placeholder="IP地址" v-model="listQuery.ip"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-input placeholder="主机名" v-model="listQuery.name"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total" ref="serverTable" @select="handleSelectItem" @select-all="handleSelectAll">
        <el-table-column type="selection" :selectable="selectAble" width="60"> </el-table-column>
        <el-table-column label="主机名" prop="name"> </el-table-column>
        <template v-if="path.includes('PatchDeploy')">
          <el-table-column label="IP" prop="ip"> </el-table-column>
        </template>
        <template v-else>
          <el-table-column label="IP">
            <template slot-scope="scope">
              <div v-for="item in scope.row.privateIps" :key="item">{{ item }}</div>
            </template>
          </el-table-column>
        </template>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <status-icon :type="vmStatusColorFilter(scope.row.status)">
              {{ vmStatusFilter(scope.row.status) }}
            </status-icon>
          </template>
        </el-table-column>
        <el-table-column label="平台名称" prop="vendorName"></el-table-column>
        <el-table-column label="系统类别" prop="osCategory"></el-table-column>
      </basic-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogServerVisible = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
// selection-change reserve-selection回现逻辑比较复杂，所以弃用
import show from 'task/graph/mixins/show'
import { getCloudVendor, getResource, detailResource } from 'services/platform/index'
import { getHosts } from '@/services/task/resource'
import { decrypt } from 'utils/crypto'
import { vmStatusFilter, vmStatusColorFilter } from '@/filters/index'
export default {
  mixins: [show],
  props: {
    itemData: {
      type: Object
    },
    osCategory: {
      type: String,
      default: ''
    },
    hasResource: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      vmStatusFilter,
      vmStatusColorFilter,
      list: null,
      total: null,
      listQuery: {
        name: '',
        privateIps: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      dialogServerVisible: false,
      vendorOptions: '',
      selectList: [],
      idList: [],
      http: getResource
    }
  },
  created() {
    this.http = this.path.includes('PatchDeploy') ? getHosts : getResource
  },
  computed: {
    path() {
      return this.$route.path
    }
  },
  watch: {
    path(val) {
      this.http = val.includes('PatchDeploy') ? getHosts : getResource
    }
  },
  methods: {
    clearCustomParams() {
      if (this.hasResource) {
        this.itemData.customParams = []
      }
    },
    // 编辑获取主机IP
    getIps(row) {
      if (row.isLoaded) return
      detailResource(row.id).then((data) => {
        if (data.success) {
          row.isLoaded = true
          this.$set(row, 'privateIps', JSON.parse(data.data?.privateIps))
        }
      })
    },
    // 判断主机是否可选
    selectAble(row) {
      if (this.path.includes('PatchDeploy') && row.status == 'RUNNING') return true
      else if (row.privateIps.length === 0 || row.status !== 'RUNNING' || row.osCategory === 'AIX' || row.osCategory === 'VMware ESXi') return false
      else return true
    },
    selectServer() {
      this.getVendor()
      // 初始化数据
      this.listQuery = {
        name: '',
        privateIps: '',
        vendorId: ''
      }
      this.params.page = 1
      this.selectList = []
      // 对数据进行格式化以适应后端的传参需求
      this.itemData.hostList.forEach((data) => {
        this.selectList.push({
          id: data.id,
          ip: data.ip,
          name: data.rawName,
          host: data.host,
          username: data.user,
          password: data.pasd,
          osCategory: data.category
        })
      })
      this.dialogServerVisible = true
      this.handleSearch()
    },
    clearServer() {
      this.$confirm('您确定要清空所选主机吗?', '提示', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.clearCustomParams()
        this.itemData.hostList = []
      })
    },
    delServer(id) {
      this.clearCustomParams()
      for (let i = 0, len = this.itemData.hostList.length; i < len; i++) {
        if (this.itemData.hostList[i].id === id) {
          this.itemData.hostList.splice(i, 1)
          break
        }
      }
    },
    getVendor() {
      getCloudVendor({
        simple: true
      }).then((data) => {
        if (data.success) {
          this.vendorOptions = data.data.rows
        }
      })
    },
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id === row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) === -1 && this.selectAble(item)) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id === row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    refreshId() {
      this.idList = this.selectList.map((item) => item.id)
    },
    getList() {
      const self = this
      this.refreshId()
      const handleData = function (data) {
        data.forEach(function (item) {
          // 代码容错处理，谨防后端返回格式不对
          try {
            item.privateIps = JSON.parse(item.privateIps) || []
          } catch (error) {
            item.privateIps = []
          }
          setTimeout(function () {
            if (self.idList.indexOf(item.id) > -1) self.$refs.serverTable.toggleRowSelection(item, true)
          })
        })
      }

      this.http(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          handleData(this.list)
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.listQuery.name,
        'privateIps:LK': this.path.includes('PatchDeploy') ? '' : this.listQuery.ip,
        'ip:LK': this.path.includes('PatchDeploy') ? this.listQuery.ip : '',
        category: this.path.includes('PatchDeploy') ? '' : 'Computer',
        catalog: this.path.includes('PatchDeploy') ? 'Computer' : '',
        osCategory: this.osCategory,
        vendorId: this.listQuery.vendorId
      })
      this.getList()
    },
    ok() {
      function getPassword(data) {
        const { password, gmtCreate } = data
        if (gmtCreate && password) return decrypt(password)
        return ''
      }
      this.itemData.hostList = []
      this.selectList.forEach((data) => {
        const tmp = {
          id: data.id,
          rawName: data.name,
          host: data.host || (data.privateIps.length && data.privateIps[0]) || data.ip,
          ip: data.ip,
          user: data.username || data.user,
          pasd: data.password || getPassword(data),
          port: data.osCategory.toUpperCase() === 'WINDOWS' ? 5986 : 22,
          category: data.osCategory,
          privateIps: this.path.includes('PatchDeploy') ? '' : data.privateIps
        }
        if (data.paramsList) {
          tmp.paramsList = data.paramsList
          tmp.params = data.params
        }
        this.itemData.hostList.push(tmp)
      })
      if (this.hasResource) {
        // 主机数据改变时需要更新resource数据
        this.itemData.resourceList = this.itemData.hostList.slice()
        this.itemData.resourceList.unshift({
          id: 0,
          rawName: '选择全部'
        })
      }
      this.clearCustomParams()
      this.dialogServerVisible = false
    }
  }
}
</script>
<style scoped>
.target-table .el-form-item.is-error {
  margin-bottom: 15px !important;
}
</style>
