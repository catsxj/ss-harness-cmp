<template>
  <el-tabs value="price">
    <el-tab-pane label="基础定价" name="price">
      <basic-table :data="JSON.parse(data.basicPrice)">
        <el-table-column label="计费项" prop="name"> </el-table-column>
        <el-table-column label="基础规格">
          <template #default="scope">
            <span v-if="data.catalogName === '操作系统'">{{ scope.row.specName.join(' / ') }}</span>
            <span v-else> {{ scope.row.number }}{{ scope.row.spec }} </span>
          </template>
        </el-table-column>
        <template v-if="!操作系统">
          <el-table-column label="按需计费(元/小时)">
            <template #default="scope">
              {{ scope.row.hourPrice }}
            </template>
          </el-table-column>
          <el-table-column label="包月(元/月)">
            <template #default="scope">
              {{ scope.row.monthPrice }}
            </template>
          </el-table-column>
          <el-table-column label="包年(元/年)">
            <template #default="scope">
              {{ scope.row.yearPrice }}
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column label="按需计费(元/天)">
            <template #default="scope">
              {{ scope.row.hourPrice }}
            </template>
          </el-table-column>
        </template>
        <div slot="pagination"></div>
      </basic-table>
    </el-tab-pane>
    <el-tab-pane label="服务类型" name="type" lazy v-if="data.hasCategory">
      <ServiceCategory :data="data"></ServiceCategory>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import ServiceCategory from './ServiceCategory.vue'
import { defineComponent, computed } from '@vue/composition-api'
export default defineComponent({
  components: { ServiceCategory },
  props: {
    data: {
      type: Object
    }
  },
  setup(props, { root }) {
    const 操作系统 = computed(() => {
      return props.data.catalogName === '操作系统'
    })
    return {
      操作系统
    }
  }
})
</script>
