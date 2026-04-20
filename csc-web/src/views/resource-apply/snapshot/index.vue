<template>
  <div>
    <div class="card-wrapper" :class="itemData && 'no-order'">
      <div class="fix-header">
        <div @click="$router.back()">
          <el-icon class="el-icon-back"></el-icon>
        </div>
        <p>{{ $route.meta.title }}</p>
      </div>
      <div class="fix-height">
        <div class="item-block">
          <h5>基本信息</h5>
          <basic-form :model="addData" ref="addForms" label-position="left" label-suffix="：" :disabled="!!itemData && !this.$route.query.id">
            <el-row :gutter="20">
              <el-col :span="12">
                <basic-form-item label="申请单名称">
                  <el-input class="w-lg" v-model="addData.location.name"> </el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="12">
                <basic-form-item label="申请人">
                  <el-input class="w-lg" disabled v-model="addData.location.creatorName"> </el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="18">
                <basic-form-item label="申请原因">
                  <el-input v-model="addData.location.remark" type="textarea"> </el-input>
                </basic-form-item>
              </el-col>
            </el-row>
          </basic-form>
        </div>
        <div class="item-block">
          <h5>虚拟机列表</h5>
          <div style="padding: 10px 0">
            <vmTable ref="VmList" :showParamList="showParamList" :addData="addData" :itemData="itemData" :disabled="disabled" @setSelectList="setSelectList"></vmTable>
          </div>
        </div>
      </div>
      <div class="fixed_box">
        <div class="pull-right right-footer" v-if="!itemData || this.$route.query.id">
          <el-button @click="$router.back(-1)" style="width: 90px" type="ghost">返 回</el-button>
          <el-button type="primary" @click="createOrder()" style="width: 90px" :disabled="addData.snapshotApplicationParams.length === 0">申 请</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addSnapshot } from '../data/EFCInit.js'
import { cloneDeep, isArray } from 'lodash-es'
import vmTable from './vmTable'
import { applyResourceSnapshot } from 'services/services/product.js'
export default {
  components: { vmTable },
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    },
    ReSubmit: {
      type: Boolean,
      default: false
    },
    Retry: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    userData() {
      return this.$store.getters.userData
    }
  },
  data() {
    return {
      addData: cloneDeep(addSnapshot),
      showParamList: []
    }
  },
  created() {
    if (this.itemData) console.log('审批回显:', JSON.parse(JSON.stringify({ ...this.itemData })))
    if (!this.itemData) {
      // 申请
      this.addData.location.creatorName = this.userData.name
      this.addData.location.creatorId = this.userData.id
      if (!this.addData.location.tenantId && this.userData.accountCategory !== 'Manager') this.addData.location.tenantId = this.userData.tenantId ? this.userData.tenantId : this.userData.id
    } else {
      // 重新发起
      if (this.ReSubmit) {
        this.itemData.subApplicationParams.map(item => {
          item.configs.networkCardConfigs.map(i => {
            i.address.splice(0)
          })
        })
      }
      // 审批
      this.addData = cloneDeep(this.itemData)
    }
  },
  methods: {
    // 订购
    handleValidate() {
      let flag = true
      this.$refs.addForms.validate(valid => {
        if (!valid) {
          this.$message.error('基本信息未填写完整')
          return (flag = false)
        }
      })
      if (!flag) return flag
      return flag
    },
    // 审批时获取参数
    getApplyData() {
      return this.handlePostData()
    },
    handlePostData() {
      if (!this.handleValidate()) return false
      const { workOrderTypeCode, location, snapshotApplicationParams } = cloneDeep(this.addData)
      snapshotApplicationParams.forEach(param => {
        param.serverId = param.id
        param.service = 'snapshot.standard.service'
      })
      return {
        ...this.addData,
        workOrderTypeCode,
        location,
        snapshotApplicationParams
      }
    },
    createOrder() {
      const postData = this.handlePostData()
      if (!postData) return
      console.log('---提交参数---', postData)
      this.loading = true
      applyResourceSnapshot(postData)
        .then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.$router.back(-1)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    setSelectList(data) {
      this.addData.snapshotApplicationParams = data
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
.right-footer {
  display: flex;
  align-items: center;
}
::v-deep .right-auto {
  margin-right: auto;
}
.no-order {
  .fix-header {
    display: none;
  }
}
</style>
