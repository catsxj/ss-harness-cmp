<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="IP" v-model="searchData.privateIps"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button
          type="ghost"
          icon="el-icon-refresh-left"
          @click="
            () => {
              searchData = {}
              handleSearch()
            }
          "
          >刷新</el-button
        >
        <el-button type="primary" @click="handleCreate()">
          <Icon type="icon-Added"></Icon>
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="installDetail" @goBack="goBack">
      <el-tabs value="ip">
        <el-tab-pane label="IP配置" name="ip">
          <ip :detail="installDetail" @back="getDetail(installDetail.id)"></ip>
        </el-tab-pane>
        <el-tab-pane label="有效安全规则" name="rule" v-if="installDetail.securityGroupId !== null && installDetail.serverId !== null">
          <rule :detail="installDetail" @back="getDetail(installDetail.id)"></rule>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
      <el-table-column label="名称" prop="name" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="azureResourceGroupName" label="资源组"></el-table-column>
      <el-table-column prop="regionId" label="区域" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.regionName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="子网名称" prop="subnetName" show-overflow-tooltip></el-table-column>
      <el-table-column label="IP" prop="primaryPrivateIPAddress" show-overflow-tooltip></el-table-column>
      <el-table-column prop="regionId" label="弹性IP" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.publicIPAddress || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定云主机" prop="serverName" show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="主要网卡" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.nicsPrimary | isTrue }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="所属平台" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.vendorName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <lock :data="scope.row" type="NetworkInterface" @back="getData">
            <el-button type="text" @click="handleOperate({ flag: 1, id: scope.row.id })"> 删除 </el-button>
            <div class="action-divider"></div>
            <el-dropdown @command="handleOperate">
              <span class="el-dropdown-link"> 更多操作<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{ flag: 2, row: scope.row }"> 更改子网 </el-dropdown-item>
                <el-dropdown-item v-if="!scope.row.securityGroupId" :command="{ flag: 3, row: scope.row }"> 附加安全组 </el-dropdown-item>
                <el-dropdown-item v-else :command="{ flag: 4, row: scope.row }"> 分离安全组 </el-dropdown-item>
                <el-dropdown-item v-if="!scope.row.serverId" :command="{ flag: 5, row: scope.row }"> 绑定云主机 </el-dropdown-item>
                <el-dropdown-item v-else :command="{ flag: 6, row: scope.row }"> 解绑云主机 </el-dropdown-item>
                <el-dropdown-item :command="{ flag: 7, row: scope.row }"> DNS服务器 </el-dropdown-item>
                <el-dropdown-item :command="{ flag: 8, row: scope.row }"> IP转发 </el-dropdown-item>
                <el-dropdown-item :command="{ flag: 9, row: scope.row }"> 分配标签 </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </lock>
        </template>
      </el-table-column>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog" @back="getData"></add>
    <modify :add-data="modifyData" v-if="modifyData.dialog" @back="getData"></modify>
    <add-subnet :add-data="subentData" v-if="subentData.dialog"></add-subnet>
    <attach :add-data="attachData" v-if="attachData.dialog" @back="getData"></attach>
    <add-group :add-data="groupData" v-if="groupData.dialog" @back="getData"></add-group>
    <server :add-data="serverData" v-if="serverData.dialog"></server>
    <dns :add-data="dnsData" v-if="dnsData.dialog" @back="getData"></dns>
    <forward :add-data="forwardData" v-if="forwardData.dialog" @back="getData"></forward>
    <tags :add-data="tagData" v-if="tagData.dialog" @back="getData"></tags>
  </el-card>
</template>

