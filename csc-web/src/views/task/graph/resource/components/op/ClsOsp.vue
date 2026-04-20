<template>
  <basic-form :model="data.origin === 'create' ? data.listener : data" ref="form" :disabled="isPreview">
    <el-form-item label="数据来源：">
      <el-radio-group class="simple" v-model="data.origin">
        <el-radio-button label="create">新增</el-radio-button>
        <el-radio-button label="reuse" :disabled="lastNode.origin === 'create'">已有</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="!isTemplate">
      <RegionItem :addData="data" @changeVendorId="getData" vendorType="OPENSTACK"></RegionItem>
      <h5>配置信息</h5>
      <div v-if="data.origin === 'create'">
        <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
          <el-input v-model="data.listener.name" :disabled="isPreview"></el-input>
        </basic-form-item>
        <basic-form-item label="监听协议：" prop="protocol">
          <el-radio-group v-model="data.listener.protocol" :disabled="isPreview">
            <el-radio :label="item.name" :key="index" v-for="(item, index) in protocolType" border> {{ item.name }} </el-radio>
          </el-radio-group>
        </basic-form-item>
        <basic-form-item label="监听端口：" prop="port" validate="required" required-message="请输入端口">
          <el-input-number v-model="data.listener.port" :disabled="isPreview" :max="65535" :min="1"></el-input-number>
        </basic-form-item>
        <el-tooltip class="item" effect="dark" content="负载均衡方法" placement="top-start">
          <el-form-item label="负载均衡方法：" required>
            <el-radio-group v-model="data.pool.lbMethod" :disabled="isPreview">
              <el-radio :label="item.value" :key="index" v-for="(item, index) in lbMethods" border> {{ item.name }} </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="健康检查类型" placement="top-start">
          <el-form-item label="健康检查类型：" required>
            <el-select v-model="data.monitor.type" :disabled="isPreview">
              <el-option v-for="item in monitortypes" :key="item" :value="item" :label="item"></el-option>
            </el-select>
          </el-form-item>
        </el-tooltip>
        <div v-if="expertFlag">
          <el-form-item label="会话保持：">
            <el-switch v-model="data.pool.isOn" :disabled="isPreview" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
          </el-form-item>
          <el-form-item label="会话保持类型：" v-if="data.pool.isOn">
            <el-select v-model="data.pool.type" :disabled="isPreview">
              <el-option v-for="item in pooltypes" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="App.cookie" v-if="data.pool.type == 'APP_COOKIE'">
            <el-input v-model="data.pool.cookieName" :disabled="isPreview"></el-input>
          </el-form-item>
          <el-tooltip class="item" effect="dark" content="健康检查间隔时间（秒）" placement="top-start">
            <el-form-item label="健康检查间隔时间（秒）：">
              <el-input v-model="data.monitor.timeout" :disabled="isPreview"></el-input>
            </el-form-item>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="健康检查超时时间（秒）" placement="top-start">
            <el-form-item label="健康检查超时时间（秒）：">
              <el-input v-model="data.monitor.delay" :disabled="isPreview"></el-input>
            </el-form-item>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="健康检查最大尝试次数" placement="top-start">
            <el-form-item label="健康检查最大尝试次数：">
              <el-input v-model="data.monitor.maxRetries" :disabled="isPreview"></el-input>
            </el-form-item>
          </el-tooltip>
          <el-form-item label="HTTP方法：" v-if="data.monitor.type == 'HTTP'">
            <el-select v-model="data.monitor.httpMethod" :disabled="isPreview">
              <el-option v-for="item in monitorHttpMethod" :label="item" :value="item" :key="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="URL路径：" v-if="data.monitor.type == 'HTTP'">
            <el-input v-model="data.monitor.urlPath" :disabled="isPreview"></el-input>
          </el-form-item>
          <el-form-item label="期望的状态码：" v-if="data.monitor.type == 'HTTP'">
            <el-input v-model="data.monitor.expectedCodes" :disabled="isPreview"></el-input>
          </el-form-item>
        </div>
        <div class="text-center">
          <span @click="expert">{{ name }}</span>
        </div>
      </div>
      <el-form-item v-else label="监听器列表：">
        <el-select v-model="data.id" placeholder="请选择" :disabled="isPreview" filterable="">
          <el-option v-for="item in listData" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
    </div>
  </basic-form>
</template>
<script>
import node from '../../../mixins/index'
import show from '../../../mixins/show'
import { initOpItem } from '../../data/init'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'
import { getLbListen } from 'services/platform/index'
export default {
  components: { RegionItem },
  mixins: [node, show],
  props: {
    nodeId: {},
    itemData: {
      type: Object,
      default: function () {
        return {
          ...initOpItem,
          listener: {
            name: '',
            protocol: 'HTTP',
            port: ''
          },
          pool: {
            lbMethod: 'ROUND_ROBIN',
            type: ''
          },
          monitor: {
            type: 'PING',
            httpMethod: 'GET',
            expectedCodes: 200,
            urlPath: '/',
            maxRetries: 3,
            timeout: 5,
            delay: 5
          }
        }
      }
    }
  },
  computed: {
    lastNode: function () {
      const lastObj = this.getPreNodeData(this.nodeId, 'task.resource.clb.osp')
      if (lastObj.origin) return lastObj
      return { origin: 'create' }
    }
  },
  data() {
    return {
      name: '显示高级选项',
      listData: [],
      expertFlag: false,
      isOn: false,
      active: 0,
      monitortypes: ['PING', 'TCP', 'HTTP'],
      monitorHttpMethod: ['GET', 'HEAD'],
      pooltypes: [
        { name: 'App Cookie', value: 'APP_COOKIE' },
        { name: 'Http Cookie', value: 'HTTP_COOKIE' },
        { name: '源IP', value: 'SOURCE_IP' }
      ],
      lbMethods: [
        { name: '轮询', value: 'ROUND_ROBIN' },
        { name: '最少连接', value: 'LEAST_CONNECTIONS' },
        { name: '源IP', value: 'SOURCE_IP' }
      ],
      protocolType: [{ name: 'HTTP' }, { name: 'HTTPS' }, { name: 'TCP' }],
      typeList: [],
      data: {}
    }
  },
  created() {
    if (this.lastNode.location) this.itemData.location = this.lastNode.location
    this.data = this.itemData
  },
  methods: {
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.data.origin === 'create') {
            this.data.pool.protocol = this.data.listener.protocol
            if (!this.data.monitor.maxRetries || !this.data.monitor.timeout || !this.data.monitor.delay) {
              this.$message.error('请填写高级参数!')
              return
            }
          } else {
            if (!this.data.id && !this.isTemplate) {
              this.$message.error('请选择已有监听器')
              return
            }
          }
          data = this.data
        }
      })
      return data
    },
    expert() {
      this.expertFlag = !this.expertFlag
      if (this.expertFlag) {
        this.name = '隐藏高级选项'
      } else this.name = '显示高级选项'
    },
    getData(vendorId, clear) {
      getLbListen({
        simple: true,
        params: this.$tools.handleSearchParam({ vendorId, lbId: this.lastNode.id })
      }).then(data => {
        if (data.success) {
          this.listData = data.data.rows
          if (clear) {
            this.itemData.id = ''
          }
        }
      })
    }
  }
}
</script>

<style></style>
