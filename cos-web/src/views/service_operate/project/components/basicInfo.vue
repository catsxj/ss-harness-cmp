/** * Created by HaijunZhang on 2019/8/30. */
<template>
  <basic-form :model="addData" ref="addData">
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item label="应用系统名称：" prop="name" validate="required">
          <el-input v-model="addData.name"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="合同编号：" prop="code" validate="code">
          <el-input v-model="addData.code"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="所属单位：" prop="tenantIds" validate="required">
          <el-cascader
            popper-class="block"
            v-model="addData.tenantIds"
            :options="departList"
            :show-all-levels="false"
            :props="{ expandTrigger: 'hover', emitPath: false, multiple: true, checkStrictly: true, value: 'id', label: 'name', children: 'children' }"
            clearable
            filterable
            @change="handleManager"
          ></el-cascader>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '经理：'" prop="managerIds" validate="required">
          <el-select v-model="addData.managerIds" multiple filterable placeholder="请选择">
            <el-option v-for="item in userListData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="供应商经理：" prop="providerIds">
          <el-select v-model="addData.providerIds" multiple filterable placeholder="请选择">
            <el-option v-for="item in providerListData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="描述：" prop="remark">
          <el-input type="textarea" v-model="addData.remark" :maxlength="256"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>

<script>
import { getAccount } from 'services/system/account'
import { getTenant } from 'services/system/tenant'

export default {
  data() {
    return {
      params: {
        page: 1,
        rows: 999
      },
      addData: { managerIds: [] },
      userListData: [],
      providerListData: [],
      departList: []
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {
    this.getDepartData()
    this.getProviderData()
  },
  methods: {
    getDepartData() {
      getTenant({
        condition: JSON.stringify({ isTree: true, condition: 'listTopOrganization' })
      }).then((data) => {
        if (data.success) {
          this.departList = data.data
        }
      })
    },
    getManagerData() {
      const deptId = this.addData.tenantIds
      getAccount({
        page: this.params.page,
        rows: this.params.rows,
        condition: JSON.stringify({
          condition: 'listTenantUsers',
          deptId
        })
      }).then((data) => {
        if (data.success) {
          this.userListData = data.data.rows
        }
      })
    },
    getProviderData() {
      getAccount({
        page: this.params.page,
        rows: this.params.rows,
        condition: JSON.stringify({
          condition: 'listProviderUser'
        })
      }).then((data) => {
        if (data.success) {
          this.providerListData = data.data.rows
        }
      })
    },
    handleManager(val) {
      this.departList.forEach((item) => {
        for (let i = 0; i < val.length; i++) {
          if (item.id === val[i]) {
            this.$message.warning('部门不能选择类型')
            this.addData.tenantIds = []
          }
        }
      })
      this.getManagerData()
    },
    getPostData() {
      let data = false
      this.$refs.addData.validate((valid) => {
        if (valid) {
          data = this.addData
        }
      })
      return data
    }
  }
}
</script>

<style lang="scss">
.block {
  .el-cascader-panel .el-checkbox {
    width: 100%;
    height: 100%;
    z-index: 10;
    position: absolute;
    top: 10px;
    right: 10px;
  }
  .el-cascader-panel .el-checkbox__input {
    visibility: hidden;
  }
  .el-cascader-panel .el-cascader-node__postfix {
    top: 10px;
  }
}
</style>
