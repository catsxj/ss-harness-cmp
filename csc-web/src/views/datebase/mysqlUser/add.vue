<template>
  <div>
    <el-dialog title="新增用户" :visible.sync="addData.dialog" width="60%" append-to-body>
      <el-row>
        <el-form label-width="140px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="用户：" prop="username" validate="required,rdsUser" maxlength="16">
              <el-input v-model="addData.data.username"></el-input>
              <div class="tip">由大小写字母,数字,下划线,中划线组成.字母开头,字母或数字结尾,最长16字符.不支持root账户</div>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="主机：" prop="host" validate="required">
              <el-input v-model="addData.data.host" placeholder="允许用户登录数据库所使用的IP，其中%表示匹配所有的IP"></el-input>
              <div class="tip">允许用户登录数据库所使用的IP，其中%表示匹配所有的IP</div>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="密码：" prop="password" validate="required,datebasePassword">
              <el-input v-model="addData.data.password" type="password"></el-input>
              <!-- <div class="tip">大写，小写，数字，特殊字符组成</div> -->
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="确认密码：" prop="endPassword" validate="required,datebasePassword">
              <el-input v-model="addData.data.endPassword" type="password"></el-input>
              <!-- <div class="tip">大写，小写，数字，特殊字符组成</div> -->
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="备注：" prop="remark">
              <el-input type="textarea" v-model="addData.data.remark"></el-input>
              <div class="tip">请输入备注说明,最多256个字符</div>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createRdsUsers } from 'services/resource/datebase'
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
    }
  },
  data() {
    return {
      dbsList: []
    }
  },
  methods: {
    handleChange(value, direction, movedKeys) {},
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.addData.data.password != this.addData.data.endPassword) return this.$message.error('俩次密码输入不一致！')
          const obj = {
            rdsId: this.addData.data.rdsId,
            username: this.addData.data.username,
            host: this.addData.data.host,
            password: crypto.encrypt(this.addData.data.password),
            remark: this.addData.data.remark
          }
          createRdsUsers(obj).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.getList()
            }
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
