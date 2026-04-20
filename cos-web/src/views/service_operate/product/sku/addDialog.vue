<template>
  <el-dialog :title="dialog.record.id ? '编辑规格' : '新增规格'" :close-on-click-modal="false" :visible.sync="dialog.visible">
    <basic-form :model="addData" ref="formRef">
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="规格代码：" prop="code" validate="required">
            <el-input v-model="addData.code"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="资费代码：" prop="tariffCode">
            <el-input v-model="addData.tariffCode"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-for="(item, key) in addData.spec" :key="item.specName">
          <basic-form-item v-if="item.specName" :label="`${item.displayName}：`" :prop="`spec.${key}.specValue`" validate="required,positiveInteger">
            <el-input v-model="item.specValue">
              <template slot="append" v-if="item.unit">{{ item.unit }}</template>
            </el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="18" v-if="serviceItem.billable">
          <basic-form-item label="基础定价：">
            <basic-table :data="[{}]">
              <el-table-column label="按需计费(元/小时)">
                <template>
                  <basic-form-item prop="hourPrice" validate="required" v-if="serviceItem.billPolicy === 'spec'">
                    <el-input-number :min="0" v-model="addData.hourPrice" :precision="5"></el-input-number>
                  </basic-form-item>
                  <span v-else>{{ getPrice('hourPrice') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="包月(元/月)">
                <template>
                  <basic-form-item prop="monthPrice" validate="required" v-if="serviceItem.billPolicy === 'spec'">
                    <el-input-number :min="0" v-model="addData.monthPrice" :precision="5"></el-input-number>
                  </basic-form-item>
                  <span v-else>{{ getPrice('monthPrice') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="包年(元/年)">
                <template>
                  <basic-form-item prop="yearPrice" validate="required" v-if="serviceItem.billPolicy === 'spec'">
                    <el-input-number :min="0" v-model="addData.yearPrice" :precision="5"></el-input-number>
                  </basic-form-item>
                  <span v-else>{{ getPrice('yearPrice') }}</span>
                </template>
              </el-table-column>
              <div slot="pagination"></div>
            </basic-table>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="描述：" prop="remark">
            <el-input type="textarea" v-model="addData.remark" auto-complete="off" :maxlength="256"></el-input>
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
<script lang="ts">
import { computed, defineComponent, ref, Ref } from '@vue/composition-api'
import { Message, Form } from 'element-ui'
import { getPrice as getPrices } from './utils'
import { createSku, modifySku, getCatalogDetail } from 'services/services/spec'
interface IProps {
  dialog: Base.IDialog & {
    serviceItem: any
  }
}
export default defineComponent({
  props: {
    dialog: {
      type: Object
    }
  },
  setup(props: IProps, context) {
    // 初始化数据添加
    const { record, serviceItem } = props.dialog
    let add = {
      spec: []
    }
    if (record.id) {
      add = {
        ...record,
        spec: JSON.parse(record.spec)
      }
    } else {
      getConfigs()
    }

    const addData: Ref<any> = ref(add)
    // 获取配置信息
    async function getConfigs() {
      const res = await getCatalogDetail(serviceItem.catalogId)
      if (res.success) {
        addData.value.spec = JSON.parse(res.data.props).spec.map((item: any) => {
          const { name: displayName, spec: unit, specName } = item
          return {
            specName,
            displayName,
            unit,
            specValue: ''
          }
        })
      }
    }
    // 灵活计费计算价格
    function getPrice(type: string) {
      return getPrices(type, serviceItem, addData.value)
    }
    // 规格添加
    const loading = ref(false)
    function submit() {
      ;(context.refs.formRef as Form).validate(async (valid: boolean) => {
        if (valid) {
          loading.value = true
          const http = addData.value.id ? modifySku : createSku
          const { id: serviceId, code: serviceCode, categoryId, catalogId } = serviceItem
          try {
            const res = await http({
              ...addData.value,
              serviceCode,
              serviceId,
              categoryId,
              catalogId
            })
            loading.value = false
            if (res.success) {
              props.dialog.visible = false
              Message.success(res.message)
              context.emit('getData')
            }
          } catch (e) {
            loading.value = false
          }
        }
      })
    }
    return {
      addData,
      serviceItem,
      loading,
      submit,
      getPrice
    }
  }
})
</script>

<style scoped></style>
