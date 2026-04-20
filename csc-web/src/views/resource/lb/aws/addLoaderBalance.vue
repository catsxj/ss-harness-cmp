<template>
  <div class="load_balance_container">
    <el-card style="height: 100%">
      <basic-form label-width="140px" :model="balancer" ref="balancerRef">
        <el-row>
          <el-col :span="12">
            <basic-form-item label="所属地域：" prop="region" validate="required" require-message="请选择地域">
              <el-select @change="handleSearch" v-model="regionId">
                <el-option v-for="(item, index) in regionList" :key="index" :label="item.name" :value="item.regionId"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item validate="required" label="负载均衡器类型：">
              <el-radio-group v-model="balancer.loadBalancerType" @change="selectType">
                <el-radio label="application">应用程序负载均衡器</el-radio>
                <el-radio label="network">网络负载均衡器</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="名称：" prop="name" validate="required,awsName" require-message="仅允许a-z、A-Z、0-9和连字符">
              <el-input v-model="balancer.name" placeholder="仅允许a-z、A-Z、0-9和连字符"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item validate="required" label="模式：">
              <el-radio-group v-model="balancer.scheme" @change="changeClassification">
                <el-radio label="internet-facing">面向Internet</el-radio>
                <el-radio label="internal">内部</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="IP地址类型：" validate="required" require-message="请选择IP地址类型">
              <el-select v-model="balancer.ipAddressType" @change="changeIpAddressType" v-if="balancer.scheme === 'internet-facing'" placeholder="请选择IP地址类型">
                <el-option value="ipv4" label="ipv4"></el-option>
                <el-option value="dualstack" label="dualstack"></el-option>
              </el-select>
              <el-select v-model="balancer.ipAddressType" v-if="balancer.scheme === 'internal'" disabled>
                <el-option value="ipv4" label="ipv4" disabled></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px">
          <el-col :span="24">
            <basic-form-item label="侦听器：  " validate="required">
              <basic-table :data="dataList2" v-if="balancer.loadBalancerType === 'application'">
                <el-table-column label="负载均衡器协议" prop="protocol">
                  <template slot-scope="scope">
                    <el-select style="width: 50%" v-model="scope.row.protocol" @change="changeData1(scope.row.protocol, scope.$index)">
                      <el-option value="HTTP" label="HTTP"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="负载均衡器端口" prop="port">
                  <template slot-scope="scope">
                    <el-input style="width: 50%" v-model="scope.row.port"></el-input>
                  </template>
                </el-table-column>
                <el-table-column width="200" label="操作">
                  <template slot-scope="scope">
                    <el-button type="text" @click.native.prevent="deleteRow(scope.$index, dataList2)"><i class="el-icon-delete"></i> 删除 </el-button>
                  </template>
                </el-table-column>
                <div slot="pagination"></div>
              </basic-table>
              <basic-table :data="dataList" v-if="balancer.loadBalancerType === 'network'">
                <el-table-column label="负载均衡器协议" prop="protocol">
                  <template slot-scope="scope">
                    <el-select style="width: 50%" v-model="scope.row.protocol" @change="changeData2(scope.row.protocol, scope.$index)">
                      <el-option value="TCP" label="TCP"></el-option>
                      <el-option value="TCP_UDP" label="TCP_UDP"></el-option>
                      <el-option value="UDP" label="UDP"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="负载均衡器端口" prop="port">
                  <template slot-scope="scope">
                    <el-input style="width: 50%" v-model="scope.row.port"></el-input>
                  </template>
                </el-table-column>
                <el-table-column width="200" label="操作">
                  <template slot-scope="scope">
                    <el-button type="text" @click.native.prevent="deleteRow(scope.$index, dataList)"><i class="el-icon-delete"></i> 删除 </el-button>
                  </template>
                </el-table-column>
                <div slot="pagination"></div>
              </basic-table>
              <el-button style="margin-top: 10px" type="primary" @click="addRow">添加侦听器</el-button>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="VPC：" validate="required">
              <el-select @change="handleSubNets" v-model="vpcModel" value-key="vpcId" clearable>
                <el-option v-for="(item, index) in vpcList" :key="index" :label="item.vpcValue" :value="item"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col :span="24">
            <basic-form-item label="可用区：" validate="required">
              <el-row v-if="showNorth1a">
                <el-col :span="3">
                  <el-checkbox v-model="northA_checked">cn-north-1a</el-checkbox>
                </el-col>
                <el-col :span="21">
                  <el-row>
                    <el-select v-model="subNetValueA" style="width: 50%" @change="changePrivateAddressA" value-key="id" :disabled="!northA_checked">
                      <el-option v-for="(item, index) in cnNorth1AList" :key="index" :label="item.subNetValueA" :value="item"> </el-option>
                    </el-select>
                  </el-row>
                </el-col>
                <el-col :span="24">
                  <el-row v-if="northA_checked" style="margin-top: 20px">
                    <el-col :span="2">IPv4地址</el-col>
                    <el-col :span="1">
                      <el-tooltip class="item" effect="dark" content="Virtual Private Cloud (VPC) 是 AWS 云内您自己的逻辑隔离区域中的虚拟网络。请选择您为目标实例选择的同一 VPC。" placement="top">
                        <i class="el-icon-info"></i>
                      </el-tooltip>
                    </el-col>
                    <el-col :span="8" v-if="balancer.scheme === 'internet-facing' && balancer.loadBalancerType === 'network'">
                      <el-select v-model="Ipv4_addressA" @change="hanldeElastic">
                        <el-option label="由AWS分配" value="AWS"></el-option>
                        <el-option label="选择弹性IP" value="IP"></el-option>
                      </el-select>
                      <el-select v-model="Ipv4_Elastic_Val_A" v-if="Ipv4_addressA == 'IP'" style="margin-top: 10px">
                        <el-option v-for="(item, index) in elasticList" :key="index" :label="item.publicIp + '(' + item.elasticIpUuid + ')'" :value="item.id"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="8" v-if="balancer.scheme === 'internet-facing' && balancer.loadBalancerType === 'application'">
                      <el-row>
                        <span>由AWS分配</span>
                      </el-row>
                    </el-col>
                    <el-col :span="8" v-if="balancer.scheme === 'internal' && balancer.loadBalancerType === 'network'">
                      <el-row>
                        <span>从CIDR分配{{ cidr }}</span>
                      </el-row>
                    </el-col>
                    <el-col v-if="balancer.scheme === 'internal' && balancer.loadBalancerType === 'application'" :span="21"> 从CIDR分配{{ cidr }} </el-col>
                    <el-col v-if="showIpv6 && balancer.loadBalancerType === 'application' && balancer.scheme === 'internet-facing' && balancer.ipAddressType == 'dualstack'">
                      <el-col :span="2">IPv6地址</el-col>
                      <el-col :span="1" style="margin-left: -40px">
                        <el-tooltip class="item" effect="dark" content="节点的 IPv6 地址从子网 CIDR 分配。" placement="top">
                          <i class="el-icon-info"></i>
                        </el-tooltip>
                      </el-col>
                      <el-col v-if="ipv6_cidr && balancer.loadBalancerType === 'application'" :span="8">{{ ipv6_cidr }}</el-col>
                      <el-col v-else :span="8">无</el-col>
                    </el-col>
                    <el-col v-if="showIpv6 && balancer.loadBalancerType === 'network' && balancer.scheme === 'internet-facing' && balancer.ipAddressType == 'dualstack'">
                      <el-col :span="2">IPv6地址</el-col>
                      <el-col :span="1" style="margin-left: -40px">
                        <el-tooltip class="item" effect="dark" content="节点的 IPv6 地址从子网 CIDR 分配。" placement="top">
                          <i class="el-icon-info"></i>
                        </el-tooltip>
                      </el-col>
                      <el-col v-if="ipv6_cidr" :span="8">
                        <el-select v-model="north1A_CIDR_value" @change="handlePrivateSelect">
                          <el-option :label="'从CIDR分配' + ipv6_cidr" value="assign"></el-option>
                          <el-option :label="'从CIDR输入 IP' + ipv6_cidr" value="input"></el-option>
                        </el-select>
                        <basic-form-item v-if="balancer.ipAddressType == 'dualstack' && north1A_CIDR_value == 'input'" maxlength="64">
                          <el-input v-model="private_Ipv6_input_A" placeholder="IPv6地址"></el-input>
                        </basic-form-item>
                      </el-col>
                      <el-col v-if="ipv6_cidr && balancer.loadBalancerType === 'application'" :span="8">{{ ipv6_cidr }}</el-col>
                      <el-col v-if="!ipv6_cidr" :span="8">无</el-col>
                    </el-col>
                  </el-row>
                  <el-row v-if="classificationStatus && northA_checked && balancer.loadBalancerType === 'network'" style="margin: 10px 0 0 -28px">
                    <el-col :span="3">私有IPv4地址</el-col>
                    <el-col :span="8" style="margin-left: -40px">
                      <el-select v-model="north1A_CIDR_value" @change="handlePrivateSelect">
                        <el-option :label="'从CIDR分配' + cidr" value="assign"></el-option>
                        <el-option :label="'从CIDR输入' + cidr" value="input"></el-option>
                      </el-select>
                      <basic-form-item v-if="balancer.ipAddressType == 'ipv4' && north1A_CIDR_value == 'input'" maxlength="64">
                        <el-input v-model="private_Ipv4_input_A" placeholder="私有IPv4地址"></el-input>
                      </basic-form-item>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <el-row v-if="showNorth1B" :style="showNorth1a ? 'margin-top: 20px;' : ''">
                <el-col :span="3">
                  <el-checkbox v-model="northB_checked">cn-north-1b</el-checkbox>
                </el-col>
                <el-col :span="21">
                  <el-row>
                    <el-select v-model="subNetValueB" style="width: 50%" @change="changePrivateAddressB" value-key="id" :disabled="!northB_checked">
                      <el-option v-for="(item, index) in cnNorth1BList" :key="index" :label="item.subNetValueB" :value="item"></el-option>
                    </el-select>
                  </el-row>
                </el-col>
                <el-col :span="24">
                  <el-row v-if="northB_checked" style="margin-top: 20px">
                    <el-col :span="2">IPv4地址</el-col>
                    <el-col :span="1">
                      <el-tooltip class="item" effect="dark" content="对于面向 Internet 的负载均衡器，节点的 IPv4 地址由 AWS 分配，您也可以选择您的其中一个弹性 IP 地址。对于内部负载均衡器，IPv4 地址从子网 CIDR 分配。" placement="top">
                        <i class="el-icon-info"></i>
                      </el-tooltip>
                    </el-col>
                    <el-col :span="8" v-if="balancer.scheme === 'internet-facing' && balancer.loadBalancerType === 'network'">
                      <el-select v-model="Ipv4_addressB" @change="hanldeElastic">
                        <el-option label="由AWS分配" value="AWS"></el-option>
                        <el-option label="选择弹性IP" value="IP"></el-option>
                      </el-select>
                      <el-select v-model="Ipv4_Elastic_Val_B" v-if="Ipv4_addressB == 'IP'" style="margin-top: 10px">
                        <el-option v-for="(item, index) in elasticList" :key="index" :label="item.publicIp + '(' + item.elasticIpUuid + ')'" :value="item.id"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="8" v-if="balancer.scheme === 'internet-facing' && balancer.loadBalancerType === 'application'">
                      <el-row>
                        <span>由AWS分配</span>
                      </el-row>
                    </el-col>
                    <el-col :span="8" v-if="balancer.scheme === 'internal' && balancer.loadBalancerType === 'network'">
                      <el-row>
                        <span>从CIDR分配{{ cidrB }}</span>
                      </el-row>
                    </el-col>
                    <el-col v-if="balancer.scheme === 'internal' && balancer.loadBalancerType === 'application'" :span="21"> 从CIDR分配{{ cidrB }} </el-col>
                    <el-col v-if="showIpv6 && balancer.scheme === 'internet-facing' && balancer.ipAddressType == 'dualstack'">
                      <el-col :span="2">IPv6地址</el-col>
                      <el-col :span="1" style="margin-left: -40px">
                        <el-tooltip class="item" effect="dark" content="节点的 IPv6 地址从子网 CIDR 分配。" placement="top">
                          <i class="el-icon-info"></i>
                        </el-tooltip>
                      </el-col>
                      <el-col v-if="ipv6_cidrB && balancer.loadBalancerType === 'network'" :span="8">
                        <el-select v-model="north1B_CIDR_value">
                          <el-option :label="'从CIDR分配' + ipv6_cidrB" value="assign"></el-option>
                          <el-option :label="'从CIDR输入 IP' + ipv6_cidrB" value="input"></el-option>
                        </el-select>
                        <basic-form-item v-if="balancer.ipAddressType == 'dualstack' && north1B_CIDR_value == 'input'" @change="handlePrivateSelect" maxlength="64">
                          <el-input v-model="private_Ipv6_input_B" placeholder="IPv6地址"></el-input>
                        </basic-form-item>
                      </el-col>
                      <el-col v-if="ipv6_cidrB && balancer.loadBalancerType === 'application'" :span="8">{{ ipv6_cidrB }}</el-col>
                      <el-col v-if="!ipv6_cidrB" :span="8">无</el-col>
                    </el-col>
                  </el-row>
                  <el-row v-if="classificationStatus && northB_checked && balancer.loadBalancerType === 'network'" style="margin: 10px 0 0 -28px">
                    <el-col :span="3">私有IPv4地址</el-col>
                    <el-col :span="8" style="margin-left: -40px">
                      <el-select v-model="north1B_CIDR_value" @change="handlePrivateSelect">
                        <el-option :label="'从CIDR分配' + cidrB" value="assign"></el-option>
                        <el-option :label="'从CIDR输入' + cidrB" value="input"></el-option>
                      </el-select>
                      <basic-form-item v-if="balancer.ipAddressType == 'ipv4' && north1B_CIDR_value == 'input'" maxlength="64">
                        <el-input v-model="private_Ipv4_input_B" placeholder="私有IPv4地址"></el-input>
                      </basic-form-item>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </basic-form-item>
          </el-col>
        </el-row>

        <el-row class="top_margin_border">
          <!-- <el-form :inline="true" v-if="balancer.loadBalancerType === 'application'">
          <el-form-item label="筛选条件：">
            <el-select v-model="safeOptions" @change="changeSafeGroup">
              <el-option label="VPC 安全组" value="vpc"></el-option>
              <el-option label="EC2 安全组" value="ec2"></el-option>
            </el-select>
          </el-form-item>
        </el-form> -->
        </el-row>
        <basic-form-item label-width="140px" label="安全组：  " validate="required" v-if="balancer.loadBalancerType === 'application'">
          <basic-table :data="safeTableData" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="groupUuid" label="安全组ID"></el-table-column>
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column prop="remark" label="描述"></el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </basic-form-item>
      </basic-form>
      <el-row style="margin-left: 40px">
        <el-col :span="8">
          <basic-form>
            <basic-form-item label="目标组：" validate="required">
              <el-select v-model="tempStore" placeholder="请选择目标组名称">
                <el-option v-for="(item, index) in tableData" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </basic-form>
        </el-col>
      </el-row>
      <el-row style="text-align: center">
        <el-button @click="$router.go(-1)">取消</el-button>
        <el-button type="primary" @click="createLoadBalance">创建</el-button>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { getRegion, getTargetgroups, getTargets, getVpcData, getSubNetsList, getSafeTableData, createData, getElasticIp } from 'services/platform/aws'
