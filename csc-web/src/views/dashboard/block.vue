<template>
  <el-col :span="12" class="m-t" :style="{ marginRight: type == PENDING ? '5px' : 0 }">
    <div class="card-dashboard">
      <div class="card-title">{{ title }}</div>
      <div class="card-content">
        <div v-for="(item, index) in listData" :key="index">
          <h2 :style="{ color: loopColor[index] || '#111' }" :class="{ canHover: type == PENDING }" @click="toUrl(index)">{{ item.value }}</h2>
          <p>{{ item.name }}</p>
        </div>
      </div>
    </div>
  </el-col>
</template>
<script>
import { onMounted, ref } from '@vue/composition-api'
import { getWarningData, getPendingData } from '@/services/services/dashboard'
export const PENDING = 'pending'
export const WARNING = 'warning'
const color1 = []
const color2 = ['#E03B3B', '#F09C2B', '#049BD3', '#1E54D5']
export default {
  props: {
    type: String
  },
  computed: {
    title() {
      return this.type == PENDING ? '待处理事项' : '当前告警'
    },
    loopColor() {
      return this.type == PENDING ? color1 : color2
    }
  },
  setup(props, context) {
    const listData = ref([])
    onMounted(async () => {
      const data = props.type == PENDING ? await getPendingData() : await getWarningData({ action: 'pieChart' })
      if (data.success) {
        listData.value = [...data.data]
      }
    })

    const routes = ['/apply', '/order/list?status=unpay', '/cloud_resource/ecs']
    const toUrl = index => {
      if (props.type == PENDING) {
        context.root.$router.push(routes[index])
      }
    }

    return {
      listData,
      PENDING,
      toUrl
    }
  }
}
</script>
<style lang="scss" scoped>
.card-dashboard {
  background: #fff;
  padding: 15px;
  border-radius: 5px;
  color: #333;
  font-size: 12px;
  position: relative;
  .card-title {
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: 700;
  }
  & > a {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #277cfc;
    cursor: pointer;
  }
}
.m-t {
  width: calc(50% - 2.5px);
}
.card-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  & > div {
    text-align: center;
    h2 {
      font-size: 28px;
      font-weight: 400;
      cursor: pointer;
    }
    p {
      font-size: 14px;
    }
    .canHover:hover {
      color: #3d72f4 !important;
    }
  }
}
</style>
