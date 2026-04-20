<template>
  <div>
    <el-dialog title="调整配置" :visible.sync="addData.dialog" width="50%">
      <el-form ref="data" :model="addData.data" :status-icon="true" label-width="150px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="规格：" required>
              <el-select v-model="addData.specId" @change="specChange">
                <el-option v-for="(item, index) in specList" :key="index" :label="specFilter(item.uuid)" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="详细规格：" prop="sloId" validate="required">
              <el-select v-model="addData.data.sloId" @change="setStorageMb">
                <el-option v-for="(item, index) in sloList" :key="index" :label="`${item.uuid}(vCore：${item.vcore})`" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="存储空间：" prop="storageMb" validate="required" required-message="请输入名称">
              <el-input-number v-model="addData.data.storageMb" style="width: 80%" :min="minStorageMb" :max="maxStorageMb"></el-input-number>
              <span class="m-l-xs">GB</span>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="备份保持期：" prop="backupRetentionDays" validate="required">
              <el-input-number v-model="addData.data.backupRetentionDays" style="width: 80%" :min="7" :max="35"></el-input-number>
              <span class="m-l-xs">天</span>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="启用存储自动增长：" prop="storageAutogrow" validate="required">
              <el-checkbox v-model="addData.data.storageAutogrow">启用</el-checkbox>
            </basic-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { putMysqlSet, getSku, getSkuDetail } from 'services/platform/azure'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      specList: [],
      sloList: [],
      minStorageMb: 0,
      maxStorageMb: 9999,
      loading: false
    }
  },
  created() {
    this.getSku()
    this.getSkuDetail()
  },
  methods: {
    specFilter(value) {
      const specMap = {
        Basic: '基本',
        GeneralPurpose: '常规用途',
        MemoryOptimized: '优化内存'
      }
      return specMap[value]
    },
    getSku() {
      getSku({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.vendorId, regionId: this.addData.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.specList = data.data.rows
        }
      })
    },
    specChange() {
      if (this.addData.data.sloId) this.addData.data.sloId = ''
      this.getSkuDetail()
    },
    getSkuDetail() {
      getSkuDetail(this.addData.specId).then(data => {
        if (data.success) {
          this.sloList = data.data.serviceLevelObjectives
          if (this.addData.data.storageMb) this.setStorageMb()
        }
      })
    },
    setStorageMb() {
      const obj = this.sloList.find(item => item.id == this.addData.data.sloId)
      this.minStorageMb = obj.minStorageMB / 1024
      this.maxStorageMb = obj.maxStorageMB / 1024
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          putMysqlSet({
            ...this.addData.data,
            storageMb: this.addData.data.storageMb * 1024,
            storageAutogrow: this.addData.data.storageAutogrow ? 'Enabled' : 'Disabled'
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style></style>
