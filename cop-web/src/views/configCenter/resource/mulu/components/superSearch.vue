<template>
  <div>
    <el-row :gutter="20" v-if="simple">
      <el-col class="topFlex" :span="24">
        <span class="item">
          <el-form inline>
            <el-form-item>
              <el-input placeholder="请输入资源名称" v-model="simpleName" :disabled="superShow" clearable>
                <el-button slot="append" icon="el-icon-search" @click="getSearchDataBySimple"></el-button>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="ghost" @click="changeSuperSearch">
                <i class="iconfont iconsousuo"></i>
                高级搜索
              </el-button>
            </el-form-item>
          </el-form>
        </span>
      </el-col>
    </el-row>
    <el-row :gutter="20" v-if="superShow">
      <el-col :span="24" :offset="0">
        <el-form inline>
          <el-form-item>
            <el-input v-model="searchData['name']" clearable placeholder="资源名称"/>
          </el-form-item>
          <template v-for="(item, index) in hostAttrsList">
            <el-form-item :key="index" v-if="(item.code !== 'name') && item.isGrid && handleAttr(item.type, 'search')">
              <template v-if="item.type === 'TEXTFIELD' || item.type === 'TEXTAREA'">
                <el-input v-model="searchData[item.code]" clearable :placeholder="item.name"></el-input>
              </template>
              <template v-if="item.type === 'INTEGER'">
                <el-input-number class="w-full" v-model="searchData[item.code]" clearable :placeholder="item.name"></el-input-number>
              </template>
              <template v-if="item.type === 'FLOAT'">
                <el-input-number class="w-full" v-model="searchData[item.code]" :precision="floatDecimalNum" clearable :placeholder="item.name"></el-input-number>
              </template>
              <template v-if="item.type === 'SELECT'">
                <el-select v-model="searchData[item.code]" clearable :placeholder="item.name">
                  <template v-for="(item, index) in selectData">
                    <el-option
                      :key="index"
                      :label="item.name"
                      :value="item.value">
                    </el-option>
                  </template>
                </el-select>
              </template>
              <template v-if="item.type === 'RADIO'">
                <el-select v-model="searchData[item.code]" clearable :placeholder="item.name">
                  <template v-for="(item, index) in radioData">
                    <el-option
                      :key="index"
                      :label="item.name"
                      :value="item.value">
                    </el-option>
                  </template>
                </el-select>
              </template>
              <template v-if="item.type === 'CHECKBOX'">
                <el-select v-model="searchData[item.code]" clearable multiple :placeholder="item.name">
                  <template v-for="(item, index) in checkBoxData">
                    <el-option
                      :key="index"
                      :label="item.name"
                      :value="item.value">
                    </el-option>
                  </template>
                </el-select>
              </template>
              <template v-if="item.type === 'DATE'">
                <el-date-picker
                  class="w-full"
                  v-model="searchData[item.code]"
                  type="date"
                  value-format="yyyy-MM-dd"
                  clearable
                  :placeholder="item.name">
                </el-date-picker>
              </template>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button @click="cancle">取消</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchFn">确认</el-button>
          </el-form-item>
          <slot></slot>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    // 顶部按钮是否只包含搜索
    simple: {
      type: Boolean,
      default: false
    },
    dialog: {
      type: Object,
      default: () => {
        return {
          show: false
        }
      }
    },
    hostAttrsList: {
      type: Array,
      required: true
    },
    handleAttr: {
      type: Function,
      required: true
    },
    searchFn: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      superShow: false,
      simpleName: '',
      selectData: [],
      radioData: [],
      checkBoxData: [],
      floatDecimalNum: 2,
      searchData: {}
    }
  },
  mounted () {
    this.superShow = this.dialog.show
    this.getData()
    this.searchData = {}
  },
  methods: {
    changeSuperSearch () {
      this.superShow = !this.superShow
      if (this.simpleName) {
        this.simpleName = ''
      }
      this.searchFn()
    },
    // 取消
    cancle () {
      this.superShow = !this.superShow
      this.dialog.show = false
      this.reset()
    },
    // 重置
    reset () {
      this.clearData()
      this.searchFn()
    },
    getData () {
      for (const item of this.hostAttrsList) {
        if (item.type === 'SELECT') {
          this.selectData = item.item
        }
        if (item.type === 'RADIO') {
          this.radioData = item.item
        }
        if (item.type === 'CHECKBOX') {
          this.checkBoxData = item.item
        }
        if (item.type === 'FLOAT') {
          this.floatDecimalNum = item.decimalNum
        }
      }
    },
    getSearchData () {
      const _data = JSON.parse(JSON.stringify(this.searchData))
      for (const key in _data) {
        if (Array.isArray(_data[key])) {
          _data[key] = _data[key].join(',')
        }
      }
      return _data
    },
    getSearchDataBySimple () {
      const simpleData = {
        name: this.simpleName
      }
      this.searchFn(simpleData, true)
    },
    clearData () {
      this.searchData = {}
    }
  }
}
</script>
