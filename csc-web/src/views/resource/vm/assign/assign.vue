<template>
  <el-dialog title="分配" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
    <basic-form :model="addData.data" label-width="100px" ref="authData">
      <basic-form-item label="分配方式：" prop="type" validate="required" v-if="showType">
        <el-radio-group v-model="addData.data.type" size="mini">
          <el-radio-button label="tenant">租户</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="租户列表：" prop="tenantId" validate="required" key="tenant">
        <el-select v-model="addData.data.tenantId" filterable disabled>
          <el-option v-for="(item, index) in tenantList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '列表：'" prop="projectId" v-if="showType" key="1">
        <el-select v-model="addData.data.projectId" placeholder="请选择" clearable filterable @change="getTenantData">
          <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="用户：" prop="userId" validate="required" v-if="showType">
        <el-select v-model="addData.data.userId" filterable clearable>
          <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
      <el-button type="primary" @click.native="authSubmit" :disabled="disabled" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getProject } from 'services/system/project'
import { getTenant } from 'services/system/tenant'
import { getUser } from 'services/system/user'
import { vmUsers } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            months: 1,
            userId: '',
            projectId: ''
          },
          dialog: false
        }
      }
    },
    showType: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      userList: [],
      projectList: [],
      props: {
        label: 'name',
        value: 'id',
        children: 'children'
      },
      departMap: {},
      tenantList: [],
      disabled: false,
      loading: false
    }
  },
  created() {
    this.projectList = []
    this.userList = []
    this.getTenantList()
    this.getProjectByTenant()
    this.getUserByTenant()
  },
  methods: {
    authSubmit() {
      this.$refs.authData.validate(valid => {
        if (valid) {
          this.loading = true
          let obj = {}
          obj = {
            ids: this.addData.data.ids,
            userId: this.addData.data.userId,
            projectId: this.addData.data.projectId,
            tenantId: this.addData.data.tenantId,
            tenantIds: [this.addData.data.tenantId],
            resourceCategory: this.addData.data.resourceCategory,
            vendorType: this.addData.data.vendorType
          }
          vmUsers(obj).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    },
    // 获取租户列表
    getTenantList(value) {
      getTenant({
        page: 1,
        rows: 9999
      }).then(data => {
        if (data.success) {
          this.tenantList = data.data.rows
        }
      })
    },
    getUserByTenant() {
      getUser({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          tenantId: this.addData.data.tenantId
        })
      }).then(data => {
        if (data.success) {
          this.userList = data.data.rows
        }
      })
    },
    getProjectByTenant() {
      if (this.addData.data.projectId) this.$set(this.addData.data, 'projectId', '')
      getProject({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { tenantId: this.addData.data.tenantId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.projectList = data.data.rows
        }
      })
    },
    // 获取租户
    getTenantData(value) {
      if (this.addData.data.userId) this.$set(this.addData.data, 'userId', '')
      getUser({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          projectId: this.addData.data.projectId,
          tenantId: this.addData.data.projectId ? '' : this.addData.data.tenantId
        })
      }).then(data => {
        if (data.success) {
          this.userList = data.data.rows
        }
      })
    }
  }
}
</script>
