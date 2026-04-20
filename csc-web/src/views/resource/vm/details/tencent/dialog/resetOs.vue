<template>
  <div>
    <el-dialog append-to-body title="重装操作系统" width="50%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <basic-form :model="addData.data" status-icon ref="data" label-width="120px" class="demo-ruleForm">
        <el-row :gutter="10">
          <!-- <el-col :span="24">
            <el-alert class="m-b-md"
              title="机器密码需8到16位，至少包括两项（[a-z,A-Z],[0-9]和[()`~!@#$%^&*-+=_|{}[]:;',.?/])的特殊符号"
              type="warning">
            </el-alert>
          </el-col> -->
          <el-col :span="24">
            <basic-form-item label="镜像：" prop="imageId" validate="required" required-message="请选择镜像">
              <el-select v-model="addData.data.imageId" @change="setOsCategory">
                <el-option v-for="(item, index) in imageData" :label="item.name" :value="item.id" :key="index"></el-option>
              </el-select>
            </basic-form-item>
            <basic-form-item label="密码：" prop="password" validate="required,tencentWindowsVm" v-if="osCategory == 'Windows'" key="1">
              <el-input type="password" v-model="addData.data.password" autocomplete="off"></el-input>
            </basic-form-item>
            <basic-form-item label="密码：" prop="password" validate="required,tencentLinuxVm" v-else key="2">
              <el-input type="password" v-model="addData.data.password" autocomplete="off"></el-input>
            </basic-form-item>
            <basic-form-item label="确认密码：" prop="checkPass" validate="required,tencentWindowsVm" key="3" v-if="osCategory == 'Windows'">
              <el-input type="password" v-model="addData.data.checkPass" autocomplete="off"></el-input>
            </basic-form-item>
            <basic-form-item label="确认密码：" prop="checkPass" validate="required,tencentLinuxVm" key="4" v-else>
              <el-input type="password" v-model="addData.data.checkPass" autocomplete="off"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { conditionImage, vmVmtools } from 'services/platform/index'
import crypto from 'utils/crypto'

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
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      imageData: [],
      osCategory: 'Windows'
    }
  },
  methods: {
    setOsCategory() {
      this.imageData.forEach(item => {
        if (item.id == this.addData.data.imageId) {
          this.osCategory = item.osCategory
          this.$set(this.addData.data, 'password', '')
          this.$set(this.addData.data, 'checkPass', '')
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const obj = JSON.parse(JSON.stringify(this.addData.data))
          obj.password = crypto.encrypt(obj.password)
          obj.checkPass = crypto.encrypt(obj.checkPass)
          vmVmtools('resetInstance', obj).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.$emit('back')
              this.addData.dialog = false
            }
          })
        }
      })
    },
    // 获取镜像列表
    getImageList() {
      conditionImage({
        condition: 'listTenantPublic',
        vendorId: this.vendorId,
        regionId: this.addData.data.regionId
      }).then(data => {
        if (data.success) {
          this.imageData = data.data
        }
      })
    }
  },
  created() {
    this.getImageList()
  }
}
</script>

<style></style>
