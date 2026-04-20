<template>
  <div class="count-wrapper">
    <div class="count-image">
      <img :src="imageSrc" alt="" />
    </div>
    <div class="count-content">
      <div class="count-cell" v-for="(row, key) in itemData.data" :key="key">
        <el-tooltip class="item" effect="dark" :open-delay="600" :content="row.name" placement="top-start">
          <div class="count-title">{{ row.name }}</div>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" :open-delay="600" :content="String(row.value) + row.unit" placement="top-start">
          <div class="count-value">{{ row.value }}</div>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api'
const logoMap: any = {
  TCE: 'tenant',
  FUSIONCLOUD: 'huawei',
  MANAGEONE: 'huawei',
  HCSO: 'huawei',
  ACAS: 'aliyun'
}
export default defineComponent({
  props: {
    itemData: {
      type: Object as PropType<{ config: any }>,
      required: true
    }
  },
  setup(props, context) {
    const imageSrc = computed(() => {
      const type = props.itemData.config.dataType.toLocaleLowerCase()
      return `/web-common-resource/img/dashboard/${logoMap[type] || type}.png`
    })
    return {
      imageSrc,
      logoMap
    }
  }
})
</script>
<style lang="scss" scoped>
.count-wrapper {
  display: flex;
  height: 100%;
  overflow: hidden;
  align-items: center;
  .count-image {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
  }
  .count-content {
    display: flex;
    flex-wrap: wrap;
    .count-cell {
      width: 50%;
      display: flex;
      margin-bottom: 10px;
      .count-value {
        font-size: 20px;
        display: flex;
        align-items: flex-end;
      }
      .count-title {
        width: 80px;
        display: flex;
        color: #707274;
        align-items: flex-end;
      }
    }
  }
}
</style>
