<template>
  <div>
    <el-steps :active="active" finish-status="finish" class="m-b-lg">
      <el-step title="协议&监听"></el-step>
      <el-step title="后端服务器"></el-step>
      <el-step title="健康检查"></el-step>
    </el-steps>
    <basic-form v-show="active === 0" :model="createData.protocal" ref="protocal" label-width="180px">
      <basic-form-item label="选择负载均衡协议: " prop="protocol">
        <el-radio-group v-model="createData.protocal.protocol" @change="createData.protocal.scheduler = ''" :disabled="addData.name === 'edit'">
          <el-radio label="tcp">TCP</el-radio>
          <el-radio label="udp">UDP</el-radio>
          <el-radio label="http">HTTP</el-radio>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="后端协议: ">
        <div>{{ createData.protocal.protocol }}</div>
      </basic-form-item>
      <basic-form-item label="监听端口: " prop="port" validate="required">
        <el-input-number v-model="createData.protocal.port" :min="1" :max="65535" :disabled="addData.name === 'edit'"></el-input-number>
      </basic-form-item>
      <basic-form-item label="监听名称: " prop="name" validate="required">
        <el-input v-model="createData.protocal.name"></el-input>
      </basic-form-item>
      <template v-if="experts.protocal.flag">
        <basic-form-item label="调度算法: " prop="scheduler" validate="required" required-message="请选择调度算法">
          <el-radio-group v-model="createData.protocal.scheduler" size="medium">
            <el-radio-button label="wrr">加权轮询(WRR)</el-radio-button>
            <el-radio-button label="wlc">加权最小连接数(WLC)</el-radio-button>
            <el-radio-button label="rr">轮询(RR)</el-radio-button>
            <el-radio-button label="ch" :disabled="createData.protocal.protocol === 'http'">一致性哈希(ch)</el-radio-button>
          </el-radio-group>
        </basic-form-item>
        <template v-if="createData.protocal.scheduler === 'ch' && createData.protocal.protocol !== 'http'">
          <basic-form-item label="哈希因子: " prop="hash" validate="required">
            <el-select v-model="createData.protocal.hash">
              <el-option label="四元组" value="tch"></el-option>
              <el-option label="源IP" value="sch"></el-option>
            </el-select>
          </basic-form-item>
        </template>
        <basic-form-item label="开启会话保持: ">
          <el-switch v-model="createData.protocal.stickySession" active-color="#13ce66" inactive-color="#ff4949" @change="changeSticky"> </el-switch>
        </basic-form-item>
        <template v-if="createData.protocal.stickySession">
          <template v-if="createData.protocal.protocol === 'http'">
            <basic-form-item label="Cookie处理方式: " prop="stickySessionType">
              <el-select v-model="createData.protocal.stickySessionType">
                <el-option label="植入Cookie" value="insert"></el-option>
                <el-option label="重写Cookie" value="server"></el-option>
              </el-select>
            </basic-form-item>
            <template v-if="createData.protocal.stickySessionType === 'server'">
              <basic-form-item label="Cookie名称: " prop="cookie" validate="required">
                <el-input v-model="createData.protocal.cookie"></el-input>
              </basic-form-item>
            </template>
          </template>
          <basic-form-item label="会话保持超时时间: " prop="persistenceTimeout">
            <el-input-number v-model="createData.protocal.persistenceTimeout" :min="1" :max="86400"></el-input-number>
          </basic-form-item>
        </template>
        <!-- <basic-form-item label="启用访问控制: ">
          <el-switch v-model="createData.protocal.aclStatus" active-color="#13ce66" inactive-color="#ff4949" @change="changeAcl"> </el-switch>
        </basic-form-item> -->
        <template v-if="createData.protocal.aclStatus">
          <basic-form-item label="访问控制方式: " prop="aclType">
            <el-select v-model="createData.protocal.aclType">
              <el-option label="白名单：(允许特定IP访问负载均衡SLB)" value="white"></el-option>
              <el-option label="黑名单：(禁止特定IP访问负载均衡SLB)" value="black"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="选择访问控制策略组: " prop="aclId">
            <el-select v-model="createData.protocal.aclId">
              <el-option v-for="(item, index) in cList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </template>
        <basic-form-item label="开启监听带宽限速: ">
          <el-switch v-model="bwSwitch" active-color="#13ce66" inactive-color="#ff4949" disabled> </el-switch>
        </basic-form-item>
        <template v-if="bwSwitch">
          <basic-form-item label="带宽峰值: " prop="bandwidth" validate="required">
            <el-input-number v-model="createData.protocal.bandwidth" :min="1" :max="65535"></el-input-number>
          </basic-form-item>
        </template>
        <template v-if="createData.protocal.protocol === 'tcp'">
          <basic-form-item label="连接超时时间: ">
            <el-input-number v-model="createData.protocal.connLimit" :min="10" :max="900"></el-input-number>
          </basic-form-item>
        </template>
        <template v-if="createData.protocal.protocol === 'http'">
          <basic-form-item label="连接空闲超时时间: ">
            <el-input-number v-model="createData.protocal.idleTimeout" :min="1" :max="60"></el-input-number>
          </basic-form-item>
          <basic-form-item label="连接请求超时时间: ">
            <el-input-number v-model="createData.protocal.requestTimeout" :min="1" :max="180"></el-input-number>
          </basic-form-item>
          <basic-form-item label="Gzip数据压缩: ">
            <el-switch v-model="createData.protocal.gzip" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </basic-form-item>
          <basic-form-item label="附加HTTP头字段: ">
            <basic-form-item label="" label-width="0px">
              <el-checkbox v-model="createData.protocal.xForwardedFor" disabled>通过X-Forwarded-For头字段获取客户端真实IP。</el-checkbox>
            </basic-form-item>
            <basic-form-item label="" label-width="0px">
              <el-checkbox v-model="createData.protocal.xForwardedFor_SLBID">通过SLB-ID头字段获取SLB实例ID。</el-checkbox>
            </basic-form-item>
            <basic-form-item label="" label-width="0px">
              <el-checkbox v-model="createData.protocal.xForwardedFor_SLBIP">通过SLB-IP头字段获取SLB实例IP地址。</el-checkbox>
            </basic-form-item>
            <basic-form-item label="" label-width="0px">
              <el-checkbox v-model="createData.protocal.xForwardedFor_proto">通过X-Forwarded-Proto头字段获取SLB的监听协议。</el-checkbox>
            </basic-form-item>
          </basic-form-item>
        </template>
        <basic-form-item label="获取客户端真实IP: ">
          <div>默认开启</div>
        </basic-form-item>
      </template>
      <div class="text-center">
        <span @click="expert('protocal')">{{ experts.protocal.name }}</span>
      </div>
    </basic-form>
    <basic-form v-show="active === 1" :model="createData.server" ref="server" label-width="180px">
      <basic-form-item label="后端服务器类型: ">
        <el-radio-group v-model="serverType">
          <el-radio-button label="vm">虚拟服务器组</el-radio-button>
          <el-radio-button label="default" disabled>默认服务器组</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="选择服务器组: " prop="poolId" validate="required">
        <el-select v-model="createData.server.poolId" @change="changePool">
          <el-option v-for="(item, index) in pList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <p>
        <basic-table :data="mList" :params="params" :get-list="getLbMembers" :total="total">
          <el-table-column prop="name" label="云服务器名称/ID" show-overflow-tooltip></el-table-column>
          <el-table-column prop="regionName" label="地域" show-overflow-tooltip></el-table-column>
          <el-table-column prop="vpcName" label="VPC" show-overflow-tooltip></el-table-column>
          <el-table-column label="公网/内网IP地址" show-overflow-tooltip>
            <template slot-scope="scope"> {{ scope.row.publicNetwork }} / {{ scope.row.privateNetwork }} </template>
          </el-table-column>
          <el-table-column prop="port" label="端口" show-overflow-tooltip></el-table-column>
          <el-table-column prop="weight" label="权重" show-overflow-tooltip></el-table-column>
        </basic-table>
      </p>
    </basic-form>
    <basic-form ref="healthy" v-show="active === 2" :model="createData.healthy" label-width="180px">
      <basic-form-item label="开启健康检查: ">
        <el-switch v-model="createData.healthy.healthCheck" :disabled="createData.protocal.protocol === 'tcp' || createData.protocal.protocol === 'udp'"></el-switch>
      </basic-form-item>
      <template v-if="experts.healthy.flag">
        <template v-if="createData.protocal.protocal === 'tcp'">
          <basic-form-item label="健康检查协议: ">
            <el-select v-model="createData.healthy.healthCheckType">
              <el-option label="tcp" value="tcp"></el-option>
              <el-option label="http" value="http"></el-option>
            </el-select>
          </basic-form-item>
        </template>
        <basic-form-item label="健康检查端口: ">
          <el-input-number v-model="createData.healthy.healthCheckConnectPort" :min="1" :max="65535"></el-input-number>
        </basic-form-item>
        <template v-if="createData.protocal.protocol === 'http'">
          <basic-form-item label="健康检查路径: " prop="healthCheckURI" validate="">
            <el-input v-model="createData.healthy.healthCheckURI"></el-input>
          </basic-form-item>
          <basic-form-item label="健康检查域名: " prop="healthCheckDomain" validate="">
            <el-input v-model="createData.healthy.healthCheckDomain"></el-input>
          </basic-form-item>
          <basic-form-item label="正常状态码: " prop="healthCheckHttpCodes" validate="">
            <el-checkbox-group v-model="createData.healthy.healthCheckHttpCodes">
              <el-checkbox label="http_2xx"></el-checkbox>
              <el-checkbox label="http_3xx"></el-checkbox>
              <el-checkbox label="http_4xx"></el-checkbox>
              <el-checkbox label="http_5xx"></el-checkbox>
            </el-checkbox-group>
          </basic-form-item>
        </template>
        <basic-form-item label="健康检查响应超时时间: " prop="healthCheckConnectTimeout" validate="required">
          <el-input-number v-model="createData.healthy.healthCheckConnectTimeout" :min="1" :max="300"></el-input-number>
        </basic-form-item>
        <basic-form-item label="健康检查间隔时间: " prop="healthCheckInterval" validate="required">
          <el-input-number v-model="createData.healthy.healthCheckInterval" :min="1" :max="50"></el-input-number>
        </basic-form-item>
        <basic-form-item label="健康检查健康阈值: " prop="healthyThreshold" validate="required">
          <el-input-number v-model="createData.healthy.healthyThreshold" :min="2" :max="10"></el-input-number>
        </basic-form-item>
        <basic-form-item label="健康检查不健康阈值: " prop="unhealthyThreshold" validate="required">
          <el-input-number v-model="createData.healthy.unhealthyThreshold" :min="2" :max="10"></el-input-number>
        </basic-form-item>
        <template v-if="createData.protocal.protocol === 'udp'">
          <basic-form-item label="健康检查请求: " prop="healthCheckReq">
            <el-input v-model="createData.healthy.healthCheckReq"></el-input>
          </basic-form-item>
          <basic-form-item label="健康检查返回结果: " prop="healthCheckExp">
            <el-input v-model="createData.healthy.healthCheckExp"></el-input>
          </basic-form-item>
        </template>
      </template>
      <div class="text-center">
        <span @click="expert('healthy')">{{ experts.healthy.name }}</span>
      </div>
    </basic-form>
  </div>
