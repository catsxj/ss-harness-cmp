<template>
  <div>
    <el-dialog title="新增密钥" :visible.sync="addData.dialog" width="40%">
      <basic-form label-width="120px" :model="itemData" ref="data">
        <vendor :add-data="addData" vendorType="TENCENT"></vendor>
        <basic-form-item label="创建密钥" prop="resource">
          <el-radio-group v-model="radio1">
            <el-radio-button label="创建密钥对"></el-radio-button>
            <el-radio-button label="已经有的密钥"></el-radio-button>
          </el-radio-group>
        </basic-form-item>
        <basic-form-item label="密钥名称:" prop="name" validate="required" :rules="nameRule">
          <el-input v-model="itemData.name"></el-input>
        </basic-form-item>
        <basic-form-item label="输入公钥" prop="publicKey" v-if="radio1 == '已经有的密钥'" validate="required">
          <el-input type="textarea" :rows="3" v-model="itemData.publicKey" placeholder="格式: ssh-rsa AAAKedvs...."></el-input>
        </basic-form-item>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createKey } from 'services/platform/index'
import { downloadFile } from 'utils'

import vendor from '@/components/publicPool/index.vue'
export default {
  components: { vendor },
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
      regionList: [],
      vpcList: [],
      radio1: '创建密钥对',
      nameRule: [{ pattern: /^[a-zA-Z0-9_]*$/, message: '只支持英文大小写、数字和下划线' }]
    }
  },
  computed: {
    itemData() {
      return this.addData.data
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createKey({
            ...this.itemData,
            projectId: '0',
            publicKey: this.itemData.publicKey ? this.itemData.publicKey.replace(/\+/g, '%2B') : ''
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
              if (!this.itemData.publicKey) {
                downloadFile('/ims/v1/keypairs/download', {
                  id: data.data
                })
              }
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