export default {
  name: 'addLoaderBalance',
  data() {
    return {
      detailTableData: [],
      tableData: [],
      params: {
        page: 1,
        rows: 9999
      },
      paramd: {
        page: 1,
        rows: 9999
      },
      // 刘万伟
      publicParams: {
        page: 1,
        rows: 9999
      },
      // 安全组表格名称
      safeTableParams: {
        page: 1,
        rows: 10
      },
      securityGroups: [],
      nameList: [],
      balancer: {
        vendorId: parseInt(this.$router.currentRoute.params.id),
        region: 'cn-north-1',
        name: '',
        loadBalancerType: 'network',
        scheme: 'internet-facing',
        ipAddressType: 'ipv4',
        availabilityZones: []
      },
      private_Ipv4_input_A: '',
      private_Ipv4_input_B: '',
      private_Ipv6_input_A: '',
      private_Ipv6_input_B: '',
      regionId: 'cn-north-1',
      tempStore: '',
      listeners: [],
      CheckPort: '',
      runStatePath: '/',
      runStateProtocol: 'HTTP',
      aimClassification: 'instance',
      aimGroupName: '',
      protocolVersion: 'HTTP1',
      aimPort: 80,
      aimProtocol: 'HTTP',
      protocol: '',
      classificationSelection: '',
      safeOptions: '',
      regionList: '',
      north1A_CIDR_value: 'assign',
      north1B_CIDR_value: 'assign',
      vendorId: parseInt(this.$router.currentRoute.params.id),
      vpcList: [],
      vpcValue: '',
      vpcId: '',
      assignSafeRadio: 3, // 分配安全组单选
      input: '',
      classification: '',
      classificationStatus: false,
      dataList: [{ protocol: 'TCP', port: 80 }],
      dataList2: [{ protocol: 'HTTP', port: 80 }],
      northA_checked: false, // 控制cn-north-1a的选择框
      northB_checked: false, // 控制cn-north-1b的选择框
      showNorth1a: true,
      showNorth1B: true, // 是否显示cn-north-1b
      cnNorth1AList: [],
      cnNorth1BList: [],
      subNetValueA: '',
      subNetValueB: '',
      Ipv4_addressA: 'AWS',
      Ipv4_addressB: 'AWS',
      elasticList: [],
      Ipv4_Elastic_Val_A: '',
      Ipv4_Elastic_Val_B: '',
      zone: '',
      north1A_CIDR: '',
      north1B_CIDR: '',
      subNetList: [],
      cidr: '',
      cidrB: '',
      showIpv6: false,
      ipv6_cidr: '',
      ipv6_cidrB: '',
      safeTableData: [], // 安全组表格
      vpcModel: ''
    }
  },
  methods: {
    selectType() {
      if (this.balancer.loadBalancerType === 'application') {
        this.listeners = this.dataList
      }
      if (this.balancer.loadBalancerType === 'network') {
        this.listeners = this.dataList
      }
      this.getData()
    },
    handleDetailSearch() {
      const params = [{ param: { tgId: this.tempStore[0] }, sign: 'EQ' }]
      this.paramd.params = JSON.stringify(params)
      this.getDetailData()
    },
    getDetailData() {
      getTargets(this.paramd).then(data => {
        if (data.success) {
          this.detailTableData = data.data.rows
          this.totald = data.data.total
        }
      })
    },
    handleSearch() {
      this.getData()
      this.getVpcList()
      this.hanldeElastic()
      this.$refs.balancerRef.resetFields()
      this.params.params = this.$tools.handleSearchParam({
        vendorId: parseInt(this.$router.currentRoute.params.id),
        regionId: this.regionId
      })
    },
    getData() {
      const targetGroupsParams = JSON.parse(JSON.stringify(this.publicParams))
      if (this.balancer.loadBalancerType === 'application') {
        targetGroupsParams.params = JSON.stringify([
          {
            param: {
              vendorId: this.vendorId,
              loadBalancerUuids: '[]',
              vpcUuid: this.vpcId,
              regionId: this.regionId
            },
            sign: 'EQ'
          },
          {
            param: {
              protocol: '"HTTP"'
            },
            sign: 'IN'
          }
        ])
      } else {
        const protocolData = JSON.parse(JSON.stringify(this.dataList))
        const isTCP = protocolData.every(item => {
          return item.protocol == 'TCP'
        })
        const isUDP = protocolData.every(item => {
          return item.protocol == 'UDP'
        })
        for (let i = 0; i < protocolData.length; i++) {
          if (isTCP) {
            this.protocol = '"TCP"'
          } else {
            this.protocol = '"TCP_UDP"'
          }
          if (isUDP) {
            this.protocol = '"UDP"'
          }
        }
        targetGroupsParams.params = JSON.stringify([
          {
            param: {
              vendorId: this.vendorId,
              loadBalancerUuids: '[]',
              vpcUuid: this.vpcId,
              regionId: this.regionId
            },
            sign: 'EQ'
          },
          {
            param: {
              protocol: this.protocol
            },
            sign: 'IN'
          }
        ])
      }
      getTargetgroups(targetGroupsParams).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          if (this.tableData.length) {
            this.tempStore = this.tableData[0].id
          } else {
            this.tempStore = ''
          }
          this.total = data.data.total
        }
      })
    },
    // 获取区域
    getRegion() {
      getRegion({
        vendorId: this.vendorId
      }).then(data => {
        if (data.success) {
          this.regionList = data.data
        }
      })
    },
    changeData1(name, index) {
      switch (name) {
        case 'HTTP':
          this.dataList2[index].port = 80
          break
        // case 'HTTPS':
        //   this.dataList2[index].port = 443
        //   break
      }
    },
    changeData2(name, index) {
      switch (name) {
        case 'TCP':
          this.dataList[index].port = 80
          break
        case 'TCP_UDP':
          this.dataList[index].port = 53
          break
        case 'UDP':
          this.dataList[index].port = 53
      }
      this.getData()
    },
    deleteRow(index, rows) {
      rows.splice(index, 1)
      this.getData()
    },
    addRow() {
      if (this.balancer.loadBalancerType === 'network') {
        this.dataList.push({ protocol: '选择协议', port: '' })
      }
      if (this.balancer.loadBalancerType === 'application') {
        this.dataList2.push({ protocol: 'HTTP', port: 80 })
      }
    },
    changeClassification() {
      if (this.balancer.scheme === 'internal') {
        this.balancer.ipAddressType = 'ipv4'
        this.classificationStatus = true
      } else {
        this.balancer.ipAddressType = 'ipv4'
        this.classificationStatus = false
      }
    },
    goBack() {
      sessionStorage.setItem('platformId', this.serverId)
      this.$router.back(-1)
    },
    getVpcList() {
      const params = JSON.stringify([{ param: { regionId: this.regionId, vendorId: this.vendorId }, sign: 'EQ' }])
      const vpcParams = JSON.parse(JSON.stringify(this.publicParams))
      vpcParams.params = params
      getVpcData(vpcParams).then(data => {
        this.vpcList = data.data.rows
        this.vpcList.forEach((item, index) => {
          item.vpcValue = `${item.vpcId} (${item.cidr}) | ${item.name}`
        })
        this.vpcModel = this.vpcList[0]
        if (this.vpcList.length > 0) {
          this.handleSubNets()
          this.getSafeTableList()
          this.getData()
        }
      })
    },
    handleSubNets() {
      this.vpcId = this.vpcModel.vpcId
      this.Ipv4_addressA = 'AWS'
      this.Ipv4_addressB = 'AWS'
      this.getData()
      this.northA_checked = this.northB_checked = false
      const params = JSON.stringify([{ param: { networkId: this.vpcModel.id, vendorId: this.vendorId }, sign: 'EQ' }])
      const subNetsParams = JSON.parse(JSON.stringify(this.publicParams))
      subNetsParams.params = params
      getSubNetsList(subNetsParams).then(data => {
        this.subNetList = data.data.rows
        if (this.regionId == 'cn-north-1') {
          this.cnNorth1AList = this.subNetList.filter(item => item.zone == 'cn-north-1a')
        } else {
          this.cnNorth1AList = this.subNetList.filter(item => item.zone == 'cn-northwest-1a')
        }
        if (this.cnNorth1AList.length) {
          this.balancer.availabilityZones[0] = { sId: this.cnNorth1AList[0].id }
          this.cidr = this.cnNorth1AList[0].cidr
          this.ipv6_cidr = this.cnNorth1AList[0].ipv6Cidr
          this.showNorth1a = true
        } else {
          this.showNorth1a = false
        }
        this.cnNorth1BList = this.subNetList.filter(item1 => item1.zone == 'cn-north-1b')
        if (this.cnNorth1BList.length) {
          this.ipv6_cidrB = this.cnNorth1BList[0].ipv6Cidr
          this.cidrB = this.cnNorth1BList[0].cidr
          this.showNorth1B = true
        } else {
          this.showNorth1B = false
        }
        this.subNetList.forEach((item, index) => {
          this.zone = item.zone
          if ((item.zone == 'cn-north-1a' || item.zone == 'cn-northwest-1a') && (this.balancer.scheme === 'internet-facing' || this.balancer.scheme === 'internal')) {
            item.subNetValueA = `${item.subnetUuid} (${item.name})`
            this.subNetValueA = this.cnNorth1AList[0]
          } else {
            item.subNetValueB = `${item.subnetUuid} (${item.name})`
            this.subNetValueB = this.cnNorth1BList[0]
          }
        })
      })
    },
    // cn-north-1a下拉框触发事件
    changePrivateAddressA(e) {
      this.balancer.availabilityZones[0] = { sId: e.id }
      this.ipv6_cidr = e.ipv6Cidr
      this.cidr = e.cidr
    },
    // cn-north-1b下拉框触发事件
    changePrivateAddressB(e) {
      this.balancer.availabilityZones[1] = { sId: e.id }
      this.ipv6_cidrB = e.ipv6Cidr
      this.cidrB = e.cidr
    },
    changeIpAddressType(e) {
      if (e === 'ipv4') {
        this.showIpv6 = false
      } else {
        this.showIpv6 = true
      }
    },
    getSafeTableList() {
      this.safeTableParams.params = JSON.stringify([{ param: { vpcId: this.vpcModel.id, vendorId: parseInt(this.$router.currentRoute.params.id) }, sign: 'EQ' }])
      getSafeTableData(this.safeTableParams).then(data => {
        this.safeTableData = data.data.rows
      })
    },
    handleSelectionChange(row) {
      this.securityGroups = row
    },
    // 选择弹性ip时获取
    hanldeElastic() {
      if (this.Ipv4_addressA == 'IP' || this.Ipv4_addressB == 'IP') {
        const params = JSON.stringify([
          { param: { regionId: this.regionId, vendorId: this.vendorId }, sign: 'EQ' },
          {
            param: {
              associationId: ''
            },
            sign: 'NUL'
          }
        ])
        const subNetsParams = JSON.parse(JSON.stringify(this.publicParams))
        subNetsParams.params = params
        getElasticIp(subNetsParams).then(data => {
          this.elasticList = data.data.rows
          if (this.elasticList.length && this.Ipv4_addressA == 'IP') {
            this.Ipv4_Elastic_Val_A = this.elasticList[0].id
          }
          if (this.elasticList.length && this.Ipv4_addressB == 'IP') {
            this.Ipv4_Elastic_Val_B = this.elasticList[0].id
          }
        })
      } else {
        this.elasticList = []
      }
    },
    // 创建按钮
    createLoadBalance() {
      this.balancer.region = this.regionId
      this.$refs.balancerRef.validate(valid => {
        if (valid) {
          if (this.dataList.length) {
            for (let i = 0; i < this.dataList.length; i++) {
              if (this.dataList[i].protocol == '选择协议' || this.dataList[i].port == '') {
                return this.$message.error('请填写侦听器相关信息')
              }
            }
          } else {
            return this.$message.error('至少添加一个侦听器')
          }
          if (this.balancer.availabilityZones.length <= 1 || this.northA_checked == false || this.northB_checked == false) {
            return this.$message.error('当前vpc不可用,必须指定至少两个子网')
          }
          if (this.Ipv4_addressA == 'IP' && this.Ipv4_addressB == 'IP' && this.Ipv4_Elastic_Val_A == this.Ipv4_Elastic_Val_B) return this.$message.error('弹性IP地址不可相同')
          if (this.balancer.loadBalancerType === 'network') {
            this.balancer.availabilityZones[0].loadBalancerAddresses = []
            this.balancer.availabilityZones[1].loadBalancerAddresses = []
            if (this.balancer.scheme === 'internet-facing' || (this.balancer.scheme === 'internal' && this.north1A_CIDR_value != 'input' && this.north1B_CIDR_value != 'input')) {
              this.balancer.availabilityZones[0].loadBalancerAddresses[0] = { eipId: this.Ipv4_Elastic_Val_A }
              this.balancer.availabilityZones[1].loadBalancerAddresses[0] = { eipId: this.Ipv4_Elastic_Val_B }
            }
            if (this.north1A_CIDR_value == 'input' && this.north1B_CIDR_value == 'input') {
              this.balancer.availabilityZones[0].loadBalancerAddresses[0] = { privateIPv4Address: this.private_Ipv4_input_A }
              this.balancer.availabilityZones[1].loadBalancerAddresses[0] = { privateIPv4Address: this.private_Ipv4_input_B }
              if (this.private_Ipv4_input_A && this.private_Ipv4_input_B && this.private_Ipv4_input_A == this.private_Ipv4_input_B) {
                return this.$message.error('输入的私有IPv4地址不能相同')
              }
            }
            if ((this.north1A_CIDR_value == 'input' && this.north1B_CIDR_value != 'input') || (this.north1A_CIDR_value != 'input' && this.north1B_CIDR_value == 'input')) {
              return this.$message.error('输入的私有Ipv4或Ipv6地址需同时存在')
            }
            if (this.balancer.ipAddressType == 'dualstack') {
              if (this.ipv6_cidr == null) {
                return this.$message.error('所选的子网必须具有IP地址类型所需的CIDR块')
              }
              if (this.north1A_CIDR_value == 'input' && this.north1B_CIDR_value == 'input') {
                this.balancer.availabilityZones[0].loadBalancerAddresses[0] = { iPv6Address: this.private_Ipv6_input_A }
                this.balancer.availabilityZones[1].loadBalancerAddresses[0] = { iPv6Address: this.private_Ipv6_input_B }
              }
            }
            this.dataList.forEach((item, index) => {
              if (index + 1 < this.dataList.length) {
                if (item.port == this.dataList[index + 1].port) return this.$message.error('端口号不能相同')
              }
            })

            const createdParams = {
              balancer: this.balancer,
              listeners: this.dataList,
              targetGroup: { id: this.tempStore }
            }
            createData(createdParams).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.$router.go(-1)
              }
            })
          } else {
            const safeGroup = []
            this.securityGroups.forEach(item => {
              safeGroup.push({ id: item.id })
            })
            if (safeGroup.length == 0) {
              return this.$message.error('至少选择一个安全组')
            }
            const newBalancer = JSON.parse(JSON.stringify(this.balancer))
            newBalancer.securityGroups = safeGroup
            const createdParams = {
              balancer: newBalancer,
              listeners: this.dataList2,
              targetGroup: { id: this.tempStore }
            }
            createData(createdParams).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.$router.go(-1)
              }
            })
          }
        }
      })
    }
  },
  mounted() {
    this.getRegion()
    this.handleSearch()
    this.selectType()
    this.getVpcList()
    this.getSafeTableList()
    if (this.balancer.ipAddressType == 'ipv4') {
      this.showIpv6 = false
    }
  },
  watch: {
    northB_checked(newVal, oldVal) {
      if (this.cnNorth1BList.length && newVal) {
        this.balancer.availabilityZones[1] = { sId: this.cnNorth1BList[0].id }
      } else {
        this.balancer.availabilityZones.pop()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.top_margin_border {
  padding: 20px 0 0 58px;
  border-top: 1px solid #ebeef5;
}
</style>