</template>
<script>
import { getListenControls, getLbPools, getLbMembers } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object
    },
    vendorId: {
      type: Number
    },
    lbId: {
      type: Number
    },
    regionId: {
      type: String
    }
  },
  data() {
    return {
      active: 0,
      bwSwitch: true,
      createData: {
        protocal: {
          protocol: 'tcp',
          port: 1,
          xForwardedFor: true,
          stickySession: false,
          scheduler: '',
          hash: ''
        },
        server: {},
        healthy: {
          healthCheck: true,
          healthCheckConnectTimeout: 5,
          healthCheckInterval: 2,
          healthCheckHttpCodes: []
        }
      },
      experts: {
        protocal: { name: '显示高级选项', flag: false },
        server: { name: '显示高级选项', flag: false },
        healthy: { name: '显示高级选项', flag: false }
      },
      aclList: [],
      serverType: 'vm',
      serverList: [],
      cList: [],
      mList: [],
      pList: [],
      params: {
        page: 1,
        rows: 99999
      },
      total: 0
    }
  },
  created() {
    console.log(this.addData)
    if (this.addData.name === 'edit') {
      const data = this.addData.data
      this.createData.protocal = {
        protocol: data.protocol,
        healthCheckType: data.healthCheckType,
        port: data.port,
        name: data.name,
        scheduler: data.scheduler,
        hash: data.hash,
        stickySession: data.stickySession,
        stickySessionType: data.stickySessionType,
        cookie: data.cookie,
        persistenceTimeout: data.persistenceTimeout,
        cookieTimeout: data.cookieTimeout,
        aclStatus: data.aclStatus,
        aclType: data.aclType,
        aclId: data.aclId,
        bandwidth: data.bandwidth,
        idleTimeout: data.idleTimeout,
        requestTimeout: data.requestTimeout,
        gzip: data.gzip,
        xForwardedFor: data.xForwardedFor,
        xForwardedFor_SLBID: data.xForwardedFor_SLBID,
        xForwardedFor_SLBIP: data.xForwardedFor_SLBIP,
        xForwardedFor_proto: data.xForwardedFor_proto,
        connLimit: data.connLimit
      }
      this.createData.server = {
        poolId: data.poolId
      }
      this.createData.healthy = {
        healthCheck: data.healthCheck,
        healthCheckConnectPort: data.healthCheckConnectPort,
        healthCheckURI: data.healthCheckURI,
        healthCheckDomain: data.healthCheckDomain,
        healthCheckHttpCode: data.healthCheckHttpCode,
        healthCheckConnectTimeout: data.healthCheckConnectTimeout,
        healthCheckInterval: data.healthCheckInterval,
        healthyThreshold: data.healthyThreshold,
        unhealthyThreshold: data.unhealthyThreshold
      }
    }
  },
  mounted() {},
  methods: {
    changeAcl() {
      if (this.createData.protocal.aclStatus) {
        this.getListenControls()
      }
    },
    changePool() {
      if (this.createData.server.poolId) {
        this.getLbMembers()
      }
    },
    getListenControls() {
      const params = this.$tools.handleSearchParam({
        vendorId: this.vendorId,
        regionId: this.regionId
      })
      getListenControls({
        simple: true,
        params
      }).then(data => {
        if (data.success) {
          this.cList = data.data.rows
        }
      })
    },
    getLbPools() {
      const params = this.$tools.handleSearchParam({
        vendorId: this.vendorId,
        regionId: this.regionId,
        lbId: this.lbId
      })
      getLbPools({
        simple: true,
        params
      }).then(data => {
        if (data.success) {
          this.pList = data.data.rows
        }
      })
    },
    getLbMembers() {
      const params = this.$tools.handleSearchParam({
        vendorId: this.vendorId,
        regionId: this.regionId,
        poolId: this.createData.server.poolId
      })
      getLbMembers({
        ...this.params,
        condition: 'ALIYUN',
        params
      }).then(data => {
        if (data.success) {
          this.mList = data.data.rows
          this.total = data.data.total
        }
      })
    },
    expert(name) {
      this.experts[name].flag = !this.experts[name].flag
      if (this.experts[name].flag) {
        this.experts[name].name = '隐藏高级选项'
      } else this.experts[name].name = '显示高级选项'
    },
    changeSticky() {
      if (this.createData.protocal.protocol === 'udp') {
        if (this.createData.protocal.stickySession) {
          this.$nextTick(() => {
            this.createData.protocal.scheduler = 'ch'
          })
        }
      }
    },
    next(index) {
      switch (index) {
        case 1:
          let name = 'protocal'
          if (this.active === 0) {
            name = 'protocal'
          } else if (this.active === 1) {
            name = 'server'
          } else if (this.active === 2) {
            name = 'healthy'
          }
          this.$refs[name].validate(valid => {
            if (valid) {
              if (this.active++ > 2) this.active = 2
              if (this.active === 1) {
                this.getLbPools()
                if (this.addData.name === 'edit') {
                  this.changePool()
                }
              }
            } else {
              return false
            }
          })
          break
        case 2:
          if (this.active-- < 0) this.active = 0
          break
      }
      this.$emit('next', this.active)
    },
    getPostData() {
      let data = false
      this.$refs.healthy.validate(valid => {
        if (valid) {
          this.createData.healthy.healthCheckHttpCodes = this.createData.healthy.healthCheckHttpCodes == null ? [] : this.createData.healthy.healthCheckHttpCodes
          const params = { ...this.createData.protocal, ...this.createData.server, ...this.createData.healthy }
          params.healthCheckHttpCode = this.createData.healthy.healthCheckHttpCodes.length !== 0 ? '(' + this.createData.healthy.healthCheckHttpCodes.join(',') + ')' : ''
          delete params.healthCheckHttpCodes
          data = params
        }
      })
      return data
      // "healthCheckHttpCode": "(http_2xx,http_3xx)" from "healthCheckHttpCodes"
    }
  }
}
</script>
