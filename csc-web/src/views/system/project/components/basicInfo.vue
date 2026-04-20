<template>
  <basic-form :model="addData" ref="addData" label-width="120px">
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '名称:'" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <!-- <el-row :gutter="10" v-if="!addData.id">
      <el-col :span="24">
        <basic-form-item label="资源属性: " prop="visibility" validate="required">
          <el-radio-group v-model="addData.visibility">
            <el-radio-button label="manageable">管理权限</el-radio-button>
            <el-radio-button label="visible">查看权限</el-radio-button>
            <el-radio-button label="invisible">无权限</el-radio-button>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row> -->
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '编号:'" prop="code" validate="required">
          <el-input v-model="addData.code" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item :label="this.$store.getters.systemConfig.serviceConfigLabel + ': '">
          <el-select v-model="addData.businessId" clearable>
            <el-option v-for="item in businessNameList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <!-- <el-col :span="24">
        <el-form-item label="所属租户: ">
          <el-select v-model="addData.tenantId" placeholder="请选择" clearable>
            <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </el-col> -->
      <el-col :span="24">
        <el-form-item label="描述: " prop="remark">
          <el-input type="textarea" v-model="addData.remark" auto-complete="off" clearable></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>

<script>
import { getBizs } from 'services/system/bizs'
// import { getTenant } from 'services/system/tenant'

export default {
  data() {
    return {
      addData: {
        visibility: 'manageable'
      },
      businessNameList: [],
      tenantList: []
    }
  },
  created() {
    // 调取业务列表接口ssss
    this.getList()
    // this.getTenantList()
  },
  methods: {
    // 获取租户列表
    // async getTenantList() {
    //   const res = await getTenant({ page: 1, rows: 100000 })
    //   if (res.success) {
    //     this.tenantList = res.data.rows
    //   }
    // },
    getList() {
      getBizs({ page: 1, rows: 9999 }).then(data => {
        if (data.success) {
          this.businessNameList = data.data.rows
        }
      })
    },
    async getPostData() {
      let data = false
      this.$refs.addData.validate(valid => {
        if (valid) {
          data = this.addData
        }
      })
      return data
    }
  }
}
</script>

<style></style>
