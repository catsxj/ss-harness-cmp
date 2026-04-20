export const add = {
  location: {
    region: '',
    az: '',
    vendorId: '',
    poolGroupId: ''
  }
}
export const element = {
  isLoadData: true,
  categoryId: '',
  skuList: [],
  skuId: 0,
  price: 0,
  discount: 1,
  amount: 1,
  priceId: 0
}
export const initOpItem = {
  origin: 'create',
  id: '',
  location: {
    region: '',
    az: '',
    vendorId: '',
    vendorType: 'OPENSTACK',
    poolGroupId: ''
  }
}
export const initOpProps = {
  itemData: {
    type: Object,
    default: function () {
      return {
        ...initOpItem
      }
    }
  }
}
