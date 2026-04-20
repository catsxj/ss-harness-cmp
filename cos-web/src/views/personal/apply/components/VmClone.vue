<template>
  <basic-form ref="formRef" :model="cloneData" :status-icon="true" :disabled="disabled" v-bind="$attrs">
    <PreviewItem :item-data="itemData"></PreviewItem>
    <basic-form-item label="名称:" validate="required" prop="name">
      <el-input v-model="cloneData.name"></el-input>
    </basic-form-item>
    <el-tabs v-model="activeName">
      <el-tab-pane :key="index" v-for="(networkCard, index) in cloneData.networkCards" :label="`网卡${index + 1}`" :name="`网卡${index + 1}`">
        <basic-form-item label="网络标签:" validate="required" :prop="`networkCards.${index}.portGroupId`">
          <el-select v-model="networkCard.portGroupId" @change="getIpPool(index)">
            <el-option :label="item.portGroupName" :value="item.id" v-for="(item, index) in networkRelations" :key="index"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="IP地址池:" validate="required">
          <el-row>
            <el-col :span="24">
              <el-radio-group v-model="networkCard.ipPoolId" @change="getIps(networkCard)">
                <el-radio-button :label="item.id" v-for="(item, index) in networkCard.ipPoolList" :key="index">{{ item.name }}</el-radio-button>
              </el-radio-group>
            </el-col>
            <el-col :span="24" class="m-t-xs">
              <el-radio-group v-model="networkCard.ipPolicy" size="small" @change="getIps(networkCard)">
                <el-radio-button label="Auto">自动</el-radio-button>
                <el-radio-button label="Dhcp">DHCP</el-radio-button>
                <el-radio-button label="Manual">手动</el-radio-button>
              </el-radio-group>
              <template v-if="networkCard.ipPolicy && networkCard.ipPolicy === 'Manual'">
                <span v-loading="networkCard.loading" class="text-danger m-l-md w" style="display: inline-block" v-if="!networkCard.freezeIps || !networkCard.freezeIps.length">可用IP数量不足，请切换IP池</span>
                <el-select
                  v-loading="networkCard.loading"
                  placeholder="请输入IP进行搜索"
                  filterable
                  v-else
                  class="m-l-md w"
                  v-model="networkCard.addresses"
                  size="small"
                  multiple
                  @visible-change="(flag) => conditionIpRequest(flag, networkCard)"
                  :filter-method="(query) => ipFilter(query, networkCard)"
                  @change="selectIpChange(networkCard)"
                >
                  <el-option v-for="item in networkCard.showIps" :key="item" :label="item" :value="item" :disabled="calcAddress(networkCard, item)"></el-option>
                </el-select>
              </template>
            </el-col>
          </el-row>
        </basic-form-item>
      </el-tab-pane>
    </el-tabs>
    <basic-form-item label="加入堡垒机：" label-width="120px">
      <el-switch v-model="cloneData.isAddShterm" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
    </basic-form-item>
  </basic-form>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import { cloneDeep, isString } from 'lodash-es'
import { conditionIp, getIp } from 'services/platform/index'
import { getPoolDetail } from 'services/platform/pool'
import PreviewItem from './PreviewItem.vue'
import { Message } from 'element-ui'

