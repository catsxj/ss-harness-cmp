<template>
  <el-dialog :title="addData.id ? '编辑服务' : '新增服务'" :close-on-click-modal="false" :visible.sync="dialog.visible" width="940px">
    <basic-form :model="addData" ref="formRef" label-width="100px">
      <el-row :gutter="10">
        <el-col :span="13">
          <basic-form-item label="服务目录：" prop="catalogId" validate="required">
            <el-select v-model="addData.catalogId" placeholder="请选择" @change="changeCatalog" :disabled="!!addData.id">
              <el-option v-for="item in catalogList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="13" v-if="!操作系统">
          <basic-form-item label="平台类型：" prop="vendorType" validate="required">
            <el-select v-model="addData.vendorType" placeholder="请选择" :disabled="!!addData.id">
              <el-option v-for="item in vendorTypeList" :key="item.vendorType" :label="item.name" :value="item.vendorType"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="13">
          <basic-form-item label="服务名称：" prop="name" validate="required">
            <el-input v-model="addData.name" auto-complete="off" :disabled="addData.isDetail"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="13">
          <basic-form-item label="服务编码：" prop="code" validate="required">
            <el-input v-model="addData.code" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="13" v-if="![7, 8].includes(addData.catalogId)">
          <basic-form-item label="服务单位：" prop="unit">
            <el-input v-model="addData.unit" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="11" class="tip" style="margin-top: 8px"> *服务不需要设置配额时无需设置单位 </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="24">
          <selectIcon :addData="addData" :get-service="getIcon" :remove-service="removeIcon" upload-url="/api/cos/v1/icons" :param="{ category: 'SERVICE' }" :isDisabled="addData.isDetail"></selectIcon>
        </el-col>
        <el-col :span="24" v-if="['operations', 'fabric'].includes(catalogItem.code)">
          <basic-form-item label="作业模板：" prop="templateId" validate="required">
            <el-select placeholder="请选择模板" v-model="addData.templateId">
              <el-option v-for="item in tplListData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="计费状态：">
            <el-switch v-model="addData.billable" :disabled="isPublic" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
            <span class="m-l-sm">{{ addData.billable ? '启用' : '禁用' }}</span>
          </basic-form-item>
        </el-col>
        <el-col :span="24" v-if="addData.catalogId && addData.billable">
          <!-- <template v-if="isPublic === true">
            <basic-form-item>
              <el-radio-group value="custom">
                <el-radio-button label="custom">自定义折扣</el-radio-button>
              </el-radio-group>
            </basic-form-item>
            <basic-form-item label="折扣系数：">
              <el-input-number v-model="addData.discount" :min="0" :precision="2" :max="1"></el-input-number>
            </basic-form-item>
          </template> -->
          <template v-if="!操作系统">
            <template v-if="!isPublic && priceConfigs">
              <basic-form-item label="计费策略：">
                <el-radio-group v-model="addData.billPolicy">
                  <el-radio-button v-for="item in priceConfigs.billPolicy" :label="item.value" :key="item.value">{{ item.name }}</el-radio-button>
                </el-radio-group>
              </basic-form-item>
              <basic-form-item label="基础定价：">
                <basic-table :data="priceConfigs.spec">
                  <el-table-column label="计费项" prop="name" width="100px"> </el-table-column>
                  <el-table-column label="基础规格" width="100px">
                    <template #default="scope"> {{ scope.row.number }}{{ scope.row.spec }} </template>
                  </el-table-column>
                  <el-table-column label="按需计费(元/小时)" v-if="priceConfigs.payWay !== 'postpaid'">
                    <template #default="scope">
                      <el-input-number :min="0" v-model="scope.row.hourPrice" :precision="5"></el-input-number>
                    </template>
                  </el-table-column>
                  <el-table-column label="包月(元/月)">
                    <template #default="scope">
                      <el-input-number :min="0" v-model="scope.row.monthPrice" :precision="5"></el-input-number>
                    </template>
                  </el-table-column>
                  <el-table-column label="包年(元/年)">
                    <template #default="scope">
                      <el-input-number :min="0" v-model="scope.row.yearPrice" :precision="5"></el-input-number>
                    </template>
                  </el-table-column>
                  <div slot="pagination"></div>
                </basic-table>
              </basic-form-item>
            </template>
          </template>
          <template v-else>
            <!-- <basic-form-item label="计费策略：">
              <el-radio-group v-model="addData.billPolicy">
                <el-radio-button v-for="item in priceConfigs.billPolicy" :label="item.value" :key="item.value">{{ item.name }}</el-radio-button>
              </el-radio-group>
            </basic-form-item> -->
            <basic-form-item label="基础定价：">
              <basic-table :data="priceConfigs.spec">
                <el-table-column label="计费项" prop="name" width="80px"> </el-table-column>
                <el-table-column label="基础规格" width="180px">
                  <template #default="scope">
                    <el-cascader v-model="scope.row.specName" :options="osData" :props="{ label: 'name' }"></el-cascader>
                  </template>
                </el-table-column>
                <el-table-column label="按需计费(元/天)" v-if="priceConfigs.payWay !== 'postpaid'">
                  <template #default="scope">
                    <el-input-number :min="0" v-model="scope.row.hourPrice" :precision="5"></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="60px">
                  <template #default="scope">
                    <el-button type="text" @click="handleDelete(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
                <div slot="pagination"></div>
              </basic-table>
              <el-button type="text" @click="handleAdd">添加</el-button>
            </basic-form-item>
          </template>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="服务描述：" prop="remark" validate="required">
            <el-input type="textarea" :rows="10" v-model="addData.remark" auto-complete="off" :maxlength="256"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="submit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { createService, modifyService, getVendorTypes } from 'services/services/service'
