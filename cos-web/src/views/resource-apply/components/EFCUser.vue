<template>
  <el-row :gutter="20">
    <el-col :span="12" v-if="addData.emption">
      <basic-form-item label="付费模式：" validate="required" prop="emption.duration.mode">
        <el-radio-group v-model="mode" @change="selectMode">
          <el-radio-button :label="item.value" v-for="item in payList" :key="item.value" :disabled="!addData.preview.paymentMode.includes(item.value)">{{ item.name }}</el-radio-button>
        </el-radio-group>
        <el-tooltip class="m-l" effect="dark" :content="modeTitle[mode]" placement="right">
          <i class="el-icon-question"></i>
        </el-tooltip>
      </basic-form-item>
    </el-col>
    <el-col :span="12" v-if="addData.emption && addData.emption.duration.mode !== 'Hour'">
      <basic-form-item label="时长：" validate="required" prop="emption.duration.amount">
        <el-select v-model="amount" class="w-lg" @change="selectAmount">
          <el-option v-for="item in applyTimeList" :key="item.value" :value="item.value" :label="item.name"></el-option>
        </el-select>
      </basic-form-item>
    </el-col>
    <el-col :span="24">
      <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '：'" validate="required" prop="location.projectId">
        <el-select class="w-lg" v-if="!itemData" v-model="addData.location.projectId" @change="changeProject">
          <el-option v-for="(item, index) in allProjectList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-input v-else v-model="addData.location.projectName"></el-input>
      </basic-form-item>
    </el-col>
    <!-- <el-col :span="12">
      <basic-form-item label="使用人：" validate="required" prop="location.ownerId">
        <el-select class="w-lg" v-if="!itemData" v-model="addData.location.ownerId" @change="userChange">
          <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-input class="w-lg" v-else v-model="addData.location.ownerName"></el-input>
      </basic-form-item>
    </el-col>
    <el-col :span="12">
      <basic-form-item label="维护人：" validate="required" prop="location.menderId">
        <el-select class="w-lg" v-if="!itemData" v-model="addData.location.menderId" @change="userChange" clearable>
          <el-option v-for="(item, index) in userList" :key="index" :label="item.name" :value="item.id" :disabled="item.id === addData.location.creatorId"></el-option>
        </el-select>
        <div v-if="!itemData" class="tip">申请人和维护人不能是同一人</div>
        <el-input class="w-lg" v-else v-model="addData.location.menderName"></el-input>
      </basic-form-item>
    </el-col> -->
  </el-row>
</template>

<script>
import { conditionProject } from 'services/system/project'
import { getUser } from 'services/system/manager'
import { applyTimeList } from '../data/init.js'
export default {
  props: {
    addData: {
      type: Object,
      required: true
    },
    itemData: {
      type: [Object, Boolean]
    }
  },
  data() {
    return {
      allProjectList: [],
      userList: [],
      payList: [
        { name: '按量计费', value: 'Hour' },
        { name: '包年包月', value: 'Month' }
      ],
      modeTitle: {
        Hour: '按量计费是后付费模式，按资源的实际使用时长计费，可以随时订购/退订资源。在 管理中心-租户管理 可以修改付费模式的可用状态。',
        Month: '包年包月是预付费模式，按订单的购买周期计费，适用于可预估资源使用周期的场景。在 管理中心-租户管理 可以修改付费模式的可用状态。'
      },
      mode: this.addData.emption?.duration?.mode === 'Hour' ? 'Hour' : 'Month',
      applyTimeList,
      amount: ''
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
  watch: {
    'addData.emption.duration.mode': {
      handler(val) {
        this.mode = val === 'Hour' ? 'Hour' : 'Month'
        if (val !== 'Hour') {
          const amount = this.addData.emption?.duration?.amount || 1
          this.amount = `${amount}|${val}`
        }
      },
      immediate: true
    }
  },
  methods: {
    // 选择时长
    selectAmount(value) {
      const [amount, mode] = value.split('|')
      this.addData.emption.duration.mode = mode
      this.addData.emption.duration.amount = amount
    },
    selectMode(mode) {
      if (mode === 'Hour') {
        this.addData.emption.duration.mode = mode
      } else {
        this.addData.emption.duration.mode = 'Month'
      }
      this.$emit('durationModeChange')
    },
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
    changeProject() {
      const projectName = this.allProjectList.find((item) => item.id === this.addData.location.projectId)?.name || ''
      this.addData.location.projectName = projectName
      this.addData.location.name = projectName + '虚拟机申请'
      this.getUser()
    },
    getUser() {
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
              // 国新没有必须是不同人的要求,目前改为申请者
              // if (this.userList.length) this.addData.location.menderId = this.userList.find(item => item.id !== this.userData.id)?.id || ''
              this.addData.location.menderId = this.userData.id
              this.userChange()
            } else {
              if (this.userList.length) {
                const { id } = data.data.rows[0]
                this.addData.location.creatorId = id
                this.addData.location.ownerId = id
                // this.addData.location.menderId = this.addData.location.menderId = this.userList.find(item => item.id !== id)?.id || ''
                // 国新没有必须是不同人的要求,目前改为申请者
                this.addData.location.menderId = id
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