<script>
import { booleanFilter } from 'filters'
import { getNics, patchNics, removeNics, detailNics } from 'services/platform/azure'
import add from './add.vue'
import modify from './modify.vue'
import addGroup from './group'
import attach from './attach'
import addSubnet from './subnet'
import server from './server'
import dns from './dns'
import forward from './forward'
import tags from '@/components/tag/index.vue'
import webSocket from '@/common/mixins/getGlobalSocket'
import lock from '@/components/lock.vue'
import ip from './ipconfig/index'
import rule from './rule'
const detailSetting = {
  type: 'network',
  columns: [
    [
      { name: '名称', value: 'name' },
      { name: '资源组', value: 'azureResourceGroupName' },
      { name: 'IP', value: 'primaryPrivateIPAddress' }
    ],
    [
      { name: '安全组名称', value: 'securityGroupName' },
      { name: '云主机名称', value: 'serverName' },
      { name: '子网名称', value: 'subnetName' }
    ],
    [
      { name: 'VPC名称', value: 'vpcName' },
      { name: 'DNS服务器', value: 'dnsServer' },
      { name: '是否启用IP转发', value: 'ipForwarding', filter: booleanFilter }
    ],
    [{ name: '标签', value: 'tags' }]
  ]
}
export default {
  components: { add, addGroup, modify, attach, lock, ip, addSubnet, server, dns, rule, forward, tags },
  mixins: [webSocket],
  props: {
    platformObject: {
      type: Object
    }
  },
  data() {
    return {
      assessParams: {
        rows: 10,
        page: 1
      },
      assessTotal: 0,
      subscriptionData: [],
      resourceGroupData: [],
      serData: [],
      categoryData: [],
      params: {
        page: 1,
        rows: 10
      },
      detailSetting,
      searchData: {
        name: ''
      },
      tableData: [],
      total: 0,
      detailFlag: false,
      removeFlag: false,
      installDetail: {},
      // 新增数据
      title: '创建公共 IP 地址',
      addFlag: false,
      relevanceFlag: false,
      value2: 10,
      addData: {
        dialog: false,
        data: {}
      },
      relevanceData: {},
      removeData: {},
      resourceTypeData: [
        {
          value: '1',
          label: '负载均衡器'
        },
        {
          value: '2',
          label: '网络接口'
        }
      ],
      projectData: [],
      group: false,
      url: '/vpc/create',
      childrenData: [],
      childrenDataTotal: 0,
      paramd: {
        page: 1,
        rows: 10
      },
      groupData: {
        dialog: false,
        data: {}
      },
      resourceData: [],
      modifyData: {
        dialog: false,
        data: {}
      },
      attachData: {
        dialog: false,
        data: {}
      },
      subentData: {
        dialog: false,
        data: {}
      },
      serverData: {
        dialog: false,
        data: {}
      },
      dnsData: {
        dialog: false,
        data: {}
      },
      forwardData: {
        dialog: false,
        data: {}
      },
      tagData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) {
        this.getData()
      }
    },
    setTags(data) {
      const tags = []
      if (data.tags) {
        const tag = JSON.parse(data.tags)
        for (const i in tag) {
          tags.push({ key: i, value: tag[i] })
        }
      }
      this.tagData = {
        dialog: true,
        data: {
          resourceId: data.id,
          action: 'NICS',
          tags: tags
        }
      }
    },
    modify(data) {
      this.modifyData = {
        dialog: true,
        data: {
          id: data.id,
          name: data.name,
          remark: data.remark
        }
      }
    },
    getData() {
      getNics(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.formatSearchParam({
        lkParam: {
          name: this.searchData.name,
          publicIpAddress: this.searchData.privateIps
        },
        eqParam: {}
      })
      this.getData()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getData()
    },
    getDetail(id) {
      detailNics(id).then(data => {
        if (data.success) {
          this.detailFlag = true
          this.installDetail = data.data
          this.installDetail.dnsServer = this.installDetail.dnsServer ? JSON.parse(this.installDetail.dnsServer).join(',') : ''
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    handleCreate(id) {
      this.addData = {
        dialog: true,
        data: {
          vendorId: ''
        }
      }
    },
    // 移动
    handleRemove(row) {
      this.removeFlag = true
      this.removeData.name = row.name
    },
    // 操作
    handleOperate(command) {
      switch (command.flag / 1) {
        case 1:
          // 删除
          this.$confirm('该操作为不可逆操作，确定后将永久删除该网络接口，是否继续！', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            removeNics(command.id).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.handleSearch(command.id)
              }
            })
          })
          break
        case 2: {
          this.subentData = {
            dialog: true,
            vpcName: command.row.vpcName,
            data: {
              id: command.row.id,
              vpcId: command.row.vpcId,
              vendorId: command.row.vendorId
            }
          }
          break
        }
        case 3:
          this.groupData = {
            dialog: true,
            title: '附加安全组',
            action: 'attachGroup',
            data: {
              vendorId: command.row.vendorId,
              regionId: command.row.regionId,
              id: command.row.id
            }
          }
          break
        case 4:
          this.$confirm('确定分离安全组吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            patchNics('detachGroup', { id: command.row.id, groupId: command.row.securityGroupId }).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.handleSearch()
              }
            })
          })
          break
        case 5:
          this.serverData = {
            dialog: true,
            title: '绑定云主机',
            action: 'attach',
            data: {
              vendorId: command.row.vendorId,
              regionId: command.row.regionId,
              id: command.row.id
            }
          }
          break
        case 6:
          this.$confirm('确定解绑云主机吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            patchNics('detach', { id: command.row.id, groupId: command.row.securityGroupId }).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.handleSearch()
              }
            })
          })
          break
        case 7:
          detailNics(command.row.id).then(data => {
            if (data.success) {
              const detailData = data.data
              this.dnsData = {
                dialog: true,
                data: {
                  id: detailData.id,
                  dnsServer: [],
                  newDnsServer: ''
                }
              }
              const dnsServer = detailData.dnsServer ? JSON.parse(detailData.dnsServer) : []
              if (dnsServer.length > 0) {
                dnsServer.forEach(item => {
                  const data = {
                    dns: item,
                    loading: false
                  }
                  this.dnsData.data.dnsServer.push(data)
                })
              }
            }
          })
          break
        case 8:
          this.forwardData = {
            dialog: true,
            data: {
              id: command.row.id,
              ipForwarding: command.row.ipForwarding
            }
          }
          break
        case 9:
          this.setTags(command.row)
          break
      }
    }
  },
  created() {
    this.handleSearch()
  },
  mounted() {},
  watch: {
    platformObject: {
      handler(newVal, oldVal) {
        this.handleSearch()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.no-searchBox {
  padding: 10px;
}

.diskDeviceItem {
  width: calc(100% - 80px);
}

.diskDeviceTitle {
  width: 50px;
  text-align: right;
  display: inline-block;
  vertical-align: middle;
}
</style>
