  <template>
  <div class="param_list">
    <el-button type="primary" @click="add">新增字段</el-button>
    <div style="height: 20px;"></div>
    <el-card class="m-b card-layout" v-for="(item, index) in itemData.listMsg" :key="index">
      <div slot="header">
        <span @click="toggleShowStatus(item)" style="display: inline-block; width: calc(100% - 20px);">{{item.name || '未知字段'}}</span>
        <i class="el-icon-close" @click="del(item)"></i>
      </div>
      <el-collapse-transition>
          <el-row :gutter="20" :key="index" v-show="item.show">
            <el-col :span="10">
              <basic-form-item labelWidth="0" :prop="`listMsg.${index}.code`" validate="required" required-message="请选择字段">
                <el-select v-model="item.code" placeholder="请选择字段" filterable @change="getItemCode(index, item.code)">
                  <el-option v-for="item in paramListAll"
                    :key="item.id"
                    :label="item.name"
                    :value="item.code">
                  </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="2" v-if="!noRules.includes(item.code)">
              <basic-form-item labelWidth="0">
                <el-input readonly v-model="readOnlyRule"></el-input>
              </basic-form-item>
            </el-col>
            <!-- 选择IP -->
            <el-col :span="24" v-if="item.code === 'ip'">
              <el-transfer v-model="item.value" :data="ipList"
                :titles="['IP列表', '已选IP']"
                :props="{ key: 'name', label: 'name' }"
                filterable
              >
              </el-transfer>
            </el-col>
            <!-- 选择指标项 -->
            <el-col :span="24" v-if="item.code === 'itemName'">
              <el-transfer v-model="item.value" :data="itemList"
                :titles="['指标项列表', '已选指标项']"
                :props="{ key: 'id', label: 'name' }"
                filterable
              >
              </el-transfer>
            </el-col>
          <!-- 选择告警等级 -->
          <el-col :span="24" v-if="item.code === 'warning'">
            <el-transfer v-model="item.value" :data="warnList"
              :titles="['告警等级列表', '已选指告警等级']"
              :props="{ key: 'warnLevel', label: 'remark' }"
              filterable
            >
            </el-transfer>
          </el-col>
        </el-row>
      </el-collapse-transition>
    </el-card>
  </div>
</template>

<script>
import { paramListAll, ruleList } from '../utils/index'
export default {
  props: {
    itemData: {
      type: Object,
      required: true
    },
    ipList: {
      type: Array,
      required: true
    },
    itemList: {
      type: Array,
      required: true
    },
    warnList: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      ruleList,
      paramListAll,
      dragging: false,
      readOnlyRule: '=',
      noRules: ['inspectResult', 'rule', 'threshold']
    };
  },
  methods: {
    // 切换显示状态
    toggleShowStatus (item) {
      item.show = !item.show
    },
    getItemCode (index, code) {
      // 字段不能重复
      let count = 0
      for (const listItem of this.itemData.listMsg) {
        if (listItem.code === code) {
          count += 1
          if (count === 2) {
            this.$set(this.itemData.listMsg, index, {
              name: '',
              code: '',
              rule: '',
              value: '',
              show: true
            })
            return this.$message.error('该字段已存在')
          }
        }
      }
      this.paramListAll.forEach(param => {
        if (param.code === code) {
          this.$nextTick(() => {
            this.itemData.listMsg[index].name = param.name
          })
          if (code === 'ip' || code === 'itemName' || code === 'warning') {
            this.itemData.listMsg[index].value = []
          }
        }
      })
    },
    add () {
      if (!this.itemData.inspectId) {
        return this.$message.error('请先选择巡检项')
      }
      this.itemData.listMsg.forEach(item => {
        item.show = false
      })
      this.itemData.listMsg.push({
        name: '',
        code: '',
        rule: '',
        value: '',
        show: true
      })
    },
    del (row) {
      const index = this.itemData.listMsg.indexOf(row)
      if (index !== -1) {
        this.itemData.listMsg.splice(index, 1)
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.param_list {

  .list {

    .item {
      padding: 10px;
      border: 1px solid #eee;
    }
  }
}
</style>
