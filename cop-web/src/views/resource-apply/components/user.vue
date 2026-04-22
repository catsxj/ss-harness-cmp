/**
* Created by HaijunZhang on 2019/4/28.
*/
<template>
  <div>
    <el-divider></el-divider>
    <h5>业务信息</h5>
    <el-row :gutter="20" v-if="addData.configs.resourceLabel">
      <el-col :span="24">
        <label-item :tags="addData.configs.resourceLabel"></label-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <basic-form-item label="所属业务：">
          <el-select v-model="addData.location.businessId" @change="getProject" clearable>
            <el-option v-for="(item, index) in bizsList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="所属项目：">
          <el-input v-model="projectName" v-if="itemData && !$route.query.id"></el-input>
          <el-select v-else v-model="addData.location.projectId" @change="getUser" >
            <el-option v-for="(item, index) in projectList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <basic-form-item label="申请人：">
          <el-select v-model="addData.location.creatorId" >
            <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="使用人：">
          <el-select v-model="addData.location.ownerId" >
            <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <basic-form-item label="维护人：">
          <el-select v-model="addData.location.menderId" >
            <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getBizs } from 'services/system/bizs'
import { conditionProject, getProjectDetailInfo } from 'services/system/project'
import { getUser } from 'services/system/manager'
import labelItem from './LabelItem.vue'
export default {
  props: {
    addData: {
      type: Object,
      required: true
    },
    vendorType: {
      type: String,
      default: 'VMWARE'
    },
    payList: {
      type: Array
    },
    code: {
      type: String,
      default: 'compute'
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  components: { labelItem },
  data() {
    return {
      bizsList: [],
      projectList: [],
      userList: [],
      projectName: ''
    }
  },
  computed: {
    userData () {
      return this.$store.state.app.userData
    }
  },
  created() {
    this.getBizs()
    this.getUser();
    if (this.itemData) {
      this.getProjectName(this.addData.location.projectId)
    } else {
      this.getProject()
    }
  },
  methods: {
    getBizs () {
      getBizs({
        page: 1,
        rows: 9999
      }).then(data => {
        if (data.success) {
          this.bizsList = data.data.rows
        }
      })
    },
    async getProjectName(projectId) {
      // 未选择项目情况
      if (!projectId) return;
      const res = await getProjectDetailInfo(projectId);
      if (res.success) {
        this.projectName = res.data.name;
      }
    },
    getProject () {
      conditionProject({
        condition: JSON.stringify({
          condition: 'listApplyProjects',
          businessId: this.addData.location.businessId
        })
      }).then(data => {
        if (data.success) {
          this.projectList = data.data
          if (!this.itemData && this.addData.location.projectId) this.addData.location.projectId = ''
        }
      })
    },
    getUser () {
      getUser({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          projectId: this.addData.location.projectId
        })
      }).then(data => {
        if (data.success) {
          this.userList = data.data.rows
          if (!this.itemData) {
            if (this.userData.tenantId) {
              this.addData.location.creatorId = this.userData.id
              this.addData.location.ownerId = this.userData.id
              this.addData.location.menderId = this.userData.id
            } else {
              const { id } = data.data.rows[0]
              this.addData.location.creatorId = id
              this.addData.location.ownerId = id
              this.addData.location.menderId = id
            }
          }
        }
      })
    }
  }
}
</script>
