<template>
  <el-dialog :title="textMap[props.dialog.type]" :close-on-click-modal="false" v-model="props.dialog.visible">
    <!-- TODO: cmp-element basic-form -->
    <basic-form :model="addData" ref="addFormRef" label-width="120px" v-if="type === 'menu'">
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
              <el-radio-button value="menu">否</el-radio-button>
              <el-radio-button value="view">是</el-radio-button>
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
            <el-button class="m-t-xs" type="danger" size="small" @click="removeItem(key, addData.meta)">删除</el-button>
          </el-col>
        </el-row>
        <el-col :span="24" class="m-b">
          <el-button type="primary" size="small" @click="addItem(addData.meta)">
            <el-icon><Plus /></el-icon> 添加设置
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
            <el-button class="m-t-xs" size="small" type="danger" @click="removeItem(key, addData.params)">删除</el-button>
          </el-col>
        </el-row>
        <el-col :span="24" class="m-b">
          <el-button type="primary" size="small" @click="addItem(addData.params)">
            <el-icon><Plus /></el-icon> 添加设置
          </el-button>
        </el-col>
      </el-row>
    </basic-form>
    <basic-form :model="addData" ref="addFormRef" label-width="120px" v-if="type === 'button'">
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
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="props.dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="addSubmit" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAuthDetail, createAuth, modifyAuth } from 'services/system/auth'
import IconSelect from '@/common/components/icon-select/index.vue'
import { usePermissionStore } from '@/stores'
import router, { resetRouter } from '@/router'

interface DialogItem {
  visible: boolean
  id?: number
  type: 'update' | 'create'
}

const props = defineProps<{
  dialog: DialogItem
  authtype: string
}>()
const emit = defineEmits<{
  getData: []
  getButtonList: []
  getApiList: []
}>()

const permissionStore = usePermissionStore()

const textMap: Record<string, string> = { update: '编辑权限', create: '添加权限' }
const addData = ref<any>({})
const type = ref<string>('')
const loading = ref(false)
const addFormRef = ref<any>(null)

async function getDetail() {
  const data = await getAuthDetail(props.dialog.id)
  if (data.success) {
    addData.value = Object.assign({}, data.data)
    switch (addData.value.category) {
      case 'button':
        type.value = 'button'
        break
      default:
        type.value = 'menu'
        addData.value.meta = JSON.parse(addData.value.meta)
        addData.value.params = JSON.parse(addData.value.params)
        break
    }
  }
}

onMounted(() => {
  type.value = props.authtype
  if (props.dialog.type === 'update') {
    getDetail()
  } else {
    addData.value = {
      meta: [],
      params: [],
      category: 'menu',
      priority: 1,
      path: '',
      tenant: false,
      parentId: props.dialog.id || 0
    }
    if (type.value === 'button') {
      addData.value.meta = ''
    } else {
      addData.value.meta = []
    }
  }
})

async function changeRoutes() {
  const { asyncRouterMap } = await import('@/router')
  return permissionStore.changeRoutes(asyncRouterMap, router, resetRouter)
}

function addSubmit() {
  addFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (type.value === 'button') addData.value.category = 'button'
      else if (type.value === 'api') addData.value.category = 'api'
      const http = addData.value.id ? modifyAuth : createAuth
      const { params, meta, ...others } = addData.value
      loading.value = true
      http({
        ...others,
        params: JSON.stringify(params),
        meta: JSON.stringify(meta)
      })
        .then((data: any) => {
          if (data.success) {
            ElMessage.success(data.message)
            props.dialog.visible = false
            if (type.value === 'button') {
              emit('getButtonList')
            } else if (type.value === 'api') {
              emit('getApiList')
            } else {
              if (addData.value.id) changeRoutes()
              emit('getData')
            }
          }
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}

function addItem(data: any[]) {
  data.push({})
}

function removeItem(key: number, data: any[]) {
  data.splice(key, 1)
}
</script>

<style lang="scss" scoped>
.cell-title {
  border-left: 2px solid #1890ff;
  padding-left: 5px;
  margin-bottom: 5px;
}
</style>
