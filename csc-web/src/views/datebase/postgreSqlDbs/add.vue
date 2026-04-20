<template>
  <div>
    <el-dialog title="新增" :visible.sync="addData.dialog" width="60%" append-to-body>
      <el-row>
        <el-form label-width="180px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="数据库(DB)名称：" prop="name" validate="required" :rules="[pgUser]" maxlength="64">
              <el-input v-model="addData.data.name"></el-input>
              <div class="text_mine">由小写字母,数字,下划线组成,字母开头,字母或数字结尾,最短2字符,最长64字符</div>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="字符编码：" prop="characterSet">
              <el-input v-model="addData.data.characterSet" disabled></el-input>
              <!-- <el-radio-group v-model="addData.data.characterSet">
                <el-radio :label="item.value" v-for="(item, index) in characterSet" :key="index">{{item.name}}</el-radio>
              </el-radio-group> -->
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="排序规则：" prop="collation">
              <!-- <el-select v-model="addData.data.collation">
                <el-option v-for="(item, index) in collationList[addData.data.characterSet]" :key="index" :label="item.name" :value="item.value"></el-option>
              </el-select> -->
              <el-input v-model="addData.data.collation" disabled></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="字符分类：" prop="collctype">
              <el-input v-model="addData.data.collctype" disabled></el-input>
            </basic-form-item>
          </el-col>
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
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
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
    },
    detail: {
      type: Object
    }
  },
  data() {
    return {
      pgUser: {
        pattern: /^[a-z][a-z0-9_]{0,62}[a-z0-9]$/,
        message: '由小写字母,数字,下划线组成.字母开头,字母或数字结尾,最短2字符，最长64字符'
      },
      characterSet: [
        { name: 'UTF-8', value: 'utf8' }
        // {name: 'gbk', value: 'gbk'},
        // {name: 'latin1', value: 'latin1'},
        // {name: 'utf8mb4', value: 'utf8mb4'}
        // {name: '全部', value: 'all'}
      ],
      collationList: {
        utf8: [
          { name: 'utf8_general_ci', value: 'utf8_general_ci' },
          { name: 'utf8_bin', value: 'utf8_bin' },
          { name: 'utf8_unicode_ci', value: 'utf8_unicode_ci' }
        ],
        gbk: [
          { name: 'gbk_bin', value: 'gbk_bin' },
          { name: 'gbk_chinese_ci', value: 'gbk_chinese_ci' }
        ],
        latin1: [
          { name: 'latin1_bin', value: 'latin1_bin' },
          { name: 'latin1_general_ci', value: 'latin1_general_ci' },
          { name: 'latin1_general_cs', value: 'latin1_general_cs' }
        ],
        utf8mb4: [
          { name: 'utf8mb4_bin', value: 'utf8mb4_bin' },
          { name: 'utf8mb4_general_ci', value: 'utf8mb4_general_ci' },
          { name: 'utf8mb4_unicode_ci', value: 'utf8mb4_unicode_ci' }
        ]
      },
      loading: false
    }
  },
  methods: {
    setCollation() {
      this.$set(this.addData.data, 'collation', '')
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createRdsDbs(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.getList()
            }
            this.loading = false
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
