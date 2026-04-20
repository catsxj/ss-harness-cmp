<template>
  <div>
    <el-dialog title="迁移" append-to-body :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <div>
        <basic-form ref="data" :model="addData.data" :status-icon="true">
          <el-row>
            <el-col :span="24">
              <basic-form-item label="迁移方式：">
                <el-radio-group v-model="radio" size="small" @change="radioChange">
                  <el-radio label="a" border>主机</el-radio>
                  <el-radio label="b" border>数据存储</el-radio>
                  <el-radio label="c" border>主机及数据存储</el-radio>
                </el-radio-group>
              </basic-form-item>
            </el-col>
            <el-col :span="24" v-if="radio === 'a'">
              <basic-form-item label="目标主机：" prop="hostId" validate="required" required-message="请选择主机">
                <el-select v-model="addData.data.hostId">
                  <el-option v-for="(item, index) in vmHostList" :label="item.name" :value="item.id" :key="index"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="24" v-else-if="radio === 'b'">
              <basic-form-item label="数据存储：" prop="storeId" validate="required" required-message="请选择数据存储">
                <el-select v-model="addData.data.storeId">
                  <el-option v-for="(item, index) in datastoreData" :label="item.name" :value="item.id" :key="index"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="24" v-else>
              <basic-form-item label="目标主机：" prop="hostId" validate="required" required-message="请选择主机">
                <el-select v-model="addData.data.hostId" @change="getDatastore(addData.data.hostId)">
                  <el-option v-for="(item, index) in vmHostList" :label="item.name" :value="item.id" :key="index"></el-option>
                </el-select>
              </basic-form-item>
              <basic-form-item label="数据存储：" prop="storeId" validate="required" required-message="请选择数据存储">
                <el-select v-model="addData.data.storeId">
                  <el-option v-for="(item, index) in datastoreData" :label="item.name" :value="item.id" :key="index"></el-option>
                </el-select>
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
import { getDatastores, patchVmId, getHost } from 'services/platform/index'

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
      vmHostList: [],
      radio: 'a',
      datastoreData: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const obj = {}
          if (this.radio === 'a') {
            obj.id = this.addData.data.id
            obj.hostId = this.addData.data.hostId
          } else if (this.radio === 'b') {
            obj.id = this.addData.data.id
            obj.storeId = this.addData.data.storeId
          } else {
            obj.id = this.addData.data.id
            obj.hostId = this.addData.data.hostId
            obj.storeId = this.addData.data.storeId
          }
          patchVmId('migrate', obj).then(data => {
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
    radioChange() {
      this.$refs.data.resetFields()
      if (this.radio === 'a') {
        this.getHosts()
        this.addData.data.hostId = ''
        this.addData.data.storeId = ''
      } else if (this.radio === 'b') {
        this.getDatastore()
        this.addData.data.storeId = ''
        this.addData.data.hostId = ''
      } else {
        this.getHosts()
        this.addData.data.storeId = ''
        this.datastoreData = []
        this.addData.data.hostId = ''
      }
    },
    getHosts() {
      getHost({
        page: 1,
        rows: 99999,
        type: 'Vmware',
        params: JSON.stringify([
          {
            param: { vendorId: this.addData.data.vendorId },
            sign: 'EQ'
          },
          { param: { id: this.addData.data.vendorId.oldHostId }, sign: 'UEQ' }
        ])
      }).then(data => {
        if (data.success) {
          this.vmHostList = data.data.rows
        }
      })
    },
    getDatastore(vhostId) {
      this.datastoreData = []
      const params = {
          simple: true
        },
        searchParam = [
          { param: { vendorId: this.addData.data.vendorId, vhostId: vhostId || this.addData.data.oldHostId, category: 'PM' }, sign: 'EQ' },
          { param: { status: 'inactive' }, sign: 'UEQ' }
        ]
      params.params = JSON.stringify(searchParam)
      getDatastores(params).then(data => {
        if (data.success) {
          this.datastoreData = data.data.rows
        }
      })
    }
  },
  created() {
    this.getHosts()
    this.getDatastore()
  }
}
</script>

<style></style>
