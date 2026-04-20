<template>
  <section>
    <h4>{{ title }}</h4>
    <div class="feildBox" @drop="setDropList()" @dragover="onDragover">
      <p v-if="dropList.length == 0" class="defaultText">拖动数据到此区域</p>
      <p
        v-for="(item, index) in dropList"
        :key="item.id"
        :style="{
          border: `solid 1px ${item.coordinate ? 'rgb(29, 84, 213)' : 'rgb(0, 179, 116)'}`,
          background: `${item.coordinate ? 'rgb(29, 84, 213, 0.1)' : 'rgb(0, 179, 116, 0.1)'}`
        }"
        @dragover="dragover($event, index)"
        @dragstart="dragstart(index)"
        @drop="dragDrop($event, index)"
        draggable
        class="columnList"
        v-else
      >
        <span>{{ item.alias || item.name }}</span>
        <i class="el-icon-delete" @click="deleteItem(index)"></i>
      </p>
    </div>
  </section>
</template>
<script>
import { mapGetters } from 'vuex'
import { cloneDeep } from 'lodash-es'
import { eventBus } from '../eventBus'
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    coordinate: {
      type: [Boolean, undefined],
      default: undefined
    },
    dragItem: {
      type: Object,
      default: () => ({})
    },
    checkOne: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dropList: [],
      dragIndex: '',
      isMoving: false
    }
  },
  computed: {
    ...mapGetters(['getActiveElement'])
  },
  mounted() {
    this.listenDragStart()
    this.initDropList()
    // 重选数据集
    eventBus.$on('clearFeildBox', () => {
      this.dropList = []
    })
  },
  destroyed() {
    eventBus.$off('clearFeildBox')
  },
  methods: {
    listenDragStart() {
      window.addEventListener('dragstart', evt => {
        const { classList } = evt.target
        this.isMoving = classList.contains('columnList')
      })
    },
    initDropList() {
      // 初始化字段的维度/指标等
      if (!this.getActiveElement?.data) return
      const { dropList } = this.getActiveElement?.data
      if (!dropList) return
      if (Array.isArray(dropList[0])) {
        // cloneDeep防止组件用数据
        this.dropList = this.coordinate ? cloneDeep(dropList[0]) : cloneDeep(dropList[1])
      } else {
        this.dropList = cloneDeep(dropList)
      }
    },
    setDropList() {
      if (this.isMoving) return
      // 表格字段可拖动，当dropList含有值时，调用子元素的拖动事件
      // if (this.dropList.length && this.getActiveElement.value == 'table') return
      if (this.checkOne && this.dropList?.length == 1) {
        return this.$message.warning('仅支持添加一个对象')
      }
      if (this.coordinate != undefined && this.coordinate != this.dragItem.coordinate) {
        return this.$message.warning('不支持添加该类型对象')
      }
      if (this.dropList.map(item => item.id).includes(this.dragItem.id)) {
        return this.$message.warning(`已存在该对象 ${this.dragItem.alias || this.dragItem.name}`)
      }
      this.dropList.push(this.dragItem)
      this.commitDropList()
    },
    onDragover(evt) {
      evt.preventDefault()
    },
    deleteItem(idx) {
      const { coordinate } = this.dropList[idx]
      this.dropList.splice(idx, 1)
      this.commitDropList(coordinate)
    },
    commitDropList(coordinate) {
      if (typeof this.coordinate == 'undefined') {
        this.$store.commit('updateElementData', { uuid: this.getActiveElement.uuid, data: { dropList: this.dropList } })
      } else {
        this.$store.commit('updateElementData', { uuid: this.getActiveElement.uuid, data: { dropList: [this.dropList] }, coordinate })
      }
    },
    dragstart(index) {
      if (this.getActiveElement.value != 'table') return
      this.dragIndex = index
      this.isMoving = true
    },
    // dragenter(e, index) {
    //   if (this.getActiveElement.value != 'table') return

    // },
    dragover(e, index) {
      if (this.getActiveElement.value != 'table') return
      e.preventDefault()
    },
    dragDrop(e, index) {
      if (this.getActiveElement.value != 'table' || !(this.dragIndex || this.dragIndex == 0)) return
      e.preventDefault()
      // 避免源对象触发自身的dragenter事件
      if (!this.dragIndex && this.dragIndex !== 0) return
      if (this.dragIndex !== index) {
        const source = this.dropList[this.dragIndex]
        if (this.dragIndex || this.dragIndex === 0) {
          this.dropList.splice(this.dragIndex, 1)
          this.dropList.splice(index, 0, source)
        } else {
          if (this.dropList.map(item => item.id).includes(this.dragItem.id)) {
            return this.$message.warning(`已存在该对象 ${this.dragItem.alias || this.dragItem.name}`)
          }
          this.dropList.push(this.dragItem)
        }
        this.dragIndex = index
      }
      this.dragIndex = ''
      this.commitDropList()
    }
  }
}
</script>
<style lang="scss" scoped>
h4 {
  margin: 3px;
}
.feildBox {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  padding: 4px 0;
  min-height: 32px;
  border: solid 1px var(--d-line-color);
  border-radius: 10px;
  position: relative;
  & > p {
    width: 80%;
    height: 22px;
    margin: 2px auto;
    padding: 5px;
    box-sizing: content-box;
    position: relative;
    &:hover i {
      display: block;
    }
    i {
      display: none;
      position: absolute;
      right: 10px;
      top: 8px;
      cursor: pointer;
    }
  }
}
</style>
