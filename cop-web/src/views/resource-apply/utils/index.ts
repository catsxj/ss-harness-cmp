export function generateSpec(sourceSpec: any) {
  const specName: string[] = [];
  let spec = sourceSpec;
  if (typeof sourceSpec === 'string') {
    spec = JSON.parse(sourceSpec)
  }
  spec.forEach((cell:any) => {
    specName.push(`${cell.specValue}${cell.unit || ''}`)
  })
  return specName.join('/')
}
export function getSpecValue(item:any) {
  const { skuId, skuList } = item;
  const cell = skuList.find((a:any) => a.id === skuId);
  if (!cell) return {};
  let spec = cell.spec;
  if (typeof spec === 'string') spec = JSON.parse(spec);
  const res:any = {};
  spec.forEach((element:any) => {
    const { specName, specValue } = element;
    res[specName] = specValue;
  });
  return res
}
export function getSpec (skuId: number, skuList: any[]) {
  const sku = skuList.find(cell => skuId === cell.id);
  return sku.spec.map((item:any) => {
    return {
      [item.specName]: item.specValue
    }
  })
}
