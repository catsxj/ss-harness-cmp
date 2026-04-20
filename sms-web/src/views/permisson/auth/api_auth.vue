<template>
  <div>
    <!-- TODO: cmp-element basic-form -->
    <basic-form>
      <el-row class="m-t" :gutter="10" v-loading="loading">
        <el-col :span="12">
          <el-tree ref="apitreeRef" :expand-on-click-node="false" :data="modulesData" node-key="pattern" :props="{ label: 'label', children: 'value' }" @check-change="changeCheckApi">
            <template #default="{ node }">
              <span>
                <span :class="node.label.indexOf(':') > -1 ? 'custom-tree-node' : ''">{{ node.label.split(':')[0] }}</span><span>: {{ node.label.split(':')[1] }}</span>
              </span>
            </template>
          </el-tree>
        </el-col>
      </el-row>
    </basic-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getModules, getModulesByName, updateApi } from 'services/system/role'
import { usePermissionStore } from '@/stores'
import router, { resetRouter } from '@/router'

const permissionStore = usePermissionStore()

const loading = ref(false)
const apiGrantData = ref<any>({ apis: [] })
const modulesData = ref<any[]>([])
const modulesList = ref<any[]>([])
const apitreeRef = ref<any>(null)

onMounted(() => {
  handleApi()
})

function handleApi() {
  apiGrantData.value = { apis: [], selectAll: false }
  modulesList.value = []
  getModulesList()
}

async function getModulesList() {
  loading.value = true
  const data = await getModules()
  if (data.success) {
    loading.value = false
    modulesData.value = data.data
    modulesData.value.forEach((item: any) => {
      item.label = item.name
      item.value.forEach((a: any) => {
        a.label = a.name
        a.value.forEach((b: any) => {
          b.label = `${b.method}: ${b.operation} (${b.url})`
        })
      })
    })
  }
}

async function changeModule(value: string) {
  modulesList.value = []
  apiGrantData.value.selectAll = false
  apiGrantData.value.apis = []
  loading.value = true
  getModulesByName(value).then((data: any) => {
    if (data.success) {
      loading.value = false
      modulesList.value = data.data
      modulesList.value.forEach((item: any) => {
        item.label = item.name
        item.value.forEach((target: any) => {
          target.label = `${target.method}: ${target.operation} (${target.url})`
        })
      })
    }
  })
}

function changeCheckApi(obj: any, isChecked: boolean) {
  if (isChecked) {
    apiGrantData.value.apis.push(obj)
  } else {
    const index = apiGrantData.value.apis.indexOf(obj.pattern)
    if (index != -1) apiGrantData.value.apis.splice(index, 1)
  }
}

function selectAll(val: boolean) {
  const arr: string[] = []
  if (val) {
    modulesList.value.forEach((item: any) => {
      item.value.forEach((target: any) => {
        arr.push(target.pattern)
      })
    })
  }
  apitreeRef.value?.setCheckedKeys(arr)
}

async function changeRoutes() {
  const { asyncRouterMap } = await import('@/router')
  return permissionStore.changeRoutes(asyncRouterMap, router, resetRouter)
}

function apiGrantSubmit() {
  const nodes: any[] = apitreeRef.value?.getCheckedNodes() || []
  const { id, module } = apiGrantData.value
  const apis: any[] = []
  nodes.forEach((item: any) => {
    if (!item.value) apis.push(item)
  })
  loading.value = true
  updateApi(id, { apis, module }).then((data: any) => {
    if (data.success) {
      ElMessage.success(data.message)
      changeRoutes()
    }
    loading.value = false
  })
}

// 保留未使用方法的语义（视图未触发但组件开放接口）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _public = { changeModule, selectAll, apiGrantSubmit }
</script>
