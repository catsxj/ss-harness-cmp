<template>
  <el-dialog width="1100px" :close-on-click-modal="false" :visible.sync="dialog.visible">
    <div class="left-title">
      <div class="left-title__header">
        <h3>{{ dialog.title }}</h3>
        <p>{{ dialog.des }}</p>
      </div>
      <el-steps :active="activeStep" align-center class="m-b" direction="vertical">
        <el-step :title="item" v-for="item in dialog.leftStepList" :key="item"></el-step>
      </el-steps>
    </div>
    <div class="right-content">
      <!-- <div :span="24" v-show="activeStep === index" v-for="{ item, index } in dialog.rightContentList" :key="index">
        <div class="title">{{ item.title }}</div>
        <div class="wrapper">
          {{ `<${BasicInfo} ref="basicInfo" />` }}
        </div>
        <div class="footer">
          <el-button class="clear" @click="clear">取消</el-button>
          <el-button class="pull-right" type="primary" @click="nextStep()">下一步</el-button>
        </div>
      </div> -->
      <div :span="24" v-show="activeStep === 0">
        <div class="title">{{ dialog.rightContent[0].title }}</div>
        <div class="wrapper">
          <slot name="first" ref="sss"></slot>
        </div>
        <div class="footer">
          <el-button class="pull-right m-r" type="primary" @click="nextStep()">下一步</el-button>
          <el-button class="pull-right m-r clear" @click="clear">取消</el-button>
        </div>
      </div>
      <div :span="24" v-show="activeStep === 1">
        <div class="title">{{ dialog.rightContent[1].title }}</div>
        <div class="wrapper">
          <slot name="second"></slot>
        </div>
        <div class="footer">
          <el-button class="pull-right m-r" type="primary" @click="create()" :loading="loading">完成</el-button>
          <el-button class="pull-right m-r" type="primary" @click="prevStep()">上一步</el-button>
          <el-button class="pull-right m-r clear" @click="clear">取消</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { createTenant } from 'services/system/tenant'
import { createProject } from 'services/system/project'

export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      activeStep: 0,
      postData: {},
      loading: false
    }
  },
  created() {},
  methods: {
    async nextStep() {
      if (this.activeStep === 0) {
        const data = await this.$parent.$refs[this.dialog.rightContent[0].ref].getPostData()
        if (data) this.postData = data
        else return false
      }
      ++this.activeStep
    },
    prevStep() {
      --this.activeStep
    },
    async create() {
      const list = this.$parent.$refs[this.dialog.rightContent[1].ref].getPostData()
      this.loading = true
      let res = null
      if (this.$route.path.indexOf('tenants') !== -1) {
        res = await createTenant({
          ...this.postData,
          ...list
        })
      } else if (this.$route.path.indexOf('project') !== -1) {
        res = await createProject({
          ...this.postData,
          ...list
        })
      }
      if (res.success) {
        this.dialog.visible = false
        this.$message.success(res.message)
        this.$parent.clearAddDialog()
      }
      this.loading = false
    },
    clear() {
      this.$emit('clearAddDialog', 'clear')
    }
  }
}
</script>
<style scoped lang="scss">
.el-dialog__wrapper {
  ::v-deep .el-dialog {
    .el-dialog__header {
      padding: 0 !important;
      background-color: #fff !important;
      border: none !important;
    }
    .el-dialog__body {
      padding: 0 !important;
      display: flex;
      height: 508px;
      .left-title {
        color: #ffffff;
        background-color: rgba(33, 36, 46, 1);
        height: 100%;
        flex: 0 0 160px;
        padding: 20px 30px;
        .el-step {
          .is-process {
            color: #fff !important;
            font-weight: 300 !important;
            .is-text {
              background-color: #4d8ef0;
            }
          }
          .is-text {
            background-color: #21242e;
            font-weight: 300;
          }
        }
        .left-title__header {
          h3 {
            padding: 0;
            margin: 0;
            font-size: 14px;
          }
          p {
            margin-top: 6px;
            font-size: 12px;
          }
        }
      }
      .right-content {
        flex: 1;
        height: 508px;
        background-color: #fff;

        > div {
          position: relative;
          height: 100%;
          padding: 20px;
          .title {
            font-weight: 700;
            margin-bottom: 20px;
          }
          .wrapper {
            height: 420px;
            background-color: #fff;
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: 40px;
          }
          .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgb(240, 243, 250);
            border-top: 1px solid rgb(221, 221, 221);
            height: 55px;
            .m-r {
              margin-top: 12px;
            }
          }
        }
      }
    }
  }
}
</style>
