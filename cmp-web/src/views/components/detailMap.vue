<template>
  <div>
    <el-row type="flex" justify="space-between">
      <el-col :span="Math.ceil(24 / list.length)" class="row_margin box" v-for="(item, index) in list" :key="index">
        <el-col :span="8" class="box_left box_name">
          <!-- <img v-if="item.img" :src="item.img" class="images" alt=""> -->
          <div>{{ item.name }}</div>
        </el-col>
        <el-col :span="16" class="box_value">
          <div v-if="item.type == 'vcenter' || item.type == 'inspurRail'">
            <div v-for="(obj, index) in detail[item.value]" :key="index" :title="!obj.address ? '' : obj.address + (!obj.networkName ? '' : '(' + obj.networkName + ')')">
              {{ !obj.address ? '' : obj.address + (!obj.networkName ? '' : '(' + obj.networkName + ')') }}
            </div>
          </div>
          <div v-else-if="item.type == 'tianyi'">
            <div v-for="(obj, index) in detail[item.value]" :title="obj" :key="index">（内网）{{ obj }}</div>
            <div v-if="item.value2 && detail[item.value2]" :title="detail[item.value2]">（公网）{{ detail[item.value2] }}</div>
          </div>
          <div v-else-if="item.type == 'cecstack' || item.type == 'cnware' || item.type == 'h3c' || item.type === 'qcloud' || item.type === 'aliyun' || item.type === 'azure'">
            <div v-for="(obj, index) in detail[item.value]" :title="obj.address || obj" :key="index">(内网){{ !(obj.address || obj) ? '' : (obj.address || obj) + (!obj.networkName ? '' : '(' + obj.networkName + ')') }}</div>
            <div v-if="item.value2">
              <div v-for="(obj, index) in detail[item.value2]" :title="obj.address || obj" :key="index">(公网){{ obj.address || obj }}</div>
            </div>
          </div>
          <div v-else-if="item.type == 'huawei'">
            <div v-for="item in detail[item.value]" :key="item.address" :title="item">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </div>
          <div v-else :title="detail[item.value]">
            <div v-if="Array.isArray(detail[item.value])">
              <div v-for="(arr, index1) in detail[item.value]" :key="index1">{{ arr }}{{ item.unit }}</div>
            </div>
            <div v-else>{{ detail[item.value] }}{{ item.unit }}</div>
          </div>
        </el-col>
        <div style="clear: both"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
/* global $ */
export default {
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    },
    list: {
      type: Array
    }
  },
  data() {
    return {}
  },
  methods: {},
  created() {}
}
</script>

<style scoped lang="scss">
.box {
  position: relative;
  text-align: center;
  min-height: 87px;
}
.box_left {
  height: 100%;
  color: #fff;
  background-color: #649afd;
  font-size: 16px;
  font-weight: bold;
}
.box_name {
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.box_value {
  height: 100%;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  // line-height: 85px;
  color: #fff;
  background-color: #5a94ff;
  font-size: 20px;
  font-weight: bold;
}
.images {
  width: 50px;
}
.row_margin {
  margin-right: 10px;
}
.row_margin:nth-last-of-type(1) {
  margin-right: 0px;
}
</style>
