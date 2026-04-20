/** * Created by Zhang Haijun on 2017/9/5. */
<template>
  <basic-form :model="hostData" :disabled="disabled" ref="formRef" v-bind="$attrs">
    <el-row :gutter="10">
      <el-col :span="24" v-if="!disabled">
        <el-form-item label="服务器集：" class="m-b-sm">
          <el-button type="primary" size="small" class="pull-left" @click="selectServer" icon="el-icon-monitor"> 选择服务器 </el-button>
          <el-button type="danger" size="small" class="pull-right" @click="clearServer" icon="el-icon-delete"> 清空服务器 </el-button>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="disabled ? '服务器集:' : ''">
          <smart-table :data="hostData.list" class="target-table">
            <el-table-column label="主机名称" prop="name" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.name || '--' }}
              </template>
            </el-table-column>
            <el-table-column label="规格">
              <template slot-scope="scope">
                <div v-if="scope.row.showSpec">{{ scope.row.showSpec.cpu }}C/{{ scope.row.showSpec.memory }}GB</div>
              </template>
            </el-table-column>
            <el-table-column label="端口">
              <template slot-scope="scope">
                <basic-form-item class="m-b-none" :prop="'list.' + scope.row.indexKey + '.port'" validate="required,port" required-message="请填写端口号">
                  <el-input v-model="scope.row.port" type="number" :disabled="disabled"></el-input>
                </basic-form-item>
              </template>
            </el-table-column>
            <template v-if="itemData.authenMode == 'SINGLE'">
              <el-table-column label="用户名">
                <template slot-scope="scope">
                  <basic-form-item class="m-b-none" :prop="'list.' + scope.row.indexKey + '.username'" validate="required" required-message="请填写用户名">
                    <el-input v-model="scope.row.username" :disabled="disabled"></el-input>
                  </basic-form-item>
                </template>
              </el-table-column>
              <el-table-column label="密码">
                <template slot-scope="scope">
                  <basic-form-item class="m-b-none" :prop="'list.' + scope.row.indexKey + '.pasd'" validate="required" required-message="请填写密码">
                    <el-input v-model="scope.row.pasd" type="password" :disabled="disabled" show-password></el-input>
                  </basic-form-item>
                </template>
              </el-table-column>
            </template>
            <el-table-column label="操作" width="100px">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" @click="delServer(scope.row)" :disabled="disabled" icon="el-icon-delete"> 删除 </el-button>
              </template>
            </el-table-column>
          </smart-table>
        </el-form-item>
      </el-col>
      <el-dialog title="服务器列表" :close-on-click-modal="false" :visible.sync="dialogServerVisible" append-to-body width="1200px">
        <basic-table :data="list" :params="params" :total="total" :columns="columns" :get-list="getList" ref="tableRef" @selection-change="handleSelectChange">
          <el-table-column type="selection" width="60"> </el-table-column>
          <el-table-column label="主机名" prop="configs.vmHostName">
            <template slot-scope="scope">
              {{ scope.row.configs.vmHostName || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="唯一标识" prop="taskTargetUuid"> </el-table-column>
          <el-table-column label="规格">
            <template slot-scope="scope">
              <div v-if="scope.row.showSpec">{{ scope.row.showSpec.cpu }}C/{{ scope.row.showSpec.memory }}GB</div>
            </template>
          </el-table-column>
          <el-table-column label="系统类别" prop="configs.osCategory"></el-table-column>
          <span slot="pagination"></span>
        </basic-table>
        <div slot="footer" class="dialog-footer">
          <el-button type="ghost" @click.native="dialogServerVisible = false">取消</el-button>
          <el-button type="primary" @click.native="ok">确定</el-button>
        </div>
      </el-dialog>
    </el-row>
  </basic-form>
</template>
<script>
import { columns, searchConfigs } from './selectServerConfig'
import { decrypt, encrypt } from 'utils/crypto'
import { Message, MessageBox } from 'element-ui'
import { cloneDeep } from 'lodash-es'

function formatHostData(list) {
  return list.map(item => {
    const { taskTargetUuid, name: rawName, ip: host, port, osCategory: category, username: user, pasd, showSpec } = item
    return {
      taskTargetUuid,
      rawName,
      host,
      port,
      category,
      user,
      pasd: pasd && encrypt(pasd),
      showSpec
    }
  })
}
export default {
  props: {
    itemData: {
      type: Object
    },
    osCategory: {
      // 通过osCategory过滤linux/windows机器
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  inject: ['getSubApplicationParamsForTaskServer'],
  data() {
    return {
      columns,
      hostData: {
        // 对数据进行格式化以保持和列表数据一致
        list: []
      },
      list: [],
      total: 0,
      params: {},
      selectList: [],
      dialogServerVisible: false
    }
  },
  computed: {
    selectedIds() {
      return this.hostData.list.map(item => item.taskTargetUuid)
    },
    vmListForTaskServer() {
      return this.getSubApplicationParamsForTaskServer()
    }
  },
  watch: {
    'hostData.list': {
      handler() {
        this.$emit('host-change', formatHostData(this.hostData.list))
      },
      deep: true
    }
  },
  mounted() {
    this.hostData.list = this.itemData?.data.map(data => {
      // 获取最新的规格展示
      const { host: ip, pasd, user: username, category: osCategory, taskTargetUuid, ...others } = data
      const currentVm = this.vmListForTaskServer.find(vm => vm.taskTargetUuid === taskTargetUuid)
      const password = pasd && decrypt(pasd)
      let showSpec = data.showSpec
      let name = data.rawName
      if (currentVm) {
        showSpec = {
          cpu: currentVm.elements[0].specs[0].cpu,
          memory: currentVm.elements[0].specs[1].memory
        }
        name = currentVm.configs.vmHostName
      }
      return {
        ...others,
        name,
        ip,
        username,
        pasd: password,
        password,
        osCategory,
        taskTargetUuid,
        showSpec
      }
    })
  },
  methods: {
    async getList() {
      this.list = cloneDeep(this.vmListForTaskServer).map(vm => {
        vm.configs.password = decrypt(vm.configs.password)
        vm.configs.osCategory = vm.configs.osCategory || vm.configs.imageName
        vm.showSpec = {
          cpu: vm.elements[0].specs[0].cpu,
          memory: vm.elements[0].specs[1].memory
        }
        return vm
      })
      this.total = this.vmListForTaskServer.length
      await this.$nextTick()
      // 回显选择
      if (this.$refs.tableRef) this.$refs.tableRef.clearSelection()
      this.list.forEach(vm => {
        if (this.selectedIds.includes(vm.taskTargetUuid)) {
          if (this.$refs.tableRef) this.$refs.tableRef.toggleRowSelection(vm, true)
        }
      })
    },
    handleSelectChange(rows) {
      this.selectList = rows
    },
    ok() {
      this.hostData.list = this.selectList.map(item => {
        const {
          configs: { password, vmHostName, osCategory, imageName, port },
          taskTargetUuid,
          showSpec
        } = item
        return {
          showSpec,
          name: vmHostName,
          taskTargetUuid,
          osCategory: osCategory || imageName,
          username: 'root',
          pasd: password,
          port: port || (osCategory.toUpperCase() === 'WINDOWS' ? 5986 : 22)
        }
      })
      this.dialogServerVisible = false
    },
    // 选择服务器
    async selectServer() {
      this.selectList = []
      searchConfigs[4].initValue = this.osCategory
      this.dialogServerVisible = true
      this.getList()
    },
    // 服务器操作
    clearServer() {
      MessageBox.confirm('您确定要清空所选主机吗?', '提示', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.hostData.list = []
      })
    },
    delServer({ taskTargetUuid, name }) {
      MessageBox.confirm(`您确定要删除主机【${name}】吗?`, '提示', {
        confirmButtonText: '清空',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        const index = this.hostData.list.findIndex(item => item.taskTargetUuid === taskTargetUuid)
        this.hostData.list.splice(index, 1)
      })
    },
    getPostData() {
      let data = false
      this.$refs.formRef.validate(valid => {
        if (valid) {
          data = formatHostData(this.hostData.list)
        } else {
          Message.error('请填写目标主机必填项')
        }
      })
      return data
    }
  }
}
</script>
<style scoped>
.target-table .el-form-item.is-error {
  margin-bottom: 15px !important;
}
</style>
