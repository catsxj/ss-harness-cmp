<template>
  <!-- TODO: cmp-element - 自研包在 compat 层处理：basic-form / basic-form-item -->
  <basic-form :model="addData" ref="addFormRef" label-width="120px">
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item :label="appStore.systemConfig.projectConfigLabel + '名称: '" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item :label="appStore.systemConfig.projectConfigLabel + '编号: '" prop="code" validate="required">
          <el-input v-model="addData.code" auto-complete="off" clearable></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="组织机构: ">
          <el-cascader v-model="addData.departs" :props="{ label: 'name', value: 'id', checkStrictly: true }" :options="getDepartLazyData" clearable filterable></el-cascader>
        </basic-form-item>
      </el-col>
      <el-col :span="24" v-if="addData.budget">
        <basic-form-item label="预算总量: " prop="money" validate="required">
          <el-input placeholder="请输入内容" v-model.number="addData.money">
            <template #append>元</template>
          </el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24" v-if="addData.budget">
        <basic-form-item label="预算阈值: " prop="budgetThreshold" validate="required">
          <el-input placeholder="请输入内容" v-model.number="addData.budgetThreshold">
            <template #append>%</template>
          </el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item :label="appStore.systemConfig.serviceConfigLabel + '：'" prop="businessId" validate="required">
          <el-select v-model="addData.businessId" clearable>
            <el-option v-for="item in businessNameList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="描述: " prop="remark">
          <el-input type="textarea" v-model="addData.remark" auto-complete="off" clearable></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { getBizs } from 'services/system/bizs'
import { getDepart } from 'services/system/depart'

defineProps<{ callback?: (...args: any[]) => void }>()

const appStore = useAppStore()

// TODO: type - 项目表单类型后续补 interface
const addData = ref<Record<string, any>>({ visibility: 'manageable' })
const businessNameList = ref<any[]>([])
const getDepartLazyData = ref<any[]>([])

// TODO: type - basic-form 实例类型由 compat 层提供
const addFormRef = ref<any>(null)

function getList() {
  getBizs({ page: 1, rows: 9999 }).then((data: any) => {
    if (data.success) {
      businessNameList.value = data.data.rows
    }
  })
}

function getDepartLazyList() {
  getDepart({ parentId: 0 }).then((res: any) => {
    if (res.success) {
      getDepartLazyData.value = res.data
    }
  })
}

async function getPostData(): Promise<Record<string, any> | false> {
  let data: Record<string, any> | false = false
  await new Promise<void>((resolve) => {
    addFormRef.value?.validate((valid: boolean) => {
      if (valid) {
        data = addData.value
      }
      resolve()
    })
  })
  return data
}

onMounted(() => {
  getList()
  getDepartLazyList()
})

defineExpose({ getPostData, addData })
</script>

<style></style>
