<template>
  <div>
    <h4>绑定参数</h4>
    <section class="params">
      <div>
        <span>参数</span>
        <el-input v-model="keyName" @input="debounceInput" placeholder="请输入请求参数"></el-input>
      </div>
      <div>
        <span>别名</span>
        <el-input v-model="aliasName" @input="debounceInputAlias" placeholder="请输入别名"></el-input>
      </div>
    </section>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { debounce, cloneDeep } from 'lodash-es'
export default {
  data() {
    return {
      keyName: '',
      aliasName: '',
      debounceInput: () => {},
      debounceInputAlias: () => {},
      dropList: [{ alias: '', name: '' }]
    }
  },
  computed: {
    ...mapGetters(['getActiveElement'])
  },
  mounted() {
    this.debounceInput = debounce(this.inputChange, 200)
    this.debounceInputAlias = debounce(this.inputChangeAlias, 200)
    const { dropList } = this.getActiveElement?.data
    this.dropList = dropList?.length ? cloneDeep(dropList) : this.dropList
    this.keyName = dropList[0]?.name
    this.aliasName = dropList[0]?.alias
  },
  methods: {
    inputChange(key) {
      this.dropList[0].name = key
      this.$store.commit('updateElementData', { uuid: this.getActiveElement.uuid, data: { dropList: this.dropList } })
    },
    inputChangeAlias(alias) {
      this.dropList[0].alias = alias
      this.$store.commit('updateElementData', { uuid: this.getActiveElement.uuid, data: { dropList: this.dropList } })
    }
  }
}
</script>
<style lang="scss" scoped>
h4 {
  margin: 5px 0;
  color: #fff !important;
}
.params > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 5px 5px 15px;
  & > span {
    width: 100px;
  }
}
</style>
