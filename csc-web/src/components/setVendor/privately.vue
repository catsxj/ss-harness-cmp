<template>
  <div>
    <basic-form-item label="地域：" prop="region" validate="required" style="max-width: 100%">
      <el-radio-group v-model="addData.region" @change="setAvailablitiyZone">
        <el-radio class="m-t-xs" border v-for="(item, index) in dictionaries" :key="index" :label="item.value">{{ item.name }}</el-radio>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="可用区：" prop="availablitiyZone" validate="required" style="max-width: 100%">
      <el-select v-model="addData.availablitiyZone" @change="$emit('getPool', false)">
        <el-option v-for="(item, index) in dictionariesChild" :key="index" :label="item.name" :value="item.value"></el-option>
      </el-select>
    </basic-form-item>
  </div>
</template>
<script>
import { getDictionaries } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      dictionariesChild: [],
      dictionaries: []
    }
  },
  created() {
    this.getDictionaries('dictionaries', 'region')
    this.$set(this.addData, 'region', '')
    this.$set(this.addData, 'availablitiyZone', '')
  },
  methods: {
    setAvailablitiyZone() {
      if (this.addData.availablitiyZone) this.$set(this.addData, 'availablitiyZone', '')
      this.getDictionaries('dictionariesChild', this.addData.region)
    },
    getDictionaries(list, value) {
      getDictionaries({ value: value }).then(data => {
        if (data.success) {
          this[list] = data.data
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
