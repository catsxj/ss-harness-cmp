export const isDefault = (value1, default1, value2, default2) => {
  return default1 === value1 && default2 === value2 ? 'default' : 'custom'
}
