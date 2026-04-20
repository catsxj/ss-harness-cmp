<template>
  <div>
    <el-dialog title="克隆为模板" append-to-body :visible.sync="addData.dialog" width="600px" v-if="addData.dialog">
      <div>
        <el-alert title="请确保虚拟机已安装tools，否则镜像部署的虚拟机可能存在问题" type="warning" class="m-b-sm" :closable="false" effect="dark"> </el-alert>
        <basic-form ref="data" :model="addData.data" :status-icon="true">
          <el-row>
            <el-col :span="24">
              <basic-form-item label="模板名称：" prop="name" validate="required">
                <el-input v-model="addData.data.name" auto-complete="off"></el-input>
              </basic-form-item>
              <basic-form-item label="存储位置：">
                <el-radio-group v-model="position">
                  <el-radio label="site">存储平台</el-radio>
                  <el-radio label="pool">镜像存储池</el-radio>
                </el-radio-group>
              </basic-form-item>
              <basic-form-item label="数据存储：" prop="storeId" validate="required" v-if="position == 'pool'">
                <el-select v-model="addData.data.storeId" @change="chooseDatastore">
                  <el-option :value="item.id" :label="`${item.name}-${item.value}G`" :key="index" v-for="(item, index) in datastoreData" border></el-option>
                </el-select>
              </basic-form-item>
              <basic-form-item label="描述：" prop="remark">
                <el-input type="textarea" v-model="addData.data.remark" auto-complete="off"></el-input>
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
      position: 'site',
      datastoreData: []
    }
  },
  watch: {
    position: {
      handler: function (val) {
        if (val == 'site') {
          this.getDatastore()
        } else {
          this.getDatastore()
        }
      },
      immediate: true
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          patchVmId('cloneAsTemplate', {
            id: this.addData.data.id,
            name: this.addData.data.name,
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
    // 获取数据存储数据
    getDatastore(vhostId) {
      const params = {
          simple: true
        },
        searchParam = [{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getDatastores(params).then(data => {
        if (data.success) {
          this.datastoreData = data.data.rows
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
