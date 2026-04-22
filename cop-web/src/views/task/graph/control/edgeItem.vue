<template>
  <el-dialog title="节点属性" :close-on-click-modal="false" :visible.sync="dialog.visible" width="900px">
    <basic-form ref="taskForm" :model="currentNode">
      <CardLayout title="节点设置">
        <el-row>
          <el-col :span="12">
            <basic-form-item  prop="name" label="输出结果：">
              <el-radio-group v-model="currentNode.condition">
                <el-radio :label="true">成功</el-radio>
                <el-radio :label="false">失败</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
        </el-row>
      </CardLayout>
    </basic-form>
    <div slot="footer" class="dialog-footer" v-if="!isPreview">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="saveNode">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import show from '../mixins/show'

export default {
  mixins: [show],
  props: {
    dialog: {
      type: Object
    },
    currentNode: {
      type: Object
    }
  },
  data () {
    return {
    }
  },
  created () {
    if (!this.currentNode.condition) {
      this.$set(this.currentNode, 'condition', true)
    }
  },
  methods: {
    saveNode () {
      const map = {
        true: '成功',
        false: '失败'
      }
      this.$refs.taskForm.validate(valid => {
        if (valid) {
          this.currentNode.label = map[this.currentNode.condition];
          this.$emit('save', this.currentNode);
          this.dialog.visible = false;
        }
      })
    }
  }
}
</script>
