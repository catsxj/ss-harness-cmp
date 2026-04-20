<template>
  <el-dialog :title="dialogTitle" :close-on-click-modal="false" :visible.sync="dialog.dialogFormVisible" width="35%">
    <basic-form :model="addData" ref="addForm">
      <basic-form-item label="选择分组：" prop="categoryId" validate="required" required-message="请选择分组">
        <el-select v-model="addData.categoryId" placeholder="请选择">
          <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="模型名称：" prop="name" validate="required" required-message="请输入模型名称">
        <el-input v-model="addData.name" auto-complete="off"></el-input>
      </basic-form-item>
      <basic-form-item label="模型编码：" prop="code" v-if="!dialog.id" validate="required" required-message="请输入模型编码">
        <el-input v-model="addData.code" auto-complete="off"></el-input>
      </basic-form-item>
      <basic-form-item label="禁用：" prop="disabled" v-if="dialog.id">
        <el-checkbox v-model="addData.disabled"><span class="text-danger">禁用后会冻结该模型下所有配置及关联关系</span></el-checkbox>
      </basic-form-item>
      <select-icon :addData="addData" :get-service="getIcon" :remove-service="removeIcon" upload-url="/api/api/cmc/cmdb/v1/icons"></select-icon>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.dialogFormVisible = false">取消</el-button>
      <el-button type="primary" @click.native="saveModule">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import selectIcon from 'component/select-icon'
import { getModuleCategory, createModule, modifyModule, getModuleDetail } from 'services/cmdb/module'
import { removeIcon, getIcon } from 'services/cmdb/icon'

export default {
  components: {
    selectIcon
  },
  props: {
    category: {},
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      data: {},
      getIcon,
      removeIcon,
      addData: {
        categoryId: this.category,
        icon: '/web-common-resource/img/default_cmdb.png',
        iconId: ''
      },
      dialogTitle: '新增模型',
      categoryList: []
    }
  },
  created() {
    this.getCategory()
    if (this.dialog.id) {
      this.dialogTitle = '编辑模型'
      this.getDetail()
    }
  },
  mounted() {},
  methods: {
    getCategory() {
      getModuleCategory().then(data => {
        if (data.success) {
          this.categoryList = data.data
        }
      })
    },
    getDetail() {
      getModuleDetail(this.dialog.id).then(data => {
        if (data.success) {
          this.addData = data.data
        }
      })
    },
    saveModule() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          if (!this.addData.iconId) return this.$message.error('请选择图标')
          const http = this.dialog.id ? modifyModule : createModule
          http(this.addData).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.dialog.dialogFormVisible = false
              this.$emit('updateMenu')
            }
          })
        }
      })
    }
  }
}
</script>
<style scope></style>
