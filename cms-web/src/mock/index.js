import Mock from 'mockjs'
import taskApi from './task'
Mock.mock(/\/list$/, 'post', taskApi.getTaskList)
Mock.mock(/\/api\/task\/detail/, 'get', taskApi.getTaskDetail)
