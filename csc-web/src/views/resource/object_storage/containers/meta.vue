<template>
  <div>
    <el-dialog title="更新容器元数据" append-to-body :visible.sync="addData.dialog" width="50%">
      <span>
        <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="150px" class="m-t-md">
          <el-row :gutter="5" v-for="(item, index) in addData.data.metas" :key="'tags' + index">
            <el-col :span="8">
              <basic-form-item label="KEY:" label-width="55px" :prop="`metas.${index}.key`" validate="required,vmName">
                <el-input v-model="item.key"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="8">
              <basic-form-item label="VALUE:" label-width="80px" :prop="`metas.${index}.value`" validate="required,code">
                <el-input v-model="item.value"></el-input>
              </basic-form-item>
            </el-col>
            <el-col :span="7">
              <el-button type="danger" size="mini" @click="removeItem(key, addData.data.metas)">删除</el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-button type="primary" @click="addItem(addData.data.metas)">添加</el-button>
          </el-row>
        </basic-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="tagOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { putMeta } from 'services/platform/azure'
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
    return {}
  },
  methods: {
    retrieval() {
      let flag = false
      const ary = []
      this.addData.data.metas.forEach(item => {
        const tag = item.key + ':' + item.value
        if (ary.indexOf(tag) == -1) ary.push(tag)
        else flag = true
      })
      return flag
    },
    addItem(data) {
      if (this.retrieval()) return this.$message.error('数据不可重复输入')
      data.push({})
    },
    removeItem(key, data) {
      data.splice(key, 1)
    },
    tagOk() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.retrieval()) return this.$message.error('数据不可重复输入')
          const obj = {}
          this.addData.data.metas.forEach(item => {
            obj[item.key] = item.value
          })
          putMeta(this.addData.data.id, obj).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.addData.dialog = false
              this.$emit('back')
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
