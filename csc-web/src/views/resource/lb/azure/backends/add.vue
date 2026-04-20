<template>
  <div>
    <el-dialog append-to-body title="新增后端池" :visible.sync="addData.dialog" v-if="addData.dialog">
      <cmp-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
        <cmp-form-item label="名称：" prop="name" validate="required">
          <el-input v-model="addData.data.name" placeholder="后端池名称"></el-input>
        </cmp-form-item>
        <el-form-item label="虚拟网络：" required>
          <el-select v-model="addData.networkId" @change="getList" v-if="!addData.vpcUuid">
            <el-option v-for="(item, index) in list" :key="index" :label="item.name" :value="item.vpcId"></el-option>
          </el-select>
          <div v-else>
            {{ (list.find(item => item.vpcId == addData.vpcUuid) || {}).name }}
          </div>
        </el-form-item>
        <cmp-form-item label="云主机：" prop="virtualMachineIds" validate="required">
          <el-select filterable clearable v-model="addData.data.virtualMachineIds" multiple>
            <el-option v-for="(item, index) in tableData" :key="index" :label="item.name + '(' + (item.privateIpsList.length ? item.privateIpsList[0] : '') + ')'" :value="item.id"></el-option>
          </el-select>
        </cmp-form-item>
      </cmp-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createBackends, getBackendsCreateVms } from 'services/platform/azure'
import { getVm, getVpc } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            name: '',
            networkId: '',
            virtualMachineIds: []
          },
          dialog: false
        }
      }
    }
  },
  components: {},
  data() {
    return {
      list: [],
      networkId: '',
      params: {
        page: 1,
        rows: 10
      },
      tableData: []
    }
  },
  methods: {
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([
          {
            param: { vendorId: this.addData.data.vendorId, regionId: this.addData.regionId },
            sign: 'EQ'
          }
        ])
      }).then(data => {
        if (data.success) {
          this.list = data.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createBackends({
            backEnd: this.addData.data
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
              this.$parent.handleSearch()
            }
          })
        }
      })
    },
    getList() {
      // const obj = this.list.find(item => item.vpcId == this.addData.networkId)
      // getVm({
      //   page: 1,
      //   rows: 9999,
      //   params: JSON.stringify([{
      //     param: { vendorId: this.addData.data.vendorId, vpcId: obj.id }, sign: 'EQ'
      //   }])
      // }).then(data => {
      //   if (data.success) {
      //     this.tableData = data.data.rows.map(item => {
      //       return {
      //         ...item,
      //         privateIpsList: item.privateIps ? JSON.parse(item.privateIps) : []
      //       }
      //     })
      //   }
      // })
      const obj = this.list.find(item => item.vpcId == this.addData.networkId)
      getBackendsCreateVms(this.addData.data.slbId, {
        vpcId: obj.id
      }).then(data => {
        if (data.success) {
          if (data.data.action) {
            this.tableData = data.data.servers.map(item => {
              return {
                ...item,
                privateIpsList: item.privateIps ? JSON.parse(item.privateIps) : []
              }
            })
          }
        }
      })
    },
    getBackendsCreateVms() {
      getBackendsCreateVms(this.addData.data.slbId).then(data => {
        if (data.success) {
          if (data.data.action) {
            this.tableData = data.data.servers.map(item => {
              return {
                ...item,
                privateIpsList: item.privateIps ? JSON.parse(item.privateIps) : []
              }
            })
          }
        }
      })
    }
  },
  created() {
    this.getVpc()
    this.getBackendsCreateVms()
  }
}
</script>

<style></style>
