export const bodyList = ['json']

export function filterMode(value) {
  let mode
  switch (value) {
    case 'json':
      mode = 'application/json'
      break
    case 'sql':
      mode = 'sql'
      break
    case 'javascript':
      mode = 'text/javascript'
      break
    case 'xml':
      mode = 'xml'
      break
    case 'css':
      mode = 'css'
      break
    case 'html':
      mode = 'htmlmixed'
      break
    case 'yaml':
      mode = 'yaml'
      break
    case 'markdown':
      mode = 'markdown'
      break
    case 'python':
      mode = 'python'
      break
    default:
      mode = 'application/json'
  }
  return mode
}

export function isJSON(value) {
  try {
    JSON.parse(value)
    return true
  } catch (error) {
    return false
  }
}

export function filterDatasourceType(val) {
  const types = {
    database: ['mysql', 'dm'],
    sql: ['mysql', 'dm'],
    json: ['json'],
    api: ['api']
  }
  return types[val]
}

export const $dom = id => document.getElementById(id)
