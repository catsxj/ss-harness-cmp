<template>
  <page-layout :title-name="addData.id ? '编辑SLA' : '新增SLA'" @goBack="$router.go(-1)">
    <el-button type="primary" icon="el-icon-check" @click="addSubmit" slot="operate" class="pull-right" :loading="loading">保存</el-button>
    <basic-form :model="addData" ref="formRef" label-width="110px">
      <el-row>
        <el-col :span="24">
          <basic-form-item label="标题：" prop="name" validate="required">
            <el-input v-model="addData.name" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="服务目录：" prop="catalogId" validate="required">
            <el-select v-model="addData.catalogId" placeholder="请选择" @change="getServiceList">
              <el-option v-for="item in catalogList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="服务名称：" prop="serviceId" validate="required">
            <el-select v-model="addData.serviceId" placeholder="请选择">
              <el-option v-for="item in serviceList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="内容：" prop="content">
            <RichEditor :value="addData.content" @change="setContent"></RichEditor>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="描述：" prop="remark">
            <el-input type="textarea" :rows="3" v-model="addData.remark" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
  </page-layout>
</template>
<script lang="ts">
import { defineComponent, ref, Ref } from '@vue/composition-api'
import { Message } from 'element-ui'
import RichEditor from 'components/rich-text-editor/index.vue'
import { getCatalog } from 'services/services/spec'
import { getService } from 'services/services/service'
import { getSlaDetail, modifySla, createSla } from 'services/services/sla'
import { ISla } from '@/models/sla'
import { IService } from '@/models/service'
export default defineComponent({
  components: { RichEditor },
  setup(props, context) {
    // 获取服务目录
    const catalogList = ref([])
    ;(async function () {
      const data = await getCatalog({ page: 1, rows: 9999 })
      if (data.success) {
        catalogList.value = data.data.rows
      }
    })()
    // 获取服务
    const serviceList: Ref<IService[]> = ref([])
    async function getServiceList(catalogId: number) {
      const data = await getService({
        page: 1,
        rows: 9999,
        params: context.root.$tools.handleSearchParam({ catalogId })
      })
      if (data.success) {
        serviceList.value = data.data.rows
      }
    }
    // 新增
    const addData: Ref<ISla> = ref({
      content: ''
    })
    const slaId = context.root.$route.query.id
    if (slaId) {
      getSlaDetail(Number(slaId)).then((res) => {
        if (res.success) {
          addData.value = res.data
          getServiceList(res.data.catalogId as number)
        }
      })
    }
    const loading = ref(false)
    function addSubmit() {
      ;(context.refs.formRef as HTMLFormElement).validate(async (valid: boolean) => {
        if (valid) {
          const http = addData.value.id ? modifySla : createSla
          loading.value = true
          const res = await http(addData.value)
          loading.value = false
          if (res.success) {
            Message({
              message: res.message,
              type: 'success'
            })
            context.root.$router.go(-1)
          }
        }
      })
    }
    // 设置内容
    function setContent(data: string) {
      addData.value.content = data
    }
    return {
      catalogList,
      serviceList,
      getServiceList,
      addData,
      loading,
      addSubmit,
      setContent
    }
  }
})
</script>
