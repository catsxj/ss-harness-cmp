<template>
  <el-dialog :title="textMap[dialog.type]" :close-on-click-modal="false" :visible.sync="dialog.visible">
    <basic-form :model="addData" ref="addForm" label-width="120px" v-if="type === 'menu'">
      <el-row>
        <el-col :span="24" class="cell-title">基本信息设置</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="菜单名称：" prop="name" validate="required">
            <el-input v-model="addData.name" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="菜单图标：" prop="icon">
            <icon-select v-model="addData.icon" />
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="优先级：" prop="priority" validate="required,positiveInteger">
            <el-input v-model="addData.priority" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="是否隐藏：" prop="category" validate="required">
            <el-radio-group v-model="addData.category">
              <el-radio-button label="menu">否</el-radio-button>
              <el-radio-button label="view">是</el-radio-button>
            </el-radio-group>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="cell-title">路由元设置</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="路由名称：" prop="router">
            <el-input v-model="addData.router" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="组件名称：" prop="component">
            <el-input v-model="addData.component" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="路由地址：" prop="path" validate="required" maxlength="256">
            <el-input v-model="addData.path" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="重定向地址：" prop="redirect">
            <el-input v-model="addData.redirect" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="cell-title">META设置</el-col>
      </el-row>
      <el-row>
        <el-row :gutter="20" v-for="(item, key) in addData.meta" :key="'meta' + key">
          <el-col :span="10">
            <basic-form-item label="KEY:" label-width="80px" validate="required" required-message="请输入KEY值" :prop="'meta.' + key + '.key'">
              <el-input v-model="item.key"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="10">
            <basic-form-item label="VALUE:" label-width="80px" validate="required" required-message="请输入VALUE值" :prop="'meta.' + key + '.value'" maxlength="256">
              <el-input v-model="item.value"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="4">
            <el-button class="m-t-xs" type="danger" size="mini" @click="removeItem(key, addData.meta)">删除</el-button>
          </el-col>
        </el-row>
        <el-col :span="24" class="m-b">
          <el-button type="primary" size="mini" @click="addItem(addData.meta)" icon="el-icon-plus"> 添加设置 </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="cell-title">PARAMS设置</el-col>
      </el-row>
      <el-row>
        <el-row :gutter="20" v-for="(item, key) in addData.params" :key="key">
          <el-col :span="10">
            <basic-form-item label="KEY：" label-width="80px" validate="required" required-message="请输入KEY值" :prop="'params.' + key + '.key'">
              <el-input v-model="item.key"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="10">
            <basic-form-item label="VALUE：" label-width="80px" validate="required" required-message="请输入VALUE值" :prop="'params.' + key + '.value'">
              <el-input v-model="item.value"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="4">
            <el-button class="m-t-xs" size="mini" type="danger" @click="removeItem(key, addData.params)">删除</el-button>
          </el-col>
        </el-row>
        <el-col :span="24" class="m-b">
          <el-button type="primary" size="mini" @click="addItem(addData.params)" icon="el-icon-plus"> 添加设置 </el-button>
        </el-col>
      </el-row>
    </basic-form>
    <basic-form :model="addData" ref="addForm" label-width="120px" v-if="type === 'button'">
      <el-row>
        <el-col :span="24" class="cell-title">基本信息设置</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="按钮名称：" prop="name" validate="required">
            <el-input v-model="addData.name" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="按钮编码：" prop="meta" validate="required">
            <el-input v-model="addData.meta" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getAuthDetail, createAuth, modifyAuth } from 'services/system/auth'
import IconSelect from '@/common/components/icon-select/index.vue'
export default {
  components: { IconSelect },
  props: {
    dialog: {
      type: Object
    },
    authtype: {
      type: String
    }
  },
  data() {
    return {
      textMap: {
        update: '编辑权限',
        create: '添加权限'
      },
      addData: {},
      type: '',
      loading: false
    }
  },
  created() {
    this.type = this.authtype
    if (this.dialog.type === 'update') {
      this.getDetail()
    } else {
      this.addData = {
        meta: [],
        params: [],
        category: 'menu',
        priority: 1,
        path: '',
        tenant: false,
        parentId: this.dialog.id || 0
      }
      switch (this.type) {
        case 'button':
          this.addData.meta = ''
          break
        default:
          this.addData.meta = []
          break
      }
    }
  },
  methods: {
    async getDetail() {
      const data = await getAuthDetail(this.dialog.id)
      if (data.success) {
        this.addData = Object.assign({}, data.data)
        switch (this.addData.category) {
          case 'button':
            this.type = 'button'
            break
          default:
            this.type = 'menu'
            this.addData.meta = JSON.parse(this.addData.meta)
            this.addData.params = JSON.parse(this.addData.params)
            break
        }
      }
    },
    async addSubmit() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          switch (this.type) {
            case 'button':
              this.addData.category = 'button'
              break
            case 'api':
              this.addData.category = 'api'
              break
          }
          const http = this.addData.id ? modifyAuth : createAuth
          const { params, meta, ...others } = this.addData
          this.loading = true
          http({
            ...others,
            params: JSON.stringify(params),
            meta: JSON.stringify(meta)
          })
            .then((data) => {
              if (data.success) {
                this.$message({
                  message: data.message,
                  type: 'success'
                })
                this.dialog.visible = false
                switch (this.type) {
                  case 'button':
                    this.$emit('getButtonList')
                    break
                  case 'api':
                    this.$emit('getApiList')
                    break
                  default:
                    // 编辑权限时更新路由
                    if (this.addData.id) {
                      this.$store.dispatch('permission/ChangeRoutes')
                    }
                    this.$emit('getData')
                    break
                }
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    addItem(data) {
      data.push({})
    },
    removeItem(key, data) {
      data.splice(key, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.cell-title {
  border-left: 2px solid #1890ff;
  padding-left: 5px;
  margin-bottom: 5px;
}
</style>
