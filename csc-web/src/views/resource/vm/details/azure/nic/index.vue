<template>
  <div>
    <el-drawer append-to-body :visible.sync="detailFlag" :with-header="false" size="70%">
      <div style="padding: 20px">
        <el-tabs value="0">
          <el-tab-pane label="IP配置" name="0"> </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
    <el-card class="m-t" :body-style="{ padding: 0 }">
      <div slot="header" class="clearfix">
        <span>网卡</span>
        <span v-if="operate" class="pull-right m-l-sm add-btn"><el-button type="text" @click="mount" :disabled="detail.status != 'DEALLOCATE'">挂载现有网卡</el-button></span>
        <span v-if="operate" class="pull-right add-btn"><el-button type="text" @click="add" :disabled="detail.status != 'DEALLOCATE'">新增挂载网卡</el-button></span>
      </div>
      <basic-table :data="list" style="margin: 10px">
        <el-table-column prop="name" label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="detail-href" @click="getDetail(scope.row)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="内网IP" prop="primaryPrivateIPAddress" show-overflow-tooltip></el-table-column>
        <el-table-column prop="regionId" label="弹性IP" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.publicIPAddress || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="操作" show-overflow-tooltip v-if="operate">
          <template slot-scope="scope">
            <el-button :disabled="scope.row.nicsPrimary" type="text" @click="detach(scope.row)">卸载</el-button>
            <el-button type="text" @click="changeSubnet(scope.row)">更改子网</el-button>
            <!-- <el-button v-if="scope.row.publicIPAddress" type="text" @click="publicIp(scope.row)">卸载弹性IP</el-button>
          <el-button v-else type="text" @click="publicIp(scope.row)">绑定弹性IP</el-button> -->
          </template>
        </el-table-column>
        <div slot="pagination"></div>
      </basic-table>
      <attach :add-data="attachData" v-if="attachData.dialog"></attach>
      <mount :add-data="mountData" v-if="mountData.dialog"></mount>
      <bind :add-data="publicData" v-if="publicData.dialog"></bind>
      <subnet :add-data="subentData" v-if="subentData.dialog"></subnet>
    </el-card>
  </div>
</template>

<script>
import { getNics, patchNics } from 'services/platform/azure'
import '../../index.scss'
import attach from './attach.vue'
import bind from './bind.vue'
import mount from './mount.vue'
import subnet from './subnet.vue'
export default {
  components: { attach, bind, mount, subnet },
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    },
    operate: {
      type: Boolean,
      default: true
    }
  },
  computed: {},
  data() {
    return {
      list: [],
      attachData: {
        dialog: false,
        data: {}
      },
      mountData: {
        dialog: false,
        data: {}
      },
      publicData: {
        dialog: false,
        data: {}
      },
      subentData: {
        dialog: false,
        data: {}
      },
      installDetail: {},
      detailFlag: false
    }
  },
  created() {
    this.getNics()
  },
  methods: {
    getDetail(data) {
      this.installDetail = {
        ...data
      }
      this.detailFlag = true
    },
    changeSubnet(data) {
      this.subentData = {
        dialog: true,
        vpcName: data.vpcName,
        data: {
          id: data.id,
          vpcId: data.vpcId,
          vendorId: data.vendorId
        }
      }
    },
    mount() {
      this.mountData = {
        dialog: true,
        networkId: this.detail.vpcId,
        data: {
          serverId: this.detail.id,
          vendorId: this.detail.vendorId,
          regionId: this.detail.regionId,
          vpcId: this.detail.vpcId,
          resourceGroupId: this.detail.resourceGroupId
        }
      }
      console.log(this.mountData)
    },
    add() {
      this.attachData = {
        dialog: true,
        networkId: this.detail.vpcId,
        data: {
          serverId: this.detail.id,
          vendorId: this.detail.vendorId,
          regionId: this.detail.regionId,
          vpcId: this.detail.vpcId,
          resourceGroupId: this.detail.resourceGroupId
        }
      }
    },
    detach(data) {
      this.$confirm('确定卸载该网卡吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchNics('detach', { id: data.id, groupId: data.securityGroupId }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getNics()
          }
        })
      })
    },
    publicIp(data) {
      if (data.publicIPAddress) {
        this.$confirm('此操作将解绑弹性IP, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          patchNics('detachPublicIp', { id: data.id }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.getNics()
            }
          })
        })
      } else {
        this.publicData = {
          dialog: true,
          data: {
            ...this.detail,
            nicId: data.id
          }
        }
      }
    },
    getNics() {
      getNics({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { serverId: this.detail.id }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.list = data.data.rows
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.add-btn {
  position: relative;
  top: -7px;
}
</style>
