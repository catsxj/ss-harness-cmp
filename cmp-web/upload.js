'use strict'
// 引入scp2
const client = require('scp2')
const ora = require('ora')
const chalk = require('chalk')
const spinner = ora(chalk.green('正在发布到服务器...'))
const startTime = new Date().getTime()
spinner.start()
client.scp(
  './dist/',
  {
    // 本地打包文件的位置
    host: '**.**.**.**', // 服务器的IP地址
    port: '**', // 服务器端口， 一般为 22
    username: '***', // 用户名
    password: '******', // 密码
    path: '/opt/test/' // 项目部署的服务器目标位置
  },
  (err) => {
    spinner.stop()
    if (!err) {
      console.log(chalk.green('Success! Project ready deploy successful...'))
      console.log(chalk.green(`Time: ${new Date().getTime() - startTime}ms`))
    } else {
      console.log(chalk.red('Fail!' + err))
    }
  }
)
