<template>
  <el-card>
    <div slot="header">
      <span class="back" @click="goBack"><i class="iconfont icon-left-arrow"></i> 返回</span>
      <span class="line"></span>
      <span class="header-title">F5申请</span>
      <span class="pull-right m-r-lg">
        <el-button type="primary" @click="save" :loading="loading" :disabled="parseInt(this.projectId) === 0"> 申请</el-button>
      </span>
      <!--<span class="money-right">-->
      <!--{{money}}-->
      <!--</span>-->
      <!--<span class="money-right" style="color: #000; font-size: 14px">-->
      <!--计费价格：-->
      <!--</span>-->
    </div>
    <div class="template-body">
      <basic-form ref="ResourceF5Apply" :model="itemData" label-width="180px">
        <el-row>
          <el-col :span="8">
            <basic-form-item label="负载均衡算法：" prop="loadBalancing" validate="required">
              <el-select v-model="itemData.loadBalancing" @change="changeBalancing">
                <el-option v-for="(item, index) in methodData" :key="index" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-row v-for="(item, index) in itemData.members" :key="index">
              <el-col :span="8">
                <basic-form-item :label="'服务器IP地址' + (index + 1) + '：'" :prop="'members.' + index + '.poolMemberAddress'" validate="ip,required">
                  <el-input v-model="item.poolMemberAddress"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="6">
                <basic-form-item label="服务器端口：" :prop="'members.' + index + '.poolMemberPort'" validate="port,required">
                  <el-input v-model="item.poolMemberPort"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="6" v-if="radioVisible">
                <basic-form-item label="Ratio:" prop="ratio">
                  <el-input-number v-model="item.ratio" :min="0"></el-input-number>
                </basic-form-item>
              </el-col>
              <el-col :span="6" v-if="limitVisible">
                <basic-form-item label="Connection Limit:" prop="connectionLimit">
                  <el-input-number v-model="item.connectionLimit" :min="0"></el-input-number>
                </basic-form-item>
              </el-col>
              <el-col :span="3">
                <el-button class="m-l" type="danger" v-if="itemData.members.length > 1" @click="removeMembers(index)">
                  <Icon type="icon-sub" />
                </el-button>
                <el-button class="m-l" type="primary" @click="addMembers()" v-if="index === itemData.members.length - 1">
                  <Icon type="icon-Added" />
                </el-button>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="健康检查：" prop="monitorType" validate="required">
              <el-select v-model="itemData.monitorType" @change="changeMonitorType">
                <el-option v-for="(item, index) in monitorType" :key="index" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <div v-if="itemData.monitorType == 'http'">
            <el-col :span="23">
              <basic-form-item label="Send String：" prop="send">
                <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="itemData.send"> </el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="23">
              <basic-form-item label="Receive String：" prop="recv">
                <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="itemData.recv"> </el-input>
              </basic-form-item>
            </el-col>
          </div>
          <el-col :span="24">
            <el-col :span="8">
              <basic-form-item label="开启会话保持：">
                <el-switch v-model="persistenceOn" active-color="#13ce66" inactive-color="#ff4949" @change="changePersistenceOn"> </el-switch>
              </basic-form-item>
            </el-col>
            <el-col :span="8" v-if="persistenceOn">
              <basic-form-item label="会话保持方式：" prop="persistence" validate="required">
                <el-select v-model="itemData.persistence" @change="changePersistence">
                  <el-option v-for="(item, index) in persistenceData" :key="index" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="7" v-if="itemData.persistence != 'cookie' && persistenceOn">
              <basic-form-item label="会话保持超时时间：" prop="persistenceTimeout" validate="required">
                <el-select v-model="itemData.persistenceTimeout">
                  <el-option label="300" :value="300"></el-option>
                  <el-option label="1800" :value="1800"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-col>
          <el-col :span="24">
            <el-col :span="8">
              <basic-form-item label="是否有同网段访问：" prop="hasSameSegment">
                <el-switch v-model="itemData.hasSameSegment" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="是否要看到客户端IP地址：" prop="X-Forwarded-For">
                <el-switch v-model="itemData['X-Forwarded-For']" active-color="#13ce66" inactive-color="#ff4949" @change="changeSnat"></el-switch>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="是否配置HTTP协议：" prop="isConfigHttp">
                <el-switch v-model="itemData['isConfigHttp']" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="是否配置SNAT：" prop="isConfigSnat">
                <el-switch v-model="itemData.isConfigSnat" active-color="#13ce66" inactive-color="#ff4949" @change="changeSnat"></el-switch>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="开启iRULES：">
                <el-switch v-model="iRulesOn" active-color="#13ce66" inactive-color="#ff4949" @change="changeiRulesOn"> </el-switch>
              </basic-form-item>
            </el-col>
            <el-col :span="8" v-if="iRulesOn">
              <div>
                <basic-form-item label="使用iRULES：" prop="iRules" validate="required" required-message="请添加测试脚本内容">
                  <el-button v-if="!itemData.iRules" type="ghost" @click="addiRules">添加测试脚本</el-button>
                  <el-button v-else type="ghost" @click="editiRules">脚本1</el-button>
                  <el-button type="text" v-if="itemData.iRules" @click="removeiRules">
                    <Icon style="font-size: 26px" type="icon-quxiao"></Icon>
                  </el-button>
                </basic-form-item>
              </div>
            </el-col>
          </el-col>
        </el-row>
      </basic-form>
    </div>
    <el-dialog :title="itemData.iRules ? '编辑测试脚本' : '添加测试脚本'" :visible.sync="addiRulesFlag" v-if="addiRulesFlag">
      <!--<el-input type="textarea" :rows="10" placeholder="请输入内容" v-model="content">-->
      <!--</el-input>-->
      <code-mirror :read-only="false" :value="content" @changed="getContent"></code-mirror>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addiRulesFlag = false">取 消</el-button>
        <el-button type="primary" @click.native="addSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import { createCloudServices } from 'services/platform/index'
