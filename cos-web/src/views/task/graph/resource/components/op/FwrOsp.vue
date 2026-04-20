<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-form-item label="数据来源：">
      <el-radio-group class="simple" v-model="itemData.origin">
        <el-radio-button label="create">新增</el-radio-button>
        <el-radio-button label="reuse">已有</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="!isTemplate">
      <RegionItem :add-data="itemData" @changeVendorId="getFirewall" vendorType="OPENSTACK"></RegionItem>
      <h5>配置信息</h5>
      <div v-if="itemData.origin === 'create'">
        <el-col :span="24">
          <OpProject :add-data="itemData" :vendor-id="itemData.location.vendorId" v-if="!isConsole"></OpProject>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="名称：" prop="name" validate="required,noChinese">
            <el-input v-model="itemData.name" :disabled="isPreview"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="协议：" prop="protocol" validate="required">
            <el-select v-model="itemData.protocol" :disabled="isPreview">
              <el-option label="TCP" value="TCP"></el-option>
              <el-option label="UDP" value="UDP"></el-option>
              <el-option label="ICMP" value="ICMP"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="动作：" prop="action" validate="required">
            <el-select v-model="itemData.action" :disabled="isPreview">
              <el-option value="ALLOW" label="允许"></el-option>
              <el-option value="DENY" label="丢弃"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="IP版本">
            <el-select v-model="itemData.ipVersion" @change="setVersion" :disabled="isPreview">
              <el-option label="4" value="V4">4</el-option>
              <el-option label="6" value="V6">6</el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <el-col :span="24">
            <el-tooltip class="item" effect="dark" content="源IP地址/子网" placement="top-start">
              <basic-form-item label="源IP地址/子网" prop="sourceIp" validate="ipORcidr" v-if="itemData.ipVersion == 'V4'" :key="1">
                <el-input v-model="itemData.sourceIp" placeholder="10.20.1.1"></el-input>
              </basic-form-item>
              <basic-form-item label="起始IP：" prop="sourceIp" validate="ipV6" v-else :key="2">
                <el-input v-model="itemData.sourceIp" auto-complete="off" placeholder="请输入2222::类型格式"></el-input>
              </basic-form-item>
            </el-tooltip>
          </el-col>
          <el-col :span="24">
            <el-tooltip class="item" effect="dark" content="源IP地址/子网" placement="top-start">
              <basic-form-item label="目的IP地址/子网" prop="destIp" validate="ipORcidr" v-if="itemData.ipVersion == 'V4'" :key="3">
                <el-input v-model="itemData.destIp" placeholder="10.20.1.1/1"></el-input>
              </basic-form-item>
              <basic-form-item label="终止IP：" prop="destIp" validate="ipV6" v-else :key="4">
                <el-input v-model="itemData.destIp" auto-complete="off" placeholder="请输入2222::类型格式"></el-input>
              </basic-form-item>
            </el-tooltip>
          </el-col>
        </el-col>
        <el-col :span="24">
          <el-col :span="12">
            <el-tooltip class="item" effect="dark" content="源端口/端口范围" placement="top-start">
              <el-form-item v-if="itemData.protocol != 'ICMP'" label="源端口/端口范围：" prop="sourcePort">
                <el-input v-model="itemData.sourcePort" placeholder="8080:9090" :disabled="isPreview"></el-input>
              </el-form-item>
            </el-tooltip>
          </el-col>
          <el-col :span="12">
            <el-tooltip class="item" effect="dark" content="目的端口/端口范围" placement="top-start">
              <el-form-item v-if="itemData.protocol != 'ICMP'" label="目的端口/端口范围：" prop="destPort">
                <el-input v-model="itemData.destPort" placeholder="8090:9090" :disabled="isPreview"></el-input>
              </el-form-item>
            </el-tooltip>
          </el-col>
        </el-col>
        <el-col :span="24">
          <el-col :span="12">
            <el-form-item label="启用：" prop="enabled">
              <el-switch :disabled="isPreview" v-model="itemData.enabled" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="共享：" prop="shared">
              <el-switch v-model="itemData.shared" :disabled="isPreview" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24">
          <el-form-item label="描述：" prop="remark">
            <el-input type="textarea" v-model="itemData.remark" :disabled="isPreview"></el-input>
          </el-form-item>
        </el-col>
      </div>
      <el-form-item v-else label="规则列表：" prop="id" :rules="{ required: true, message: '请选择列表' }">
        <el-select v-model="itemData.id" placeholder="请选择" :disabled="isPreview" filterable="">
          <el-option v-for="item in listData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </el-form-item>
    </div>
  </basic-form>
</template>
<script>
import node from '../../../mixins/index'
import show from '../../../mixins/show'
import { initOpProps } from '../../data/init'
import OpProject from './components/OpProject.vue'
import RegionItem from 'views/resource-apply/components/RegionItem.vue'
import { getFirewallRule } from 'services/platform/index'
export default {
  mixins: [node, show],
  components: { OpProject, RegionItem },
  props: {
    ...initOpProps
  },
  data() {
    return {
      protocolType: ['TCP', 'UDP', 'ICMP'],
      listData: []
    }
  },
  created() {
    if (!this.itemData.ipVersion) this.$set(this.itemData, 'ipVersion', 'V4')
  },
  methods: {
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.itemData.protocol == 'ICMP') {
            delete this.itemData.sourcePort
            delete this.itemData.destPort
          }
          data = this.itemData
        }
      })
      return data
    },
    setVersion() {
      this.$set(this.itemData, 'sourceIp', '')
      this.$set(this.itemData, 'destIp', '')
    },
    getFirewall(vendorId, clear) {
      getFirewallRule({
        simple: true,
        params: this.$tools.handleSearchParam({ vendorId })
      }).then((data) => {
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
