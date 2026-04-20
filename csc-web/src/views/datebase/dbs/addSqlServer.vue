<template>
  <div>
    <el-dialog title="新增" :visible.sync="addData.dialog" width="60%" append-to-body>
      <el-row>
        <el-form label-width="180px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="数据库(DB)名称：" prop="name" validate="required" maxlength="64">
              <el-input v-model="addData.data.name"></el-input>
              <div class="text_mine">由大小写字母,数字,下划线组成.字母开头,字母或数字结尾,最长64字符</div>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="排序规则：" prop="collation" validate="required" maxlength="64">
              <el-select v-model="addData.data.collation">
                <el-option v-for="(item, index) in collationList" :key="index" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <!-- <el-col :span="24">
            <basic-form-item label="授权账户：" prop="user">
              <el-select v-model="addData.data.user">
                <el-option label="未授权账号（默认）" value="default"></el-option>
              </el-select>
            </basic-form-item>
          </el-col> -->
          <el-col :span="24">
            <basic-form-item label="备注说明：" prop="remark">
              <el-input type="textarea" v-model="addData.data.remark"></el-input>
              <div class="text_mine">请输入备注说明,最多256个字符</div>
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
import { createRdsDbs } from 'services/resource/datebase'
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
      collationList: [
        { name: 'Chinese_PRC_CI_AI', value: 'Chinese_PRC_CI_AI' },
        { name: 'Chinese_PRC_CI_AS', value: 'Chinese_PRC_CI_AS' },
        { name: 'Chinese_PRC_CS_AI', value: 'Chinese_PRC_CS_AI' },
        { name: 'Chinese_PRC_CS_AS', value: 'Chinese_PRC_CS_AS' },
        { name: 'Chinese_PRC_90_BIN', value: 'Chinese_PRC_90_BIN' }
      ]
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createRdsDbs(this.addData.data).then(data => {
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

<style>
.text_mine {
  font-size: 10px;
  color: #999;
}
</style>
