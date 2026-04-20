<template>
  <basic-form :model="addData" ref="addData" label-width="120px">
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '名称: '" prop="name" validate="required">
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
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '编号: '" prop="code" validate="required">
          <el-input v-model="addData.code" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="组织机构: ">
          <el-cascader v-model="addData.departs" :props="{ label: 'name', value: 'id', checkStrictly: true }" :options="getDepartLazyData" clearable filterable></el-cascader>
        </basic-form-item>
      </el-col>
      <!-- <el-col :span="24">
        <basic-form-item label="启用预算: " prop="budget">
          <el-switch v-model="addData.budget"> </el-switch>
        </basic-form-item>
      </el-col> -->
      <el-col :span="24" v-if="addData.budget">
        <basic-form-item label="预算总量: " prop="money" validate="required">
          <el-input placeholder="请输入内容" v-model.number="addData.money">
            <template slot="append">元</template>
          </el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24" v-if="addData.budget">
        <basic-form-item label="预算阈值: " prop="budgetThreshold" validate="required">
          <el-input placeholder="请输入内容" v-model.number="addData.budgetThreshold">
            <template slot="append">%</template>
          </el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item :label="$store.getters.systemConfig.serviceConfigLabel + '：'" prop="businessId" validate="required">
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
import { getDepart } from 'services/system/depart'

export default {
  props: {
    callback: {
      type: Function
    }
  },
  data() {
    return {
      addData: {
        visibility: 'manageable'
      },
      businessNameList: [],
      tenantList: [],
      getDepartLazyData: []
    }
  },
  created() {
    this.getList()
    this.getDepartLazyList()
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
      getBizs({ page: 1, rows: 9999 }).then((data) => {
        if (data.success) {
          this.businessNameList = data.data.rows
        }
      })
    },
    async getPostData() {
      let data = false
      this.$refs.addData.validate((valid) => {
        if (valid) {
          data = this.addData
        }
      })
      return data
    },
    // 获取组织机构
    getDepartLazyList() {
      getDepart({ parentId: 0 }).then((res) => {
        if (res.success) {
          this.getDepartLazyData = res.data
        }
      })
    }
  }
}
</script>

<style></style>
