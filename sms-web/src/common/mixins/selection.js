export default {
  data() {
    return {
      selectionIds: []
    }
  },
  methods: {
    handleSelectionChange(selections) {
      this.selectionIds = selections.map((item) => item.id)
    }
  }
}
