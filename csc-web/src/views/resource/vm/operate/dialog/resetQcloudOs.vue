<template>
  <div>
    <el-dialog title="重置主机系统" width="50%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <basic-form :model="addData.data" status-icon ref="data" label-width="120px" class="demo-ruleForm">
        <el-row>
          <el-col :span="24">
            <el-form-item label="登录方式：">
              <el-radio-group v-model="keypair" @change="chooseLoginWay">
                <el-radio :label="item.isLoginActive" :key="index" v-for="(item, index) in loginWays" border>
                  {{ item.name }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="keypair">
            <basic-form-item label="登录密钥：" prop="keypairId" validate="required">
              <el-select v-model="addData.data.keypairId">
                <el-option v-for="(item, index) in keypairList" :key="index" :label="item.name" :value="item.fingerprint"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24" v-else>
            <el-col :span="12">
              <basic-form-item label="登录密码：" prop="password" validate="required">
                <el-input type="password" v-model="addData.data.password"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="确认密码：" prop="endPassword" validate="required">
                <el-input type="password" v-model="addData.data.endPassword"></el-input>
              </basic-form-item>
            </el-col>
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
import { getKey, patchVm } from 'services/platform/index'
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
      loginWays: [
        { name: '密钥', isLoginActive: true },
        { name: '密码', isLoginActive: false }
      ],
      keypairList: [],
      keypair: true
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          let obj = {}
          if (this.keypair) {
            obj = {
              serverId: this.addData.data.id,
              keypairId: this.addData.data.keypairId
            }
          } else {
            if (this.addData.data.password != this.addData.data.endPassword) return this.$message.error('密码输入不一致！')
            obj = {
              serverId: this.addData.data.id,
              password: crypto.encrypt(this.addData.data.password)
            }
          }
          patchVm('resetInstance', this.addData.data).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.addData.dialog = false
            }
          })
        }
      })
    },
    // 切换方式
    chooseLoginWay() {
      if (this.keypair) {
        this.keypair = true
      } else {
        this.keypair = false
      }
    },
    getKeypair() {
      getKey({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.keypairList = data.data.rows
        }
      })
    }
  },
  created() {
    this.getKeypair()
  }
}
</script>

<style></style>
