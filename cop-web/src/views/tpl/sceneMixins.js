import { getScene } from 'services/task/task'

export default {
  created() {
    this.getSceneData()
  },
  methods: {
    getSceneData() {
      const sceneList = [
        { id: 1, name: '内置场景', data: [] },
        { id: 2, name: '自定义场景', data: [] }
      ]
      getScene({
        page: 1,
        rows: 10000
      }).then(data => {
        if (data.success) {
          const arr = data.data.rows
          arr.forEach(item => {
            let index = 0
            if (!item.internal) {
              index = 1
            }
            sceneList[index].data.push(item)
          })
          this.searchConfigs[1].data = sceneList
        }
      })
    }
  }
}
