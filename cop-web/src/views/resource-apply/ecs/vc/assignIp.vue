<template>
  <div>
    <el-dialog title="分配IP" append-to-body :visible.sync="dialog.dialog" width="40%">
      <div>
        <div v-for="(item, index) in dialog.address" :key="index" class="m-t-md">
          <el-input v-model="dialog.address[index]"></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="dialog.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */

import { conditionIp } from 'services/platform/index'
export default {
  props: {
    dialog: {
      type: Object,
      default: () => {
        return {
          dialog: false
        }
      }
    }
  },
  data () {
    return {
    }
  },
  methods: {
    ok () {
      let flag = false
      const ary = []
      const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      this.dialog.address.forEach(item => {
        if (ary.indexOf(item) == -1) ary.push(item)
        if (!reg.test(item)) flag = true
      })
      if (flag) return this.$message.error('IP输入有误')
      if (ary.length != this.dialog.address.length) return this.$message.error('IP输入重复')
      conditionIp({
        condition: JSON.stringify({
          condition: 'checkIp',
          poolId: this.dialog.poolId,
          ips: this.dialog.address
        })
      }).then(data => {
        if (data.success) {
          this.$emit('back', this.dialog)
          this.dialog.dialog = false
        }
      })
    }
  },
  created () {
  }
}
</script>

<style>

</style>
