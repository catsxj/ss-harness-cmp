<template>
  <el-dialog :title="textMap[dialog.type]" :close-on-click-modal="false" :visible.sync="dialog.visible">
    <basic-form :model="addData" ref="addForm" label-width="120px" v-if="type === 'menu'">
      <el-row>
        <el-col :span="24" class="cell-title">基本信息设置</el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="菜单名称：" prop="name" validate="required">
            <el-input v-model="addData.name" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="菜单图标：" prop="icon">
            <el-select clearable v-model="addData.icon" placeholder="请选择图标">
              <el-option v-for="item in iconData" :key="item.value" :label="item.name" :value="item.value">
                <!-- <Icon :type="item.value"></Icon> -->
                {{ item.value }}
              </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="优先级：" prop="priority" validate="required,positiveInteger">
            <el-input v-model="addData.priority" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="是否隐藏：" prop="category" validate="required">
            <el-radio-group v-model="addData.category">
              <el-radio label="menu">否</el-radio>
              <el-radio label="view">是</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="绑定服务：" prop="serviceCodes">
            <el-select clearable v-model="addData.serviceCodes" multiple placeholder="请选择服务">
              <el-option v-for="item in serviceList" :key="item.code" :label="item.name" :value="item.code"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="服务权限设置：" prop="props">
            <el-radio-group v-model="addData.props">
              <el-radio label="isAlwaysShow">总是展示</el-radio>
              <el-radio label="">与服务关联</el-radio>
              <el-radio label="isServiceMenu">主菜单</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="cell-title">路由元设置</el-col>
      </el-row>
      <el-row :gutter="10">
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
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="路由地址：" prop="path" validate="required" maxlength="64">
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
            <basic-form-item label="VALUE:" label-width="80px" validate="required" required-message="请输入VALUE值" :prop="'meta.' + key + '.value'">
              <el-input v-model="item.value"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="4">
            <el-button class="m-t-xs" type="danger" size="mini" @click="removeItem(key, addData.meta)">删除</el-button>
          </el-col>
        </el-row>
        <el-col :span="24" class="m-b">
          <el-button type="primary" size="mini" @click="addItem(addData.meta)">
            <i class="el-icon-plus"></i>
            添加设置
          </el-button>
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
          <el-button type="primary" size="mini" @click="addItem(addData.params)">
            <i class="el-icon-plus"></i>
            添加设置
          </el-button>
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
    <basic-form :model="addData" ref="addForm" label-width="120px" v-if="type === 'api'">
      <el-row>
        <el-col :span="24" class="cell-title">基本信息设置</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="名称：" prop="name" validate="required">
            <el-input v-model="addData.name" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="路径：" prop="path" validate="required">
            <el-input v-model="addData.path" auto-complete="off"></el-input>
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
import { getService } from 'services/services/service'
import { getDictChildren } from 'services/system/dictionary'
export default {
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
      iconData: [],
      type: '',
      serviceList: [],
      loading: false
    }
  },
  created() {
    this.type = this.authtype
    // this.getIcon()
    this.getService()
    if (this.dialog.type === 'update') {
      this.getDetail()
    } else {
      this.addData = {
        tenant: true,
        meta: [],
        params: [],
        category: 'menu',
        priority: 1,
        path: '',
        props: '',
        parentId: this.dialog.id || 0
      }
      switch (this.type) {
        case 'button':
          this.addData.meta = ''
          break
        case 'api':
          this.addData.path = ''
          delete this.addData.meta
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
        if (this.addData.serviceCodes) this.addData.serviceCodes = JSON.parse(this.addData.serviceCodes)
        switch (this.addData.category) {
          case 'button':
            this.type = 'button'
            break
          case 'api':
            this.type = 'api'
            break
          default:
            this.type = 'menu'
            this.addData.meta = JSON.parse(this.addData.meta)
            this.addData.params = JSON.parse(this.addData.params)
            break
        }
      }
    },
    async getService() {
      const data = await getService({ page: 1, rows: 10000 })
      if (data.success) {
        this.serviceList = data.data.rows
      }
    },
    getIcon() {
      getDictChildren({ value: 'AUTH_ICON' }).then((data) => {
        if (data.success) {
          this.iconData = data.data
        }
      })
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
          this.loading = true
          const http = this.addData.id ? modifyAuth : createAuth
          http(this.addData)
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
