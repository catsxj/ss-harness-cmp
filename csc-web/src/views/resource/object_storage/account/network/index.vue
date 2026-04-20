<template>
  <div>
    <el-card class="wrapper">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="add()"> 设置网络 </el-button>
        </el-form-item>
      </el-form>
      <SmartTable :data="tableData" :rows="10" v-if="detail.isAccessAllNetworks">
        <el-table-column label="虚拟网络" show-overflow-tooltip prop="subnetName"></el-table-column>
        <el-table-column label="子网" show-overflow-tooltip prop="subnetName"></el-table-column>
      </SmartTable>
      <SmartTable :data="detail.subnets" :rows="10" v-else>
        <el-table-column label="子网" show-overflow-tooltip prop="name"></el-table-column>
        <el-table-column label="地址范围" show-overflow-tooltip prop="cidr"></el-table-column>
        <el-table-column label="操作" width="160px" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="remove(scope.row)"> <i class="el-icon-delete"></i> 移除 </el-button>
          </template>
        </el-table-column>
      </SmartTable>
      <div v-if="!detail.isAccessAllNetworks">
        <el-form :inline="true">
          <el-form-item>
            <el-button type="primary" @click="addFirewall()"> 附加防护墙IP </el-button>
          </el-form-item>
        </el-form>
        <SmartTable :data="detail.firewalls" :rows="10" v-if="detail.firewalls.length > 0">
          <el-table-column label="类型" show-overflow-tooltip prop="ipType">
            <template slot-scope="scope">
              <span>{{ ipTypeFilter[scope.row.ipType] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="IP地址/地址范围" show-overflow-tooltip prop="ipAddresses"></el-table-column>
          <el-table-column label="操作" width="160px" align="center">
            <template slot-scope="scope">
              <el-button type="text" @click="removeFirewall(scope.row)"> <i class="el-icon-delete"></i> 移除 </el-button>
            </template>
          </el-table-column>
        </SmartTable>
      </div>
    </el-card>
    <add :add-data="addData" v-if="addData.dialog" @back="$emit('back')"></add>
    <firewall :add-data="firewallData" v-if="firewallData.dialog" @back="$emit('back')"></firewall>
  </div>
</template>

<script>
import add from './add.vue'
import firewall from './firewall'
import webSocket from '@/common/mixins/webSocket'
import { detailAccount, removeAccountNetwork, removeAccountFirewallIp } from 'services/platform/azure'
export default {
  components: { add, firewall },
  mixins: [webSocket],
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      ipTypeFilter: {
        IP: 'IP地址',
        IPRANGE: '地址范围'
      },
      tableData: [
        {
          subnetName: '全部网络'
        }
      ],
      addData: {
        dialog: false,
        data: {}
      },
      firewallData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) this.$emit('back')
    },
    // getData () {
    //   detailAccount(this.detail.id).then(data => {
    //     if (data.success) {
    //       this.detail = data.data
    //     }
    //   })
    // },
    remove(data) {
      this.$confirm('此操作将移除该子网?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeAccountNetwork({
          id: this.detail.id,
          subnetId: data.id
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.$emit('back')
          }
        })
      })
    },
    removeFirewall(data) {
      this.$confirm('此操作将移除该防火墙IP?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeAccountFirewallIp({
          id: data.id
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.$emit('back')
          }
        })
      })
    },
    add() {
      this.addData = {
        dialog: true,
        data: {
          id: this.detail.id,
          vendorId: this.detail.vendorId,
          regionId: this.detail.regionId,
          isAccessAllNetworks: this.detail.isAccessAllNetworks
        }
      }
    },
    addFirewall() {
      this.firewallData = {
        dialog: true,
        data: {
          storageAccountId: this.detail.id,
          ipType: 'IP'
        }
      }
    }
  },
  created() {},
  mounted() {}
}
</script>

<style></style>
