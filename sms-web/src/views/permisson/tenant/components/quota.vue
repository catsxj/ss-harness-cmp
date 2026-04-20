/** * Created by HaijunZhang on 2019/8/30. */
<template>
  <div class="wrapper_list">
    <el-transfer :props="props" :titles="['未选择', '已选择']" filterable :filter-method="filterMethod" filter-placeholder="请输入搜索内容" v-model="idList" :data="list"> </el-transfer>
  </div>
</template>

<script>
import { getPoolConditions } from 'services/platform/pool'
export default {
  components: {},
  props: {
    catalog: {
      type: String
    },
    tenantId: {
      type: Number
    }
  },
  data() {
    return {
      props: {
        key: 'id',
        label: 'name'
      },
      list: [],
      value: [],
      filterMethod(query, item) {
        return item.name.indexOf(query) > -1
      },
      params: {
        page: 1,
        rows: 9999
      },
      idList: []
    }
  },
  created() {
    getPoolConditions({
      page: 1,
      rows: 9999,
      condition: JSON.stringify({ condition: 'listAssignGroups' })
    }).then((data) => {
      data.data.forEach((item) => {
        const obj = {
          id: item.id,
          name: item.name
        }
        this.list.push(obj)
      })
    })
  },
  methods: {
    getPostData() {
      return {
        groupIds: this.idList
      }
    }
  }
}
</script>

<style scoped lang="scss">
.wrapper_list {
  display: flex;
  align-items: center;
  justify-content: center;
  .el-transfer {
    ::v-deep .el-transfer-panel {
      width: 310px;
      height: 400px;
      .el-transfer-panel__list {
        height: 296px;
      }
    }
    ::v-deep .el-transfer__buttons {
      // width: 50px;
      .el-button {
        margin-left: 0;
      }
    }
  }
}
</style>
