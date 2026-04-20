<template>
  <div>
    <div v-if="networkList.length">
      <el-tag class="m-l-xs" :key="index" v-for="(item, index) in tagList" closable :disable-transitions="false" @click.stop="modify(item, index)" @close.stop="handleClose(index)">
        {{ item.detail.name + (item.switch ? '(' + item.ip + ')' : '') }}
      </el-tag>
      <el-button size="mini" @click="add" type="primary" class="m-l-md">添加网络</el-button>
    </div>
    <div v-else>暂无网络</div>
    <add :add-data="addData" v-if="addData.dialog" :network-list="networkList" :now-list="nowList" @ok="addOk"></add>
    <modify :add-data="modifyData" v-if="modifyData.dialog" :network-list="networkList" @modify="modifyOk"></modify>
  </div>
</template>

<script>
import add from './add.vue'
import modify from './modify.vue'
export default {
  components: { add, modify },
  props: {
    networkList: {
      type: Array
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      tagList: [],
      addData: {
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
      this.addData = {
        dialog: true,
        data: {}
      }
    },
    modify(data, index) {
      this.modifyData = {
        dialog: true,
        index: index,
        version: data.detail.ipVersion,
        ipPools: data.detail.ipPools,
        data: {
          switch: data.switch,
          ip: data.ip
        }
      }
    },
    addOk(data) {
      this.nowList.push(data.subnetId)
      this.tagList.push(data)
    },
    modifyOk(data) {
      this.tagList[data.index].switch = data.data.switch
      this.tagList[data.index].ip = data.data.ip
    },
    ok() {
      return this.tagList
    }
  },
  watch: {
    networkList: {
      handler(newVal) {
        this.tagList = []
        this.nowList = []
      },
      deep: true
    }
  }
}
</script>

<style scoped></style>
