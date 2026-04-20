export function init(dashboradData, self) {
  for (const key in dashboradData) {
    const element = dashboradData[key]
    self.$set(element, 'step', null)
    self.$set(element, 'stepValue', 20)
    self.$set(element, 'defindTime', [])
  }
}
