<template>
  <div>
    <span>{{ first.value }}</span>
    <el-select v-model="suffix.value" class="w" @change="generateRule">
      <el-option v-for="item in suffix.list" :key="item" :value="item" :label="item"></el-option>
    </el-select>
  </div>
</template>
<script>
import { reactive, toRefs } from '@vue/composition-api'
export default {
  props: {
    cidr: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const ipParts = reactive({
      first: {
        value: 0
      },
      second: {
        value: 0
      },
      third: {},
      four: {},
      suffix: {
        list: [],
        value: 0
      }
    })
    function combination(list) {
      return list.reduce((result, subList) => {
        console.log(result)
        return subList.reduce((subResult, item) => {
          const tail = result.length ? result.map((l) => [...l, item]) : [[item]]
          console.log(tail)
          return subResult.concat(tail)
        }, [])
      }, [])
    }

    function generateRule() {
      const { cidr } = props
      const [ip, suffix] = cidr.split('/')
      // 后缀选择数据处理
      const suffixList = []
      for (let i = suffix; i <= 28; i++) {
        suffixList.push(i)
      }
      ipParts.suffix.list = suffixList
      ipParts.suffix.value = ipParts.suffix.value || suffixList[0]
      // ip处理
      const [one, two, three, four] = ip.split('.')
      ipParts.first.value = one
      // 第二位IP处理
      ipParts.second.value = two
      const arr = []
      for (let j = 0; j < ipParts.suffix.value - 8; j++) {
        arr.push([0, 1])
      }
      const res = combination(arr)
      const bbb = new Array(16 - ipParts.suffix.value).fill(0).join('')
      const aaa = res.map((item) => {
        return parseInt(`${item.join('')}${bbb}`, 2)
      })
    }
    generateRule()
    return {
      ...toRefs(ipParts),
      generateRule
    }
  }
}
</script>
