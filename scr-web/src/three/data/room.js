export default {
  walls: [
    { w: 780, h: 100, px: -110, py: 51, pz: -400, rx: 0, ry: 0, rz: 0 },
    { w: 220, h: 100, px: 390, py: 51, pz: -250, rx: 0, ry: 0, rz: 0 },
    { w: 150, h: 100, px: 280, py: 51, pz: -325, rx: 0, rz: 0, ry: 1.5707963267948966 },
    { type: 'column', w: 10, h: 100, px: -75, py: 51, pz: -400, rx: 0, ry: 0, rz: 0 },
    { w: 800, h: 100, px: -497.5, py: 51, pz: 0, rx: 0, ry: 1.5707963267948966, rz: 0 },
    { type: 'column', w: 10, h: 100, px: -497.5, py: 51, pz: 0, rx: 0, ry: 0, rz: 0 },
    { w: 650, h: 100, px: 497.5, py: 51, pz: 75, rx: 0, ry: 1.5707963267948966, rz: 0 },
    { type: 'column', w: 10, h: 100, px: 497.5, py: 51, pz: 110, rx: 0, ry: 0, rz: 0 },
    { w: 1000, h: 100, px: 0, py: 51, pz: 400, rx: 0, ry: 0, rz: 0, window: { w: 640, h: 80, px: 50 }, doors: [{ w: 40, h: 100, px: -450 }, { w: 40, h: 100, px: -250 }, { w: 40, h: 100, px: 380 }] },
    { w: 650, h: 100, px: 400, py: 51, pz: 75, rx: 0, ry: 1.5707963267948966, window: { w: 630, h: 80 }, doors: [{ w: 40, h: 100, px: 400, pz: -220, ry: -1.5707963267948966 }, { w: 40, h: 100, pz: 135, px: 400, ry: -1.5707963267948966 }] },
    { type: 'column', w: 10, h: 100, px: 400, py: 51, pz: 110, rx: 0, ry: 0, rz: 0 }, { w: 100, h: 100, px: 450, py: 51, pz: 110, rx: 0, ry: 0, rz: 0 }, { w: 800, h: 100, px: -400, py: 51, pz: 0, rx: 0, ry: 1.5707963267948966, rz: 0 },
    { w: 680, h: 100, px: -60, py: 51, pz: -250, rx: 0, ry: 0, rz: 0, window: { w: 660, h: 80 }, doors: [{ w: 40, h: 100, px: -250, ry: 3.141592653589793 }, { w: 40, h: 100, px: -80, ry: 3.141592653589793 }, { w: 40, h: 100, px: 90, ry: 3.141592653589793 }, { w: 40, h: 100, px: 250, ry: 3.141592653589793 }] },
    { w: 680, h: 100, px: -60, py: 51, pz: 250, rx: 0, ry: 0, rz: 0, window: { w: 660, h: 80 }, doors: [{ w: 40, h: 100, px: -250 }, { w: 40, h: 100, px: -80 }, { w: 40, h: 100, px: 90 }, { w: 40, h: 100, px: 250 }] },
    { w: 500, h: 100, px: -230, py: 51, pz: 0, rx: 0, ry: 1.5707963267948966, rz: 0, window: { w: 480, h: 80 } },
    { w: 500, h: 100, px: -60, py: 51, pz: 0, rx: 0, ry: 1.5707963267948966, rz: 0, window: { w: 480, h: 80 } },
    { w: 500, h: 100, px: 110, py: 50, pz: 0, rx: 0, ry: 1.5707963267948966, rz: 0, window: { w: 480, h: 80 } },
    { w: 500, h: 100, px: 280, py: 51, pz: 0, rx: 0, ry: 1.5707963267948966, rz: 0, window: { w: 480, h: 80 } }],
  airs: [{ w: 30, h: 80, d: 15, px: -450, py: 41, pz: -250 }, { w: 30, h: 80, d: 15, px: -450, py: 41, pz: -90 }, { w: 30, h: 80, d: 15, px: -450, py: 41, pz: 70 }, { w: 30, h: 80, d: 15, px: -450, py: 41, pz: 230 }],
  dashboards: [{ w: 77, h: 43, d: 2, px: -325, py: 65, pz: 405 },
    { w: 77, h: 43, d: 2, px: 450, py: 65, pz: 405, bg: '/scr-web/static/img/list/resource.png' },
    { w: 36, h: 43, d: 1, px: -400, py: 65, pz: 405, bg: '/scr-web/static/img/three_room/poster.jpg', frameWidth: 2, color: '#505058' },
    { w: 36, h: 43, d: 1, px: -395, py: 65, pz: 320, bg: '/scr-web/static/img/three_room/poster.jpg', frameWidth: 2, color: '#505058', ry: 1.5707963267948966 }
  ],
  marks: [
    {
      text: 'D 区 域',
      px: 240
    },
    {
      text: 'C 区 域',
      px: 70
    },
    {
      text: 'B 区 域',
      px: -100
    },
    {
      text: 'A 区 域',
      px: -270
    }
  ]
}
