/**
 * Created by Zhang Haijun on 2018/12/25.
 */
import { getModule } from 'services/task/node'

const graph = {
  state: {
    moduleMap: {},
    editor: {}
  },
  mutations: {
    SET_EDITOR(state, editor) {
      state.editor = editor
    },
    SET_MODULE(state, data) {
      state.moduleMap = data
    }
  },
  actions: {
    GetModuleMap({ commit }) {
      getModule({
        page: 1,
        rows: 10000
      }).then((data) => {
        if (data.success) {
          const obj = {
            'task.software.role': {
              template: '{"deploy":{}}',
              preConstraints: '{"rule":"white","data":[{"code": "^task[.]resource[.]cvm[.][a-z]{1,20}$"}]}',
              postConstraints: '{"rule":"white","data":[]}'
            },
            'task.maintain.recovery': {
              name: '恢复节点'
            },
            'task.software.exporter': {
              name: 'NodeExporter安裝'
            }
          }
          data.data.rows.forEach((item) => {
            obj[item.code] = item
          })
          commit('SET_MODULE', obj)
        }
      })
    }
  }
}
export default graph
