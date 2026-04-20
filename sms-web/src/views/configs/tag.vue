<template>
  <div>
    <AdvanceTable title="标签列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate('add')"> <i class="el-icon-plus"></i> 新增 </el-button>
      </template>
      <!-- <template #name="val">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
        <span class="detail-href">{{ val }}</span>
      </template> -->
      <template #values="values">
        <el-tag type="success" :key="index" v-for="(tag, index) in values" :disable-transitions="false">
          {{ tag }}
        </el-tag>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate('edit', record)" :disabled="record.personal"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)" :disabled="record.personal"> <i class="el-icon-delete"></i> 删除 </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" width="700px" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible">
      <basic-form :model="addData" ref="addData">
        <basic-form-item label="标签名称: " prop="name" validate="required" maxlength="64">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
        <basic-form-item label="标签值: " validate="required">
          <el-tag :key="index" v-for="(tag, index) in addData.values" closable :disable-transitions="false" @close="handleClose(tag)">
            {{ tag }}
          </el-tag>
          <el-input class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm"> </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">新增值</el-button>
        </basic-form-item>
        <basic-form-item label="标签描述: " prop="remark" :maxlength="128">
          <el-input type="textarea" v-model="addData.remark" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="submit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTags, createTag, modifyTag, removeTag, getTagsDetail } from 'services/system/tag'
export default {
  data() {
    return {
      searchConfigs: [
        { label: '名称', value: 'name', type: 'Input' },
        { type: 'Const', value: 'tenantId', initValue: 0 }
      ],
      columns: [
        {
          label: '标签名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' },
          width: '160px'
        },
        {
          label: '标签内容',
          prop: 'values',
          scopedSlots: { customRender: 'values' }
        },
        {
          label: '标签描述',
          prop: 'remark'
        },
        {
          label: '操作',
          disabled: true,
          width: '160px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      textMap: {
        update: '编辑标签',
        create: '新增标签'
      },
      dialogStatus: 'create',
      addData: {
        values: []
      },
      addDialogVisible: false,
      inputValue: '',
      inputVisible: false
    }
  },
  watch: {
    inputValue(val) {
      if (val.length > 50) {
        this.inputValue = val.slice(0, 50)
        return this.$message.error('标签值字符长度不能超过50位')
      }
    }
  },
  methods: {
    handleClose(tag) {
      this.addData.values.splice(this.addData.values.indexOf(tag), 1)
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        this.addData.values.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    async getList() {
      this.loading = true
      const res = await getTags(this.params)
      if (res.success) {
        this.list = res.data.rows
        this.total = res.data.total
      }
      this.loading = false
    },
    handleCreate(type, record) {
      switch (type) {
        case 'add':
          this.addData = {
            values: []
          }
          this.dialogStatus = 'create'
          this.addDialogVisible = true
          break
        case 'edit':
          this.dialogStatus = 'update'
          this.addDialogVisible = true
          this.addData = Object.assign({}, record)
          if (this.addData.content) {
            this.addData.content = JSON.parse(this.addData.content)
          }
          break
      }
    },
    async submit() {
      this.$refs.addData.validate((valid) => {
        if (!valid || !this.addData.values.length) {
          return this.$message.warning('缺少必填项！')
        }
        this.loading = true
        if (this.dialogStatus === 'create') {
          const params = { ...this.addData, id: 0 }
          createTag(params).then((res) => {
            if (res.success) {
              this.getList()
              this.addDialogVisible = false
              this.$message.success(res.message)
            }
            this.loading = false
          })
        } else {
          this.addData.content = JSON.stringify(this.addData.values.filter((item) => item))
          modifyTag(this.addData).then((res) => {
            if (res.success) {
              this.getList()
              this.addDialogVisible = false
              this.$message.success(res.message)
            }
            this.loading = false
          })
        }
      })
    },
    async remove(id) {
      this.$confirm('您确定要删除该标签吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeTag(id).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.getList()
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
