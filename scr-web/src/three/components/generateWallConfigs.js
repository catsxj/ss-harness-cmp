// 机房l: 长, w: 宽 h: 高 d: 墙的厚度  separateWidth: 隔断的宽度
export default function getConfigs(l, w, h, d, separateWidth) {
  const py = h / 2 + 1;
  const configs = [
    // 后
    {
      w: l - 220,
      h,
      px: -110,
      py,
      pz: -w / 2,
      rx: 0,
      ry: 0,
      rz: 0
    },
    // 后
    {
      w: 220,
      h,
      px: l / 2 - 110,
      py,
      pz: -w / 2 + 150,
      rx: 0,
      ry: 0,
      rz: 0
    },
    {
      w: 150,
      h,
      px: l / 2 - 220,
      py,
      pz: -w / 2 + 75,
      rx: 0,
      rz: 0,
      ry: Math.PI / 2
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
      w: w - 150,
      h,
      px: l / 2 - d / 2,
      py,
      pz: 75,
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
      pz: 110,
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
        w: 890,
        h: 80,
        px: 50
      },
      doors: [
        {
          w: 40,
          h: 100,
          px: -450
        },
        {
          w: 40,
          h: 100,
          px: -350
        },
        {
          w: 40,
          h: 100,
          px: 380
        }
      ]
    },
    // 内右
    {
      w: w - 150,
      h,
      px: l / 2 - separateWidth,
      py,
      pz: 75,
      rx: 0,
      ry: Math.PI / 2,
      window: {
        w: w - 20 - 150,
        h: h - 20
      },
      doors: [
        {
          w: 40,
          h: 100,
          px: l / 2 - separateWidth,
          pz: -220,
          ry: -Math.PI / 2
        },
        {
          w: 40,
          h: 100,
          pz: 140,
          px: l / 2 - separateWidth,
          ry: -Math.PI / 2
        }
      ]
    },
    {
      type: 'column',
      w: 10,
      h,
      px: l / 2 - separateWidth,
      py,
      pz: 110,
      rx: 0,
      ry: 0,
      rz: 0
    },
    // 右隔断
    {
      w: separateWidth,
      h,
      px: l / 2 - separateWidth / 2,
      py,
      pz: -w / 2 + w / 2 + 110,
      rx: 0,
      ry: 0,
      rz: 0
    },
    // 内 左
    {
      w,
      h,
      px: -l / 2 + separateWidth,
      py,
      pz: 0,
      rx: 0,
      ry: Math.PI / 2,
      rz: 0
    }
  ];
  return configs;
}