const monitorType = [
  { name: 'TCP', value: 'tcp' },
  { name: 'HTTP', value: 'http' },
  { name: 'HTTPS', value: 'https' },
  { name: 'ICMP', value: 'icmp' },
  { name: 'SOAP', value: 'soap' }
]
const methodData = [
  { name: 'Round Robin', value: 'round-robin' },
  { name: 'Least Connections(member)', value: 'least-connections-member' },
  { name: 'Least Connections(node)', value: 'least-connections-node' }
]
const persistenceData = [
  { name: 'Cookie', value: 'cookie' },
  { name: 'Source Address Affinity', value: 'sourceAddressAffinity' }
]
export default {
  components: {},
  data() {
    return {
      methodData,
      monitorType,
      persistenceData,
      loading: false,
      projectId: localStorage.getItem('projectId'),
      addData: {
        serviceId: this.$route.query.itemId,
        startMode: 'AUTO',
        params: {}
      },
      itemData: {
        resourceCategory: 'ResourceF5Apply',
        members: [{}],
        hasSameSegment: false,
        monitorType: 'tcp',
        isConfigSnat: false,
        isConfigHttp: false,
        'X-Forwarded-For': false,
        iRules: ''
      },
      persistenceOn: false,
      iRulesOn: false,
      addiRulesFlag: false,
      radioVisible: false,
      limitVisible: false
    }
  },
  created() {},
  methods: {
    addMembers() {
      this.itemData.members.push({})
    },
    removeMembers(index) {
      this.itemData.members.splice(index, 1)
    },
    changePersistenceOn(value) {
      if (value) {
        this.$set(this.itemData, 'persistence', '')
        this.$set(this.itemData, 'persistenceTimeout', 300)
      } else {
        delete this.itemData.persistence
        delete this.itemData.persistenceTimeout
      }
    },
    changeMonitorType(value) {
      if (value === 'http') {
        this.$set(this.itemData, 'send', '')
        this.$set(this.itemData, 'recv', '')
      } else {
        delete this.itemData.send
        delete this.itemData.recv
      }
    },
    changePersistence(value) {
      switch (value) {
        case 'cookie':
          delete this.itemData.persistenceTimeout
          break
        default:
          this.$set(this.itemData, 'persistenceTimeout', 300)
          break
      }
    },
    changeSnat(value) {
      if (this.itemData.isConfigSnat && this.itemData['X-Forwarded-For']) {
        this.$message.error('是否配置SNAT和是否要看到客户端IP地址，不能同时勾选，请更改设置！')
      }
    },
    changeiRulesOn(value) {
      if (value) {
        this.$set(this.itemData, 'iRules', '')
      } else {
        delete this.itemData.iRules
      }
    },
    addiRules() {
      this.content = ''
      this.addiRulesFlag = true
    },
    editiRules() {
      this.content = this.itemData.iRules
      this.addiRulesFlag = true
    },
    removeiRules() {
      this.itemData.iRules = null
    },
    addSubmit() {
      this.itemData.iRules = this.content
      this.addiRulesFlag = false
    },
    changeBalancing(value) {
      switch (value) {
        case 'ratio-member':
        case 'dynamic-ratio-node':
        case 'ratio-least-connections-member':
          this.radioVisible = true
          this.limitVisible = false
          this.itemData.members.forEach(item => {
            this.$set(item, 'ratio', 1)
          })
          break
        case 'weighted-least-connections-member':
          this.radioVisible = false
          this.limitVisible = true
          this.itemData.members.forEach(item => {
            this.$set(item, 'connectionLimit', 0)
          })
          break
        default:
          this.radioVisible = false
          this.limitVisible = false
          this.itemData.members.forEach(item => {
            if (item.ratio) {
              delete item.ratio
            }
            if (item.connectionLimit || Number(item.connectionLimit) === 0) {
              delete item.connectionLimit
            }
          })
          break
      }
    },
    getContent(value) {
      this.content = value
    },
    save() {
      this.$refs.ResourceF5Apply.validate(valid => {
        if (valid) {
          this.loading = true
          this.addData.params = Object.assign({}, this.itemData)
          createCloudServices(this.addData).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.addData = {}
              this.goBack()
            }
            this.loading = false
          })
        }
      })
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>
<style scoped>
.template {
  width: 100%;
  overflow: hidden;
}

.template-header {
  width: 100%;
  height: 44px;
  line-height: 44px;
  z-index: 99;
  padding: 0px 20px;
  border-bottom: 1px solid #ebebeb;
}

.header-title {
  display: inline-block;
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

.back {
  color: #46abf1;
  cursor: pointer;
}

.money-right {
  float: right;
  position: relative;
  right: 40px;
  font-size: 16px;
  color: #46abf1;
}

.template-body {
  width: 100%;
  padding: 20px 20px;
}
</style>
