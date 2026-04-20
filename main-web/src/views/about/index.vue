<template>
  <a-card class="license-card">
    <h1 class="title">关于系统</h1>
    <p>
      <span class="left">授权客户：</span>
      <span class="right">{{ certData.project }}</span>
    </p>
    <p>
      <span class="left">平台版本：</span>
      <span class="right">{{ certStatusFilter(certData.catalog) }}</span>
    </p>
    <p>
      <span class="left">节点数量：</span>
      <span class="right">{{ certData.node }}</span>
    </p>
    <p>
      <span class="left">到期时间：</span>
      <span class="right">{{ certData.expireDate }}</span>
    </p>
    <div class="link">
      <a-button class="pull-right m-t-n-xs m-r-xs" type="link" @click="active()">证书激活</a-button>
      <a-button class="pull-right m-t-n-xs" type="link" @click="getSid()">获取SID</a-button>
    </div>
    <LogActive ref="activeRef" @getData="getData()"></LogActive>
    <a-modal title="SID" v-model:visible="dialogVisible" width="30%">
      <a-input class="m-b-sm" v-model:value="sidArr[index]" readonly v-for="(item, index) in sidArr" :key="item"> </a-input>
      <template #footer>
        <a-button type="primary" @click="copySid($event)">一键复制</a-button>
      </template>
    </a-modal>
  </a-card>
</template>

<script>
import LogActive from './logActive.vue'
import { copyText } from 'utils/index'
import { getLicense, getSid } from 'services/license'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
function certStatusFilter(value) {
  const map = {
    FREE: '免费版',
    STANDARD: '标准版',
    ENTERPRISE: '企业版',
    ULTIMATE: '旗舰版'
  }
  return map[value]
}
export default {
  components: { LogActive },
  data() {
    return {
      activeObject: {
        type: 'sinple'
      },
      certData: {},
      // sid
      sidArr: '',
      dialogVisible: false
    }
  },
  setup() {
    const activeRef = ref()
    function active() {
      activeRef.value.open()
    }
    return {
      activeRef,
      active
    }
  },
  created() {
    this.getData()
  },
  methods: {
    certStatusFilter,
    getData() {
      getLicense().then((data) => {
        if (data.success) {
          this.certData = data.data
        }
      })
    },
    async getSid() {
      const data = await getSid()
      if (data.success) {
        this.sidArr = data.data
        this.dialogVisible = true
      }
    },
    copySid(event) {
      const str = this.sidArr.join('\n')
      copyText(str, event, () => {
        message.success('SID复制成功')
        this.dialogVisible = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.license-card {
  width: 440px;
  margin: 100px auto;
  ::v-deep(.ant-card-body) {
    padding: 0;
  }
  .title {
    height: 85px;
    background-color: rgba(0, 0, 0, 1);
    border-radius: 4px 4px 0 0;
    font-size: 28px;
    font-family: Microsoft YaHei;
    color: #ffffff;
    margin: 0;
    text-align: center;
    line-height: 85px;
  }
  p {
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
    .left {
      font-weight: 600;
      font-size: 14px;
    }
    .right {
      font-weight: 500;
      font-size: 14px;
      color: #333333;
    }
  }
  .link {
    padding: 10px 40px 24px;
    display: flex;
    justify-content: space-between;
    .el-button {
      margin-right: 0;
    }
  }
}
</style>
