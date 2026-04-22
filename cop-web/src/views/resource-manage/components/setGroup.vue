<!-- 组-网关/worker配置 -->
<template>
  <el-dialog title="配置" :visible.sync="setData.dialog">
    <basic-form :model="setData.data" ref="data">
      <basic-form-item label="实例: " prop="instance">
        <el-input v-model="setData.data.instance" disabled></el-input>
      </basic-form-item>
      <basic-form-item label="超级worker: " prop="isSuper">
        <el-switch
          v-model="setData.data.isSuper"
          active-color="#13ce66"
          inactive-color="#ff4949">
        </el-switch>
      </basic-form-item>
      <basic-form-item label="分组: " prop="groupId" validate="required">
        <el-select v-model="setData.data.groupId">
          <el-option v-for="(item, index) in groupData" :key="'group-' + index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="setData.dialog = false">取消</el-button>
      <el-button type="primary" @click.native="ok">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getBsmHostGroup, setBsmHostWorker } from '@/services/task/resource'
export default {
  props: {
    setData: Object
  },
  data() {
    return {
      groupData: []
    }
  },
  created() {
    this.getGroups()
  },
  methods: {
    getGroups() {
      getBsmHostGroup({ parentId: 0 }).then((res) => {
        if (res.success) {
          this.groupData = res.data
        }
      })
    },
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          const { id: workerId, groupId, isSuper } = this.setData.data
          setBsmHostWorker({ workerId, groupId, isSuper }).then((res) => {
            const type = res.success ? 'success' : 'error'
            this.$message[type](res.message)
            if (res.success) {
              this.$emit('setOk')
              this.setData.dialog = false
            }
          })
        }
      })
    }
  }
}
</script>
