<template>
  <div>
    <div class="common-detail">
      <div class="detail-header">
        <span class="detail-back" @click="cancle"><i class="iconfont icon-left-arrow"></i> 返回</span>
        <span class="line"></span>
        <span class="title">{{ id ? '编辑告警模板' : '新增告警模板' }}</span>
      </div>
    </div>
    <basic-form class="box" ref="addData" :model="addData" label-width="130px">
      <basic-form-item label="资源类型：" prop="resourceType" validate="required">
        <el-select filterable clearable v-model="addData.resourceType">
          <el-option v-for="item in resourceList" :key="item.value" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="站内信发送模板:" prop="message">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.message"></el-input>
      </basic-form-item>
      <basic-form-item label="站内信恢复模板:" prop="messageRecovery">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.messageRecovery"></el-input>
      </basic-form-item>
      <basic-form-item label="邮件发送模板:" prop="email">
        <RichEditor :value="addData.email" @change="setContent"></RichEditor>
      </basic-form-item>
      <basic-form-item label="邮件恢复模板:" prop="emailRecovery">
        <RichEditor :value="addData.emailRecovery" @change="setContent2"></RichEditor>
      </basic-form-item>
      <basic-form-item label="企业微信发送模板:" prop="weixin">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.weixin"></el-input>
      </basic-form-item>
      <basic-form-item label="企业微信恢复模板:" prop="weixinRecovery">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.weixinRecovery"></el-input>
      </basic-form-item>
      <basic-form-item label="钉钉发送模板:" prop="dingding">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.dingding"></el-input>
      </basic-form-item>
      <basic-form-item label="钉钉恢复模板:" prop="dingdingRecovery">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.dingdingRecovery"></el-input>
      </basic-form-item>
    </basic-form>
    <div class="addFoot">
      <div>
        <el-button type="ghost" @click.native="cancle">取 消</el-button>
        <el-button type="primary" @click.native="addSubmit">确 定</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import RichEditor from 'components/rich-text-editor/index.vue'
import { createTemp, modifyTemp, getTempDetail } from 'services/monitor/index.js'
import { getResourceList } from 'services/platform/index'
export default {
  components: {
    RichEditor
  },
  data() {
    return {
      resourceList: [],
      id: this.$route.query.id,
      addData: {
        resourceType: ''
      },
      template: {
        // eslint-disable-next-line no-template-curly-in-string
        send: '告警名称：${name! }\n告警源：${target!}\n监控指标：${metric!}\n告警级别：${level!}\n告警内容：${remark!}\n来自分发策略：${policy!}\n告警时间：${triggerTime!}\n告警值：${alarmVal!}\n目前处理状态：${status!}',
        recive:
          // eslint-disable-next-line no-template-curly-in-string
          '告警名称：${name! }\n告警源：${target!}\n监控指标：${metric!}\n原告警级别：${level!}\n原告警内容：${remark!}\n来自分发策略：${policy!}\n告警时间：${triggerTime!}\n告警值：${alarmVal!}\n告警恢复值：${recoveryVal!}\n告警恢复时间：${solveTime!}\n持续时间：${duration!}\n目前处理状态：${status!}'
      }
    }
  },
  created() {
    getResourceList().then(({ data, success }) => {
      if (success) {
        this.resourceList = data.rows.map((item) => ({ ...item, value: item.resourceType }))
      }
    })
  },
  methods: {
    init() {
      getTempDetail(this.id).then((data) => {
        if (data.success) {
          const row = data.data
          this.addData = {
            id: row.id,
            resourceType: row.resourceType,
            email: row.email,
            emailRecovery: row.emailRecovery,
            weixin: row.weixin,
            weixinRecovery: row.weixinRecovery,
            dingding: row.dingding,
            dingdingRecovery: row.dingdingRecovery,
            message: row.message,
            messageRecovery: row.messageRecovery
          }
        }
      })
    },
    setContent(data) {
      this.addData.email = data
    },
    setContent2(data) {
      this.addData.emailRecovery = data
    },
    addSubmit() {
      this.$refs.addData.validate((valid) => {
        if (valid) {
          const http = this.id ? modifyTemp : createTemp
          http(this.addData).then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              history.go(-1)
            }
          })
        }
      })
    },
    cancle() {
      history.go(-1)
    }
  },
  mounted() {
    if (this.id) {
      this.init()
    } else {
      this.addData = {
        message: this.template.send,
        messageRecovery: this.template.recive,
        // eslint-disable-next-line no-template-curly-in-string
        email: '<p>告警名称：${name! }<br/>告警源：${target!}<br/>监控指标：${metric!}<br/>告警级别：${level!}<br/>告警内容：${remark!}<br/>来自分发策略：${policy!}<br/>告警时间：${triggerTime!}<br/>告警值：${alarmVal!}<br/>目前处理状态：${status!}</p>',
        emailRecovery:
          // eslint-disable-next-line no-template-curly-in-string
          '<p>告警名称：${name! }<br/>告警源：${target!}<br/>监控指标：${metric!}<br/>原告警级别：${level!}<br/>原告警内容：${remark!}<br/>来自分发策略：${policy!}<br/>告警时间：${triggerTime!}<br/>告警值：${alarmVal!}<br/>告警恢复值：${recoveryVal!}<br/>告警恢复时间：${solveTime!}<br/>持续时间：${duration!}<br/>目前处理状态：${status!}</p>',
        weixin: this.template.send,
        weixinRecovery: this.template.recive,
        dingding: this.template.send,
        dingdingRecovery: this.template.recive
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.box {
  margin-top: 44px;
  padding: 20px 50px;
  background: #fff;
}
.common-detail {
  background: #fff;
  position: absolute;
  z-index: 2;
  width: 100%;
  right: 0;
  top: 0;
  border: 1px solid #e6e6e6;
  .detail-header {
    width: calc(100% - 40px);
    height: 44px;
    line-height: 44px;
    position: absolute;
    z-index: 99;
    background: #fff;
    padding: 0 20px;
    border-bottom: 1px solid #e6e6e6;
    .title {
      display: inline-block;
      color: #333;
    }
    .line {
      position: relative;
      top: 4px;
      margin: 0 10px;
      height: 20px;
      width: 1px;
      display: inline-block;
      background-color: #b5b5b5;
    }
    .detail-back {
      color: #46abf1;
      cursor: pointer;
    }
  }
}
.addFoot {
  text-align: center;
  height: 60px;
  line-height: 60px;
  padding: 10px;
  background: #f0f2f9;
  // position: fixed;
  // bottom: 0px;
  // z-index: 1000
}
</style>
