<template>
  <div>
    <el-dialog title="新增快照" append-to-body width="50%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <el-form :model="addData.data" status-icon ref="data" label-width="120px" class="demo-ruleForm">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required">
              <el-input v-model="addData.data.name" :maxlength="32"></el-input>
            </basic-form-item>
            <basic-form-item label="描述：" prop="remark">
              <el-input v-model="addData.data.remark"></el-input>
            </basic-form-item>
            <basic-form-item label="类型：" prop="snapshotType" validate="required" required-message="请选择">
              <el-select v-model="addData.data.snapshotType">
                <el-option v-for="(item, index) in snapshotTypeList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
            <basic-form-item>
              <el-checkbox v-model="addData.data.needMemoryShot">内存快照</el-checkbox>
            </basic-form-item>
            <basic-form-item>
              <el-checkbox v-model="addData.data.isConsistent" disabled>一致性快照</el-checkbox>
            </basic-form-item>
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
import { vmSnapshot } from 'services/platform/index'

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
      snapshotTypeList: [
        {
          name: '普通快照',
          id: 'NORMAL'
        },
        {
          name: '备份点快照',
          id: 'BACKUP'
        },
        {
          name: 'CBT备份',
          id: 'CBTBACKUP'
        }
      ]
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const { id, name, remark, serverId, snapshotType, needMemoryShot, isConsistent } = this.addData.data
          vmSnapshot({ id, name, remark, serverId, snapshotType, needMemoryShot, isConsistent }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
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
