const exec = require('child_process').exec
const params = process.argv[2]
const str = `git subtree ${params || 'pull'} --prefix=src/common http://haijun@58.210.154.140:8888/web/cmp-common.git master --squash`
exec(str, function (err, stdout, stderr) {
  if (err) {
    console.log('======执行失败=======')
    console.log(err)
  } else {
    console.log('======执行成功=======')
    console.log(stdout)
  }
})
