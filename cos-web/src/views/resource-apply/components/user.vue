/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <div class="item-block">
    <!-- <el-divider></el-divider> -->
    <h5>业务信息</h5>
    <el-row :gutter="20" v-if="addData.configs.resourceLabel">
      <el-col :span="24">
        <label-item :tags="addData.configs.resourceLabel"></label-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '：'" validate="required" prop="location.projectId">
          <el-select v-if="!itemData" v-model="addData.location.projectId" @change="getUser">
            <el-option v-for="(item, index) in allProjectList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-input v-else v-model="addData.location.projectName"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="备注：" prop="location.remark">
          <el-input v-if="!itemData" v-model="addData.location.remark"> </el-input>
          <el-input v-else v-model="addData.location.remark"></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <basic-form-item label="申请人：" validate="required" prop="location.creatorId">
          <el-select v-if="!itemData" v-model="addData.location.creatorId" @change="userChange" clearable>
            <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id" :disabled="item.id === addData.location.menderId"></el-option>
          </el-select>
          <el-input v-else v-model="addData.location.creatorName"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="使用人：" validate="required" prop="location.ownerId">
          <el-select v-if="!itemData" v-model="addData.location.ownerId" @change="userChange">
            <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-input v-else v-model="addData.location.ownerName"></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <basic-form-item label="维护人：" validate="required" prop="location.menderId">
          <el-select v-if="!itemData" v-model="addData.location.menderId" @change="userChange" clearable>
            <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id" :disabled="item.id === addData.location.creatorId"></el-option>
          </el-select>
          <div v-if="!itemData" class="tip">申请人和维护人不能是同一人</div>
          <el-input v-else v-model="addData.location.menderName"></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { conditionProject } from 'services/system/project'
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
      allProjectList: [],
      userList: []
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {
    if (this.itemData) {
    } else {
      this.getProject()
    }
  },
  methods: {
    userChange() {
      this.addData.location.creatorName = this.userList.find((item) => item.id === this.addData.location.creatorId)?.name || ''
      this.addData.location.ownerName = this.userList.find((item) => item.id === this.addData.location.ownerId)?.name || ''
      this.addData.location.menderName = this.userList.find((item) => item.id === this.addData.location.menderId)?.name || ''
    },
    getProject() {
      conditionProject({
        condition: JSON.stringify({
          condition: 'listApplyProjects'
        })
      }).then((data) => {
        if (data.success) {
          this.allProjectList = data.data
          if (!this.itemData && this.addData.location.projectId) this.addData.location.projectId = ''
        }
      })
    },
    getUser() {
      this.addData.location.projectName = this.allProjectList.find((item) => item.id === this.addData.location.projectId)?.name || ''
      getUser({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          projectId: this.addData.location.projectId
        })
      }).then((data) => {
        if (data.success) {
          this.userList = data.data.rows
          if (!this.itemData) {
            if (this.userData.tenantId) {
              // 申请人
              this.addData.location.creatorId = this.userData.id
              this.addData.location.ownerId = this.userData.id
              // 维护人
              if (this.userList.length) this.addData.location.menderId = this.userList.find((item) => item.id !== this.userData.id)?.id || ''
              this.userChange()
            } else {
              if (this.userList.length) {
                const { id } = data.data.rows[0]
                this.addData.location.creatorId = id
                this.addData.location.ownerId = id
                this.addData.location.menderId = this.addData.location.menderId = this.userList.find((item) => item.id !== id)?.id || ''
                this.userChange()
              }
            }
          }
        }
      })
    }
  }
}
</script>
<style scoped>
::v-deep .el-select,
::v-deep .el-input {
  width: 280px;
}
</style>
