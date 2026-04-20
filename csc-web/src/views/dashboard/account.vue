<template>
  <el-col :span="24" class="m-t">
    <div class="card-dashboard">
      <div class="card-title">账户消费统计</div>
      <div class="account-statistic">
        <div class="account-infos">
          <div>
            <h2>￥{{ accountData.data }}</h2>
            <p>消费总额</p>
          </div>
          <!-- <div>
            <h2>￥{{accountData.balanceFree}}</h2>
            <p>可用金额</p>
          </div> -->
        </div>
        <div class="account-bar">
          <h2>6个月消费总计: ￥{{ money.toFixed(2) }}</h2>
          <bar-charts height="260px" width="100%" :options="options" :data="monthData" />
        </div>
      </div>
    </div>
  </el-col>
</template>
<script>
import { getMonthData } from 'services/services/dashboard.js'
import { onMounted, ref, computed } from '@vue/composition-api'
import { getOrderStatus } from 'services/charts/order'

export default {
  setup(props, context) {
    const userData = computed(() => context.root.$store.state.app.userData)
    const accountData = ref({})
    const monthData = ref({})
    const money = ref(0)
    const options = ref({})

    const getStartOrEndDate = (date, type) => {
      const getYear = date => date.getFullYear()
      const getMonth = date => date.getMonth() + 1
      const getDate = date => date.getDate()
      const wrapper = num => (num > 9 ? num : '0' + num)
      return `${getYear(date)}-${wrapper(getMonth(date))}-${type ? '01' : wrapper(getDate(date))}`
    }

    onMounted(async () => {
      const tenantId = userData.value.tenantId || userData.value.tenantAccount.tenantId
      // const data = await getAccountInfos(tenantId)
      const accountParams = {
        condition: 'totalBillsByTenant'
      }
      const data = await getMonthData(JSON.stringify(accountParams))
      if (data.success) {
        accountData.value = { ...data }
      }
      // 6个月消费
      const params = {
        condition: 'incomeTrend',
        cycle: 'MONTH',
        end: `${getStartOrEndDate(new Date())} 23:59:59`
      }
      const startDate = new Date()
      startDate.setMonth(new Date().getMonth() - 5)
      params.start = `${getStartOrEndDate(startDate, 1)} 00:00:00`
      const response = await getMonthData(JSON.stringify(params))
      if (response.success) {
        monthData.value = { ...response.data, keys: response.data.keys.map(item => Number(item.split('-')[1]) + '月') }
        money.value = monthData.value.values[0].data.reduce((pre, cur) => pre + cur)
        options.value = {
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: monthData.value.values[0]?.data,
              type: 'bar',
              barWidth: 20,
              itemStyle: {
                color: '#3E74F8'
              }
            }
          ]
        }
      }
    })

    return {
      accountData,
      monthData,
      money,
      options
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
.account-statistic {
  display: flex;
  & > div:first-child {
    width: 30%;
    border-right: solid 1px #eee;
  }
  & > div:last-child {
    flex-grow: 1;
    padding: 0 20px;
  }
}
.account-infos {
  display: flex;
  justify-content: space-around;
  align-items: center;
  & > div {
    text-align: center;
    h2 {
      font-size: 20px;
    }
    p {
      font-size: 14px;
    }
  }
}
</style>
