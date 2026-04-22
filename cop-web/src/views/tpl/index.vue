<template>
  <div class="tpl-wrapper">
    <el-card class="container-left">
      <div slot="header">
        <span>作业场景</span>
        <div class="pull-right">
          <el-tooltip content="添加自定义场景">
            <i class="el-icon-plus cur-point" @click="handleCreate()"></i>
          </el-tooltip>
        </div>
      </div>
      <ul>
        <li
          :class="{ selected: item.selected }"
          v-for="item in list"
          :key="item.id"
          @click="selectMenu(item)"
        >
          <span>{{ item.name }} ({{ item.templateCount }})</span>
          <span class="operate" v-if="!item.internal">
            <i @click.stop="handleCreate(item)" class="el-icon-edit m-r"></i>
            <i @click.stop="handleDelete(item)" class="el-icon-delete"></i>
          </span>
        </li>
      </ul>
    </el-card>
    <TplList class="tpl-list" ref="tplRef"></TplList>
    <AddDialog v-if="addDialog.visible" :dialog="addDialog" @getData="getSceneList(false)"></AddDialog>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import TplList from './list.vue'
import AddDialog from './addDialog.vue'
import { getScene, removeScene } from 'services/task/task'
import { useDelete } from 'hooks/useTable'
export default {
  components: {
    TplList,
    AddDialog
  },
  setup() {
    const list = ref([]);
    async function getSceneList() {
      const res = await getScene({
        page: 1,
        rows: 9999
      });
      if (res.success) {
        let count = 0;
        const sceneList = res.data.rows.map(item => {
          count += item.templateCount;
          return {
            ...item,
            selected: false
          }
        });
        list.value = [{
          id: '',
          name: '全部',
          selected: false,
          internal: true,
          templateCount: count
        }, ...sceneList];
        selectMenu(list.value[0])
      }
    }
    getSceneList();
    const tplRef = ref();
    function selectMenu(data) {
      list.value.forEach((element) => {
        if (element.id === data.id) {
          element.selected = true
        } else {
          element.selected = false
        }
      })
      tplRef.value.handleSearchByScene(data.id)
    }
    // 新增
    const addDialog = ref({})
    function handleCreate(record = {}) {
      addDialog.value = {
        visible: true,
        record
      }
    }
    const { handleDelete } = useDelete(removeScene, getSceneList)
    return {
      list,
      selectMenu,
      tplRef,
      addDialog,
      getSceneList,
      handleCreate,
      handleDelete
    }
  }
}
</script>
<style scoped lang="scss">
.tpl-wrapper {
  display: flex;
  width: 100%;
  overflow: hidden;
  .tpl-list {
    flex: 1;
    overflow: auto;
  }
  .container-left {
    margin-right: 8px;
    width: 180px;
    ::v-deep .el-card__body {
      padding: 10px 0;
    }
    ul {
      padding: 0;
      margin: 0;
      list-style: none;
    }
    li {
      height: 36px;
      line-height: 36px;
      padding: 0 16px;
      font-size: 12px;
      display: flex;
      cursor: pointer;
      .operate {
        flex: 1;
        text-align: right;
        display: none;
      }
      &:hover {
        background-color: #E8EFFF;
        .operate {
          display: inline-block;
        }
      }
      &.selected {
        color: #1E54DE;
        background: #E8EFFF;
        border-left: 2px solid #1E54DE;
      }
    }
  }
}
</style>