import { getTemplateBySimple } from 'services/task/task'
import { getCatalog } from 'services/services/spec'
import SelectIcon from './SelectIcon.vue'
import { getIcon, removeIcon, createIcon } from 'services/services/catelog'
import { getDictChildrenTree } from 'services/platform/index'
import { computed, reactive, ref, toRefs } from '@vue/composition-api'
import { Message } from 'element-ui'
export default {
  components: {
    SelectIcon
  },
  props: {
    dialog: {
      type: Object
    }
  },
  setup(props, context) {
    const priceConfigs = ref(null)
    const catalogItem = ref({ code: '' })
    const 操作系统 = computed(() => {
      return catalogItem.value.name === '操作系统'
    })
    const osData = ref([])
    const getOsData = () => {
      getDictChildrenTree({ value: 'IMAGE_TYPE' }).then((data) => {
        if (data.success) {
          osData.value = data.data
        }
      })
    }
    getOsData()
    const handleAdd = () => {
      priceConfigs.value.spec.push({
        name: '镜像',
        spec: '个',
        number: 1,
        hourPrice: 1,
        monthPrice: 1,
        yearPrice: 1,
        specName: ''
      })
    }
    const handleDelete = (index) => {
      priceConfigs.value.spec.splice(index, 1)
    }
    const setPriceConfigs = (spec) => {
      const { catalogId } = state.addData
      if (!catalogId) {
        priceConfigs.value = null
        return
      }
      const item = catalogList.value.find((item) => item.id === catalogId)
      catalogItem.value = item
      // 获取作业模板
      if (['operations', 'fabric'].includes(item.code)) {
        getTplList()
      }
      const configs = JSON.parse(item?.props)
      if (spec) {
        // spec存在是编辑回现
        configs.spec = spec
      } else {
        // 设置默认计费策略
        const [{ value }] = configs.billPolicy
        state.addData.billPolicy = value
      }
      priceConfigs.value = configs
    }
    // 是否为公有云
    const isPublic = computed(() => {
      const { vendorType } = state.addData
      if (!vendorType) return null
      const item = vendorTypeList.value.find((item) => item.vendorType === vendorType)
      if (item?.public) state.addData.billable = false
      return item?.public
    })

    // 获取作业模板
    const tplListData = ref([])
    async function getTplList() {
      const data = await getTemplateBySimple({
        params: context.root.$tools.handleSearchParam({
          status: 'APPROVED'
          // isMaintain: catalogItem.value.code.includes('operations')
        })
      })
      if (data.success) {
        tplListData.value = data.data.rows
      }
    }
    // 获取服务目录
    const catalogList = ref([])
    async function getCatalogList() {
      const data = await getCatalog({ page: 1, rows: 10000 })
      if (data.success) {
        catalogList.value = data.data.rows.filter((item) => item.code !== 'monitor')
      }
      // 编辑数据回现
      if (record.id) changeCatalog(record.catalogId, record)
    }
    getCatalogList()
    // 切换服务目录 获取平台类型
    async function changeCatalog(catalogId, record = {}) {
      const { basicPrice: spec } = record
      setPriceConfigs(spec && JSON.parse(spec))
      // 非编辑回现
      if (!record.id) {
        state.addData.templateId = ''
        state.addData.vendorType = ''
      }
      getVendorList(catalogId)
    }
    // 产品添加与数据初始化
    const loading = ref(false)
    const { record } = props.dialog
    let addData = {
      discount: 1,
      billPolicy: 'spec',
      vendorType: '',
      billable: false,
      templateId: '',
      isPublic: false
    }
    if (record.id) {
      addData = record
    }
    const state = reactive({
      addData: { ...addData }
    })
    // 获取平台类型
    const vendorTypeList = ref([])
    async function getVendorList(catalogId) {
      const res = await getVendorTypes({
        condition: 'listTypeByCatalogId',
        catalogId
      })
      if (res.success) {
        vendorTypeList.value = res.data
      }
    }
    // 服务添加
    function submit() {
      const { id, iconId, billable } = state.addData
      if (!iconId) {
        return Message({
          message: '请选择图标',
          type: 'warning'
        })
      }
      context.refs.formRef.validate(async (valid) => {
        if (valid) {
          const http = id ? modifyService : createService
          const { basicPrice, billPolicy, icon, ...params } = state.addData
          if (!isPublic.value && billable) {
            // 开启计费并且是私有云
            params.basicPrice = JSON.stringify(priceConfigs.value.spec)
            params.billPolicy = billPolicy
          }
          loading.value = true
          try {
            params.isPublic = isPublic.value
            const data = await http(params)
            if (data.success) {
              Message({
                message: data.message,
                type: 'success'
              })
              props.dialog.visible = false
              context.emit('getData')
            }
            loading.value = false
          } catch (e) {
            loading.value = false
          }
        }
      })
    }
    return {
      catalogItem,
      priceConfigs,
      setPriceConfigs,
      isPublic,
      loading,
      tplListData,
      catalogList,
      vendorTypeList,
      changeCatalog,
      ...toRefs(state),
      submit,
      getIcon,
      removeIcon,
      createIcon,
      操作系统,
      handleDelete,
      handleAdd,
      osData
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-input-number--small {
  width: 150px !important;
}
</style>
