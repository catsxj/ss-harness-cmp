<template>
  <div>
    <el-dialog title="标签" append-to-body :visible.sync="addData.dialog" width="50%">
      <span>
        <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="80px" class="m-t-md">
          <basic-form-item label="标记：">
            <el-row :gutter="5" v-for="(item, key) in addData.data.tags" :key="'tags' + key">
              <el-col :span="8">
                <basic-form-item label="KEY:" label-width="55px">
                  <el-input v-model="item.key"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="8">
                <basic-form-item label="VALUE:" label-width="80px">
                  <el-input v-model="item.value"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="7">
                <el-button type="danger" size="mini" @click="removeItem(key, addData.data.tags)">删除</el-button>
              </el-col>
            </el-row>
            <el-row>
              <el-button type="primary" @click="addItem(addData.data.tags)">添加</el-button>
            </el-row>
          </basic-form-item>
        </basic-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="tagOk" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { putTags } from 'services/platform/azure'
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
      loading: false,
      keyList: [],
      valueList: [],
      keyValues: [],
      valueValus: []
    }
  },
  methods: {
    retrieval() {
      let flag = false
      const ary = []
      this.addData.data.tags.forEach(item => {
        const tag = item.key + ':' + item.value
        if (ary.indexOf(tag) == -1 && item.key && item.value) ary.push(tag)
        else flag = true
      })
      return flag
    },
    addItem(data) {
      if (this.retrieval()) return this.$message.error('标签不可重复输入且不可为空')
      data.push({})
    },
    removeItem(key, data) {
      data.splice(key, 1)
    },
    tagOk() {
      if (this.retrieval()) return this.$message.error('标签不可重复输入且不可为空')
      const obj = {}
      this.addData.data.tags.map(item => {
        obj[item.key] = item.value
      })
      this.loading = true
      putTags({
        action: this.addData.data.action,
        resourceId: this.addData.data.resourceId,
        tags: obj
      }).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.addData.dialog = false
          this.$emit('back')
        }
        this.loading = false
      })
    }
  },
  created() {}
}
</script>

<style></style>