type IProps = {
  itemData: any
  disabled: Boolean
}
export default defineComponent({
  components: { PreviewItem },
  props: {
    itemData: {
      type: Object
    },
    disabled: {
      type: Boolean
    }
  },
  setup(props: IProps, context) {
    // 上一个审批节点时传输的 ip 数据(校验时不调用接口)
    const prefixNodeIps: string[] = []
    props.itemData.networkCards.map((item: any) => {
      if (!item.loading) item.loading = false
      if (!item.freezeIps) item.freezeIps = []
      if (!item.showIps) item.showIps = []
      if (isString(item.addresses)) item.addresses = JSON.parse(item.addresses)
      if (item.addresses.length) {
        prefixNodeIps.push(...item.addresses)
      }
    })

    const cloneData = ref(cloneDeep(props.itemData))
    cloneData.value.networkCards.map((item: any) => {
      // 审批回显初始化
      getIps(item, !!context.root.$route.path.includes('apply'))
    })
    // 代码兼容处理
    if (typeof props.itemData.preview === 'string') {
      cloneData.value.preview = JSON.parse(props.itemData.preview)
    }
    const first = cloneData.value.networkCards.length ? '网卡1' : ''
    const activeName = ref(first)
    const networkRelations: any = ref([])
    async function getNetworkRelations() {
      const { poolGroupId } = cloneData.value
      if (!poolGroupId) return Message.error('该云主机下无资源池')
      const data = await getPoolDetail(poolGroupId)
      if (data.success) {
        const res: any = []
        data.data.networkRelations.map((item: any) => {
          const record = res.find((cell: any) => cell.portGroupName == item.portGroupName)
          if (record) {
            record.ips.push({ name: item.ipPoolName, cidr: item.cidr, id: item.ipPoolId })
          } else {
            res.push({ portGroupName: item.portGroupName, id: item.portGroupId, ips: [{ name: item.ipPoolName, cidr: item.cidr, id: item.ipPoolId }] })
          }
        })
        networkRelations.value = res
        cloneData.value.networkCards.map((_: any, index: number) => {
          if (_.ipPoolId) getIpPool(index)
        })
      }
    }
    getNetworkRelations()
    // IP 地址池
    function getIpPool(index: number) {
      const networkCard = cloneData.value.networkCards[index]
      const { portGroupId } = networkCard
      networkCard.ipPoolList = (networkRelations.value as any[]).find((item: any) => item.id === portGroupId).ips
      networkCard.ipPoolId = networkCard.ipPoolId || networkCard.ipPoolList[0]?.id || ''
      if (!networkCard.addresses.length) getIps(networkCard)
    }
    function conditionIpRequest(flag: Boolean, cell: any = {}) {
      // 下拉框出现
      if (flag) return
      const { addresses = [], ipPoolId } = cell
      if (!addresses.length) return
      // 上一个审批节点时传输的,就已经是锁定状态了
      // 以 addresses 为基础, 过滤不在 prefixNodeIps 中的 ip
      const filterAddresses = addresses.filter((ip: string) => !prefixNodeIps.includes(ip))
      if (!filterAddresses.length) return
      conditionIp({
        condition: JSON.stringify({
          condition: 'checkIp',
          poolId: ipPoolId,
          ips: filterAddresses
        })
      }).then((data) => {
        if (!data.success) {
          Message.success(data.message)
          cell.addresses = []
        }
      })
    }
    function selectIpChange(cell: any) {
      if (!cell.addresses.length) cell.showIps = cell.freezeIps.slice(0, 100)
    }
    const selectedIps = computed(() => {
      const ips: string[] = []
      cloneData.value.networkCards.map(({ ipPolicy, addresses }: { ipPolicy: String; addresses: String }) => {
        if (ipPolicy == 'Manual') {
          ips.push(...addresses)
        }
      })
      return ips
    })
    function calcAddress(cell: any, ip: string) {
      // 其他虚机中是否已经选择过 禁用
      let flag = false
      if (selectedIps.value.includes(ip)) flag = true
      // 超出数量禁用
      if (cell.addresses.length >= 1) flag = true
      return flag
    }
    function ipFilter(query = '', cell: any) {
      if (!query) return cell.freezeIps.slice(0, 100)
      // 已过滤
      const arr = cell.freezeIps.filter((ip: string) => ip.includes(query)).slice(0, 100)
      // 合并并去重
      cell.showIps = [...new Set([...arr, ...cell.addresses])]
      return cell.showIps
    }

    function getIps(obj: any, isInit?: Boolean) {
      if (props.disabled) return
      if (obj.ipPolicy != 'Manual' || !obj.ipPoolId) {
        obj.addresses = []
        return
      }
      obj.loading = true
      getIp({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { poolId: obj.ipPoolId, status: 'free', noTargetName: true }, sign: 'EQ' }])
      })
        .then((data: any) => {
          if (data.success) {
            // 空闲的所有 ip
            // Vue 禁止响应式
            const freezeIps: string[] = Object.freeze(data.data.rows.map(({ ip }: { ip: string }) => ip))
            // 校验数量
            if (freezeIps.length) {
              const addresses: string[] = obj.addresses
              // 审批回显
              if (isInit) {
                obj.addresses = addresses
                // 把之前选的放进去
                obj.freezeIps = [...new Set([...addresses, ...freezeIps])]
                obj.showIps = freezeIps.slice(0, 100)
              } else {
                freezeIps.forEach((ip) => {
                  if (addresses.length === 1) return
                  // 原本就在里面 || 没被使用过
                  if (obj.addresses.includes(ip) || !selectedIps.value.includes(ip)) {
                    addresses.push(ip)
                  }
                })
                obj.addresses = addresses
                obj.freezeIps = freezeIps
                obj.showIps = freezeIps.slice(0, 100)
              }
            } else {
              Message.warning('可用 IP 数量不足')
              obj.addresses = []
              obj.ipPoolId = ''
              obj.portGroupId = ''
              obj.ipPolicy = 'Manual'
            }
          }
        })
        .finally(() => (obj.loading = false))
    }

    const formRef = ref()
    function getApplyData() {
      let data = false
      formRef.value.validate((valid: boolean) => {
        if (valid) {
          // 校验手动模式下 IP 地址是否选择
          const flag = cloneData.value.networkCards.every((item: any) => {
            if (item.ipPolicy == 'Manual') {
              return item.addresses.length
            } else return true
          })
          if (flag) data = cloneData.value
        }
      })
      return data
    }
    return {
      networkRelations,
      cloneData,
      getIpPool,
      getIps,
      conditionIpRequest,
      ipFilter,
      calcAddress,
      selectIpChange,
      formRef,
      getApplyData,
      activeName
    }
  }
})
</script>

<style></style>
