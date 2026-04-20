<template>
  <div>
    <div class="btn btn-checkbox btn-block" @click="selectSubnet(addData)" :class="{ 'btn-ok': addData.Flag }">
      <div class="text-left">
        <div :title="addData.name" class="ip-label" style="float: left">
          {{ addData.name }}
        </div>
      </div>
      <div class="text-right" v-if="addData.Flag" style="float: right">
        <el-tooltip>
          <div slot="content">
            <span v-for="(row, index) in addData.iparr" :key="index"> {{ addData.iparr[index][0] }}-{{ addData.iparr[index][1] }}<br /> </span>
          </div>
          <span v-if="!setIpFlag" @click.stop="ipFlagCli(addData)" title="如果没有指定IP，系统会自动分配">指定ip</span>
          <div v-if="setIpFlag" @click.stop>
            <div v-if="addData.ipVersion == 'V4'">
              <input type="text" v-model="addData.ipfirst" class="ip-input text-center" style="width: 45px" disabled @click.stop />
              <label class="control-input-dot">.</label>
              <input type="text" v-model="addData.ipTwo" class="ip-input text-center" style="width: 45px" :disabled="addData.tag == 2 || addData.tag == 3" @click.stop />
              <label class="control-input-dot">.</label>
              <input type="text" v-model="addData.ipThree" class="ip-input text-center" @blur="inputBlur(addData.ipThree, addData)" style="width: 45px" :disabled="addData.tag == 3" @click.stop />
              <label class="control-input-dot">.</label>
              <input type="text" name="ipEnd" style="width: 45px" class="ip-input text-center number-input" v-model="addData.ipEnd" @blur="inputBlur(addData.ipEnd, addData)" @click.stop />
              <Icon type="icon-icon-31" @click.native.stop="ipFlagCli(addData)"></Icon>
            </div>
            <div v-else>
              <input type="text" name="ipEnd" style="width: 90px" class="ip-input text-center number-input" v-model="addData.v6Ip" />
              <Icon type="icon-icon-31" @click.native.stop="ipFlagCli(addData)"></Icon>
            </div>
          </div>
        </el-tooltip>
      </div>
      <div style="clear: both"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    imageId: {
      type: Number
    },
    addData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    col: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    networkList: {
      type: Array
    }
  },
  data() {
    return {
      setIpFlag: false
    }
  },
  methods: {
    selectSubnet(item) {
      this.$set(this.addData, 'Flag', true)
      this.$emit('clear', this.addData)
    },
    clear() {
      this.$set(this.addData, 'Flag', false)
    },
    ipFlagCli() {
      this.setIpFlag = !this.setIpFlag
      this.addData.setIpFlag = this.setIpFlag
      if (this.setIpFlag) {
        if (this.addData.tag == 3) this.addData.ipEnd = ''
        else this.addData.ipThree = ''
        this.addData.ipEnd = ''
      }
    },
    inputBlur(val, item) {
      const num = parseInt(val)
      if (num < 0 || num > 255) {
        item.ipflag = true
        this.$notify({
          title: '提示',
          message: item.name + '的输入有误，请输入0-255之间的数',
          type: 'error'
        })
      }
    }
  },
  created() {
    const handleCidr = function (item) {
      const arr = item.cidr.split('/')
      const arr1 = arr[0].split('.')
      if (item.ipVersion == 'V4') {
        if (arr[1] >= 8) {
          item.tag = 1
          item.ipfirst = arr1[0]
        }
        if (arr[1] >= 16) {
          item.tag = 2
          item.ipTwo = arr1[1]
        }
        if (arr[1] >= 24) {
          item.tag = 3
          item.ipThree = arr1[2]
        }
      } else {
        item.v6Ip = ''
      }
      item.setIpFlag = false
      const ipPools = item.ipPools || []
      let str = ''
      if (ipPools.length) str = ipPools.substring(1, ipPools.length - 1)
      const ipArr = str.split('"')
      item.a = []
      for (let i = 0; i < ipArr.length; i++) {
        if (i % 2 != 0) {
          item.a.push(ipArr[i])
        }
      }
      item.iparr = []
      item.a.forEach(function (data, index) {
        const items = data.split('-')
        item.iparr.push(items)
      })
    }
    handleCidr(this.addData)
  }
}
</script>

<style scoped>
.region-active {
  background-color: deepskyblue;
  color: #fff;
}

.btn-checkbox:hover {
  background-color: #5ac1f5;
  color: #fff;
}

.btn {
  width: 100%;
  margin-right: 3%;
  display: inline-block;
  border: 1px solid #5ac1f5;
  color: #5ac1f5;
  margin-bottom: 5px;
  padding: 5px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-ok {
  background: #5ac1f5 !important;
  color: #fff !important;
}

.ip-input {
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -webkit-transition: border-color ease-in-out 0.15s, -webkit-box-shadow ease-in-out 0.15s;
  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}
</style>
