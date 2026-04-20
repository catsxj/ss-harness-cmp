<template>
  <div>
    <el-dialog append-to-body title="挂载光驱" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <div>
        <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="130px">
          <basic-form-item label="数据存储：" prop="id">
            <el-select v-model="addData.data.id" filterable @change="changeId">
              <el-option v-for="(item, index) in storageList" :label="item.name" :value="item.id" :key="index"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="文件光驱列表：" prop="dsId">
            <el-select v-model="addData.data.dsId" filterable @change="changeFile">
              <el-option v-for="(item, index) in fileList" :label="item.name" :value="item.dsId" :key="index"></el-option>
            </el-select>
          </basic-form-item>
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
import { getDatastore, getDatastoreFiles, operateCdrom } from 'services/platform/fc'

export default {
  props: {
    addData: {
      type: Object
    },
    vendorId: {
      type: Number
    }
  },
  data() {
    return {
      storageList: [],
      fileList: []
    }
  },
  methods: {
    getStorage() {
      getDatastore({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          vendorId: this.vendorId
        })
      }).then(data => {
        if (data.success) {
          this.storageList = data.data.rows
          if (this.storageList.length) {
            this.addData.data.id = this.storageList[0].id
            this.getFileList()
          }
        }
      })
    },
    changeId() {
      this.addData.data.dsId = ''
      this.getFileList()
    },
    changeFile(value) {
      for (let index = 0; index < this.fileList.length; index++) {
        const element = this.fileList[index]
        if (element.dsId == value) {
          this.$set(this.addData.data, 'devicePath', element.dsId + '@' + element.name)
        }
      }
    },
    // 获取文件列表
    getFileList() {
      getDatastoreFiles(this.addData.data.id).then(data => {
        if (data.success) {
          this.fileList = data.data
          if (this.fileList.length) {
            this.addData.data.dsId = this.fileList[0].dsId
            this.changeFile(this.addData.data.dsId)
          }
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const { vmId, protocol, devicePath } = this.addData.data
          operateCdrom('attach', {
            vmId: vmId,
            protocol: protocol,
            devicePath: devicePath
          }).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.$emit('back')
              this.addData.dialog = false
            }
          })
        }
      })
    }
  },
  created() {
    this.getStorage()
  }
}
</script>

<style></style>
