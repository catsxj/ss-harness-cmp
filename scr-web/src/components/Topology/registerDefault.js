export default function registerDefault(
  G6,
  nodeType = 'circle',
  lineType = 'quadratic'
) {
  G6.registerNode(
    'background-animate',
    {
      afterDraw(cfg, group) {
        const r = cfg.size / 2;
        const back1 = group.addShape('circle', {
          zIndex: -3,
          attrs: {
            x: 0,
            y: 0,
            r,
            fill: cfg.color,
            opacity: 0.6
          },
          name: 'back1-shape'
        });
        const back2 = group.addShape('circle', {
          zIndex: -2,
          attrs: {
            x: 0,
            y: 0,
            r,
            fill: cfg.color,
            opacity: 0.6
          },
          name: 'back2-shape'
        });
        const back3 = group.addShape('circle', {
          zIndex: -1,
          attrs: {
            x: 0,
            y: 0,
            r,
            fill: cfg.color,
            opacity: 0.6
          },
          name: 'back3-shape'
        });
        group.sort(); // Sort according to the zIndex
        back1.animate(
          {
            // Magnifying and disappearing
            r: r + 10,
            opacity: 0.1
          },
          {
            duration: 3000,
            easing: 'easeCubic',
            delay: 0,
            repeat: true // repeat
          }
        ); // no delay
        back2.animate(
          {
            // Magnifying and disappearing
            r: r + 10,
            opacity: 0.1
          },
          {
            duration: 3000,
            easing: 'easeCubic',
            delay: 1000,
            repeat: true // repeat
          }
        ); // 1s delay
        back3.animate(
          {
            // Magnifying and disappearing
            r: r + 10,
            opacity: 0.1
          },
          {
            duration: 3000,
            easing: 'easeCubic',
            delay: 2000,
            repeat: true // repeat
          }
        ); // 3s delay
      }
    },
    'image'
  );
  G6.registerEdge(
    'circle-running',
    {
      afterDraw(cfg, group) {
        // 获得当前边的第一个图形，这里是边本身的 path
        const shape = group.get('children')[0];
        // 边 path 的起点位置
        const startPoint = shape.getPoint(0);

        // 添加红色 circle 图形
        const circle = group.addShape('circle', {
          attrs: {
            x: startPoint.x,
            y: startPoint.y,
            fill: '#29EEF7',
            r: 3
          },
          name: 'circle-shape'
        });

        // 对红色圆点添加动画
        circle.animate(
          ratio => {
            // 每一帧的操作，入参 ratio：这一帧的比例值（Number）。返回值：这一帧需要变化的参数集（Object）。
            // 根据比例值，获得在边 path 上对应比例的位置。
            const tmpPoint = shape.getPoint(ratio);
            // 返回需要变化的参数集，这里返回了位置 x 和 y
            return {
              x: tmpPoint.x,
              y: tmpPoint.y
            };
          },
          {
            repeat: true, // 动画重复
            duration: 3000 // 一次动画的时间长度
          }
        );
      }
    },
    lineType
  );
}
