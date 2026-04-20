<template>
  <div>
    <span>{{ first.value }}</span>
    <el-select v-model="suffix.value" class="w" @change="generateRule">
      <el-option v-for="item in suffix.list" :key="item" :value="item" :label="item"></el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'

const props = defineProps<{ cidr: string }>()

interface IpPart {
  value: number
}
interface SuffixPart {
  list: number[]
  value: number
}

const ipParts = reactive({
  first: { value: 0 } as IpPart,
  second: { value: 0 } as IpPart,
  third: {} as Partial<IpPart>,
  four: {} as Partial<IpPart>,
  suffix: { list: [], value: 0 } as SuffixPart
})

function combination(list: number[][]): number[][] {
  return list.reduce<number[][]>((result, subList) => {
    return subList.reduce<number[][]>((subResult, item) => {
      const tail = result.length ? result.map((l) => [...l, item]) : [[item]]
      return subResult.concat(tail)
    }, [])
  }, [])
}

function generateRule() {
  const { cidr } = props
  const [ip, suffixStr] = cidr.split('/')
  const suffixNum = Number(suffixStr)
  const suffixList: number[] = []
  for (let i = suffixNum; i <= 28; i++) {
    suffixList.push(i)
  }
  ipParts.suffix.list = suffixList
  ipParts.suffix.value = ipParts.suffix.value || suffixList[0]
  const [one, two] = ip.split('.')
  ipParts.first.value = Number(one)
  ipParts.second.value = Number(two)
  const arr: number[][] = []
  for (let j = 0; j < ipParts.suffix.value - 8; j++) {
    arr.push([0, 1])
  }
  const res = combination(arr)
  const tailZeros = new Array(16 - ipParts.suffix.value).fill(0).join('')
  // 计算第三位 IP 的候选集合（原始逻辑保留）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _aaa = res.map((item) => parseInt(`${item.join('')}${tailZeros}`, 2))
}

generateRule()

const { first, second, third, four, suffix } = toRefs(ipParts)
void second
void third
void four
</script>
