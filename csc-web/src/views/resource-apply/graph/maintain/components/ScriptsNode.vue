<template>
  <div>
    <draggable v-model="scripts" handle=".el-icon-rank" animation="200">
      <transition-group type="transition">
        <card-layout :title="item.scriptName" v-for="(item, index) in scripts" :key="`${item.scriptId}${index}`">
          <template #operate>
            <el-button type="text" icon="el-icon-rank" style="cursor: move"></el-button>
            <el-button type="text" @click="selectScript(index)">选择查看脚本</el-button>
            <el-button type="text" @click="addScript(index)" :disabled="isPreview">添加</el-button>
            <el-button type="text" @click="removeScript(index)" :disabled="isPreview">删除</el-button>
          </template>
          <basic-form ref="formRef" :disabled="isPreview" :model="item">
            <el-row :gutter="10">
              <el-col :span="12">
                <basic-form-item label="主脚本：">
                  <el-switch v-model="item.runnable"> </el-switch>
                </basic-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12">
                <basic-form-item label="脚本所属组：">
                  <el-input v-model="item.group"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="12">
                <basic-form-item label="脚本所属人：">
                  <el-input v-model="item.owner"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="12">
                <basic-form-item label="脚本权限：">
                  <el-input v-model="item.mode"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="12">
                <basic-form-item label="执行路径：" validate="required" prop="dest">
                  <el-input v-model="item.dest"></el-input>
                </basic-form-item>
              </el-col>
              <el-col :span="12">
                <basic-form-item label="脚本执行人：">
                  <el-input v-model="item.operator"></el-input>
                </basic-form-item>
              </el-col>
            </el-row>
            <el-divider content-position="left" v-if="item.params.length">脚本参数</el-divider>
            <el-row :gutter="10">
              <el-col :span="12" v-for="(cell, index) in item.params" :key="index">
                <basic-form-item :label="`${cell.key}：`" show-overflow-tooltip>
                  <el-input v-model="cell.value"></el-input>
                </basic-form-item>
              </el-col>
            </el-row>
          </basic-form>
        </card-layout>
      </transition-group>
    </draggable>
    <el-dialog title="选择脚本" :visible.sync="dialogVisible" append-to-body v-if="dialogVisible">
      <basic-form :model="scripts[currentIndex]" ref="scriptForm">
        <select-script-item ref="scriptItem" :script-item="scripts[currentIndex]" class="text-left"><span v-if="isPreview || isTaskInstance"></span> </select-script-item>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="scriptSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'
import SelectScriptItem from '../SelectScript.vue'
import draggable from 'vuedraggable'
const defaultParam = {
  scriptName: '未选择脚本',
  scriptId: '',
  // groupId: [],
  category: 'SHELL',
  content: '',
  runnable: true,
  params: []
}
export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Array,
      default: function () {
        return [{ ...defaultParam }]
      }
    }
  },
  components: {
    SelectScriptItem,
    draggable
  },
  data() {
    return {
      dialogVisible: false,
      currentIndex: 0,
      scripts: [...this.itemData]
    }
  },
  methods: {
    addScript(index) {
      this.scripts.splice(index + 1, 0, { ...defaultParam })
    },
    removeScript(index) {
      if (this.scripts.length === 1) return this.$message.error('至少存在一个脚本节点')
      this.scripts.splice(index, 1)
    },
    selectScript(index) {
      this.currentIndex = index
      this.dialogVisible = true
    },
    scriptSubmit() {
      this.$refs.scriptForm.validate((valid) => {
        if (valid) {
          this.dialogVisible = false
        }
      })
    },
    getPostData() {
      const { scripts } = this
      // 脚本参数校验
      let validateRes = true
      for (let i = 0, len = scripts.length; i < len; i++) {
        let flag = false
        const item = scripts[i]
        this.$refs.formRef[i].validate((valid) => {
          if (valid && item.scriptId) {
            flag = true
          }
        })
        if (!flag) {
          validateRes = false
          break
        }
      }
      if (!validateRes) {
        this.$message.error('脚本节点参数缺失，请检查是否【选择脚本】或者填写【执行路径】')
        return false
      }
      return {
        scripts: scripts.map((item, index) => {
          return {
            ...item,
            index
          }
        })
      }
    }
  }
}
</script>
<style></style>
