// 返回集群节点坐标数据
export const roleWidth = 130;
export class ClusterCoor {
  roleCount = 0
  groupWidth =0
  xOffset = 0
  yOffset = 85
  constructor(roleCount: number) {
    this.roleCount = roleCount;
    this.groupWidth = roleWidth * roleCount + 15 * (roleCount + 1);
    this.xOffset = (this.groupWidth - 180) / 2;
  }

  getCoor(index: number) {
    const offset = (180 - roleWidth) / 2
    if (index === 0) {
      return [-(this.xOffset - 15), this.yOffset];
    }
    if (index === this.roleCount - 1) return [(this.groupWidth - this.xOffset - roleWidth - 15), this.yOffset];
    return [offset, this.yOffset]
  }

  getPort(index: number) {
    if (index === 0) return 3;
    if (index === this.roleCount - 1) return 1;
    if (index === 1) return 2;
    return index
  }
}
