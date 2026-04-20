<template>
  <div>
    <el-dialog title="克隆为模板" append-to-body :visible.sync="addData.dialog" width="60%" v-if="addData.dialog">
      <div>
        <basic-form ref="data" :model="addData.data" :status-icon="true">
          <el-row>
            <el-col :span="24">
              <basic-form-item label="模板名称：" prop="name" validate="required">
                <el-input v-model="addData.data.name" auto-complete="off"></el-input>
              </basic-form-item>
              <basic-form-item label="数据中心：" required>
                <el-radio-group v-model="addData.data.vdcId" @change="chooseVdc">
                  <el-radio :label="item.id" :key="index" v-for="(item, index) in vdcData" border> {{ item.name }}</el-radio>
                </el-radio-group>
              </basic-form-item>
              <basic-form-item label="主机集群：">
                <el-radio-group v-model="addData.data.clusterId" @change="chooseCluster">
                  <el-radio :label="item.id" :key="index" v-for="(item, index) in clusterData" border> {{ item.name }} </el-radio>
                </el-radio-group>
              </basic-form-item>
              <basic-form-item label="目标主机：" prop="hostId" validate="required">
                <el-radio-group v-model="addData.data.hostId" @change="chooseVhost">
                  <el-radio :disabled="!item.connected || item.maintained" :title="!item.connected || item.maintained ? '无法选择该云主机，因为该云主机未连接、处于维护模式下，或者在更改其维护状态' : ''" :label="item.id" :key="index" v-for="(item, index) in vhostData" border>
                    {{ item.name }}
                  </el-radio>
                </el-radio-group>
              </basic-form-item>
              <basic-form-item label="数据存储：" prop="storeId" validate="required">
                <el-radio-group v-model="addData.data.storeId" @change="chooseDatastore">
                  <el-radio :label="item.id" :key="index" v-for="(item, index) in datastoreData" border> {{ item.name + '-' + item.value + 'G' }} </el-radio>
                </el-radio-group>
              </basic-form-item>
            </el-col>
          </el-row>
        </basic-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getHost, getVdc, getCluters, getDatastores, patchVmId, detailVm } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            storeId: '',
            hostId: ''
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      vdcData: [],
      vhostData: [],
      clusterData: [],
      datastoreData: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          patchVmId('cloneAsTemplate', {
            id: this.addData.data.id,
            name: this.addData.data.name,
            hostId: this.addData.data.hostId,
            storeId: this.addData.data.storeId
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.handleSearch()
            }
          })
        }
      })
    },
    // 选择目标主机
    chooseVhost(item) {
      this.vhostData.forEach(data => {
        if (data.id == this.addData.data.hostId) {
          this.addData.data.hostname = data.name
          this.addData.data.datastore = ''
          this.datastoreData = ''
          this.getDatastore(data.id)
        }
      })
    },
    // 获取数据存储数据
    getDatastore(vhostId) {
      const params = {
          simple: true
        },
        searchParam = [
          { param: { vhostId: vhostId, category: 'PM' }, sign: 'EQ' },
          {
            param: { status: 'inactive' },
            sign: 'UEQ'
          }
        ]
      params.params = JSON.stringify(searchParam)
      getDatastores(params).then(data => {
        if (data.success) {
          data.data.rows.forEach(item => {
            item.isDatastoreActive = false
          })
          this.datastoreData = data.data.rows
        }
      })
    },
    // 选择集群
    chooseCluster(item) {
      this.addData.data.hostname = ''
      this.addData.data.datastore = ''
      this.datastoreData = []
      this.getVhost(this.addData.data.clusterId, 'cluster')
    },
    // 选择数据存储
    chooseDatastore(item) {
      this.datastoreData.forEach(data => {
        if (data.id == this.addData.data.storeId) {
          this.addData.data.datastore = data.name
        }
      })
    },
    getVdc() {
      const params = {
          simple: true
        },
        searchParam = [{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getVdc(params).then(data => {
        if (data.success) {
          this.vdcData = data.data.rows
        }
      })
    },
    // 选择数据中心
    chooseVdc() {
      this.addData.data.clusterId = ''
      this.addData.data.hostname = ''
      this.addData.data.datastore = ''
      this.datastoreData = []
      this.getCluster()
      this.getVhost(this.addData.data.vdcId, 'vdc')
    },
    // 获取集群数据
    getCluster() {
      const params = {
          simple: true
        },
        searchParam = [{ param: { vendorId: this.addData.data.vmwareId, vdcId: this.addData.data.vdcId }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getCluters(params).then(data => {
        if (data.success) {
          this.clusterData = data.data.rows
        }
      })
    },
    // 获取目标主机数据
    getVhost(id, type) {
      let searchParam = []
      if (type == 'vdc') {
        searchParam = [{ param: { vdcId: id }, sign: 'EQ' }]
      } else if (type == 'cluster') {
        searchParam = [{ param: { clusterId: id }, sign: 'EQ' }]
      }
      const params = {
        page: 1,
        rows: 10000,
        type: 'Vmware'
      }
      params.params = JSON.stringify(searchParam)
      getHost(params).then(data => {
        if (data.success) {
          this.vhostData = data.data.rows
        }
      })
    }
  },
  created() {
    detailVm(this.addData.data.id).then(data => {
      if (data.success) {
        const host = data.data
        this.getVdc()
        this.$set(this.addData.data, 'vdcId', host.vdcId)
        this.chooseVdc()
      }
    })
  }
}
</script>

<style></style>
