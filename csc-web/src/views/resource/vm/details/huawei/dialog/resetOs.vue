<template>
  <div>
    <el-dialog append-to-body title="重装操作系统" width="50%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <el-form :model="addData.data" status-icon :rules="rules1" ref="data" label-width="120px" class="demo-ruleForm">
        <el-row :gutter="10">
          <el-col :span="24">
            <el-alert class="m-b-md" title="机器密码需12到16位，至少包括三项（[a-z,A-Z],[0-9]和[()`~!@#$%^&*-+=_|{}[]:;',.?/])的特殊符号" type="warning"> </el-alert>
          </el-col>
          <el-col :span="20" :offset="2">
            <el-form-item label="镜像：" prop="imageId" validate="required" required-message="请选择镜像">
              <el-select v-model="addData.data.imageId">
                <el-option v-for="(item, index) in imageData" :label="item.name" :value="item.id" :key="index"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="密码：" prop="password">
              <el-input type="password" v-model="addData.data.password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="确认密码：" prop="checkPass">
              <el-input type="password" v-model="addData.data.checkPass" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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
    var validatePass3 = (rule, value, callback) => {
      const pattern = '^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_]+$)(?![a-z0-9]+$)(?![a-z\\W_]+$)(?![0-9\\W_]+$)[a-zA-Z0-9\\W_]{12,16}$'
      if (!value.match(pattern)) {
        callback(new Error('同时包含大小写字母，数字或特殊字符任意三项,长度介于12-16字符'))
      } else {
        callback()
      }
    }
    var validatePass4 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.addData.data.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      imageData: [],
      // 校验密码
      rules1: {
        password: [
          { validator: validatePass3, trigger: 'blur' },
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass4, trigger: 'blur' },
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
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
        regionId: this.addData.data.regionId,
        status: 'ACTIVE'
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
