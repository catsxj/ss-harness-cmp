// 机房l: 长, w: 宽 h: 高 d: 墙的厚度  separateWidth: 隔断的宽度
export default function getConfigs(l, w, h, d, separateWidth) {
  const py = h / 2 + 1;
  const configs = [
    // 后
    {
      w: l,
      h,
      px: 0,
      py,
      pz: -w / 2,
      rx: 0,
      ry: 0,
      rz: 0
    },
    {
      type: 'column',
      w: 10,
      h,
      px: 0,
      py,
      pz: -w / 2,
      rx: 0,
      ry: 0,
      rz: 0
    },
    // 左
    {
      w: w,
      h,
      px: -l / 2 + d / 2,
      py,
      pz: 0,
      rx: 0,
      ry: Math.PI / 2,
      rz: 0
    },
    {
      type: 'column',
      w: 10,
      h,
      px: -l / 2 + d / 2,
      py,
      pz: 0,
      rx: 0,
      ry: 0,
      rz: 0
    },
    // 右
    {
      w: w,
      h,
      px: l / 2 - d / 2,
      py,
      pz: 0,
      rx: 0,
      ry: Math.PI / 2,
      rz: 0
    },
    {
      type: 'column',
      w: 10,
      h,
      px: l / 2 - d / 2,
      py,
      pz: 0,
      rx: 0,
      ry: 0,
      rz: 0
    },
    // 前
    {
      w: l,
      h,
      px: 0,
      py,
      pz: w / 2,
      rx: 0,
      ry: 0,
      rz: 0,
      window: {
        w: 300,
        h: 60
      },
      doors: [
        {
          w: 60,
          h: 80,
          px: 260
        },
        {
          w: 60,
          h: 80,
          px: -190
        },
        {
          w: 60,
          h: 80,
          px: 190
        }
      ]
    },
    // // 前左
    // {
    //   w: separateWidth,
    //   h,
    //   px: -l / 2 + separateWidth / 2 + d / 2,
    //   py: h / 2,
    //   pz: w / 2,
    //   rx: 0,
    //   ry: 0,
    //   rz: 0
    // },
    // // 前右
    // {
    //   w: separateWidth,
    //   h,
    //   px: l / 2 - separateWidth / 2 - d,
    //   py: h / 2,
    //   pz: w / 2,
    //   rx: 0,
    //   ry: 0,
    //   rz: 0
    // },
    // 内左
    {
      type: 'glass',
      w: w,
      h,
      px: -l / 2 + separateWidth,
      py,
      pz: 0,
      rx: 0,
      ry: Math.PI / 2,
      rz: 0,
      doors: [
        {
          w: 60,
          h: 80,
          px: -l / 2 + separateWidth,
          pz: -60,
          ry: Math.PI / 2
        },
        {
          w: 60,
          h: 80,
          pz: 60,
          px: -l / 2 + separateWidth,
          ry: Math.PI / 2
        }
      ]
    },
    {
      type: 'column',
      w: 10,
      h,
      px: -l / 2 + separateWidth,
      py,
      pz: -w / 2 + w / 2,
      rx: 0,
      ry: 0,
      rz: 0
    },
    // 左隔断
    {
      w: separateWidth,
      h,
      px: -l / 2 + separateWidth / 2,
      py,
      pz: -w / 2 + w / 2,
      rx: 0,
      ry: 0,
      rz: 0
    },
    // 内 右
    {
      w,
      h,
      px: l / 2 - separateWidth,
      py,
      pz: 0,
      rx: 0,
      ry: Math.PI / 2,
      rz: 0
    }
  ];
  return configs;
}
