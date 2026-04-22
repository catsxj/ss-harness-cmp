export default {
  methods: {
    addItem (row, value) {
      let data = {};
      if (value !== undefined) data = value;
      row.push(data);
    },
    removeItem (data, index, required) {
      if (required && data.length === 1) {
        this.$message.error('至少存在一个该节点');
        return;
      }
      data.splice(index, 1);
    }
  }
}
