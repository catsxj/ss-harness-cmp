<template>
  <div>
    <div v-if="addData.subnetId">
      <el-tag class="m-l-xs" :key="index" v-for="(item, index) in tagList" closable :disable-transitions="false" @click.stop="modify(item, index)" @close.stop="handleClose(index)">
        {{ item.name }}
      </el-tag>
      <el-button size="mini" @click="add" type="primary" class="m-l-md">添加</el-button>
    </div>
    <div v-else>暂无子网</div>
    <add :add-data="addObj" v-if="addObj.dialog" @ok="addOk" :subnet-id="addData.subnetId" :vendor-id="addData.vendorId" :now-list="nowList"></add>
  </div>
</template>

<script>
import add from './add.vue'
export default {
  components: { add },
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      tagList: [],
      addObj: {
        dialog: false,
        data: {}
      },
      modifyData: {
        dialog: false,
        data: {}
      },
      nowList: []
    }
  },
  methods: {
    handleClose(index) {
      this.nowList.splice(index, 1)
      this.tagList.splice(index, 1)
    },
    add() {
      this.addObj = {
        dialog: true,
        title: '新增网络接口',
        data: {
          deviceIndex: this.tagList.length
        }
      }
    },
    modify(data, index) {
      this.addObj = {
        dialog: true,
        index: index,
        title: '编辑网络接口',
        data: {
          deviceIndex: data.deviceIndex,
          networkInterfaceUuid: data.networkInterfaceUuid
        }
      }
    },
    addOk(data) {
      if (data.index >= 0) {
        this.tagList[data.index] = data.data
        this.nowList[data.index].networkInterfaceUuid = data.data.networkInterfaceUuid
      } else {
        this.tagList.push(data.data)
        this.nowList.push(data.data.networkInterfaceUuid)
      }
    },
    ok() {
      return this.tagList
    }
  },
  watch: {
    subnetId: {
      handler(newVal) {
        this.tagList = []
      },
      deep: true
    }
  }
}
</script>

<style scoped></style>
