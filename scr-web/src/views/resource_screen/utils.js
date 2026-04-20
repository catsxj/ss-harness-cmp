
function getPoint(r, ox, oy, count) {
  const point = []
  var radians = (Math.PI / 180) * Math.round(360 / count), // 弧度
    i = 0
  for (; i < count; i++) {
    var x = ox + r * Math.sin(radians * i),
      y = oy + r * Math.cos(radians * i)

    point.unshift({ x: x - 50, y: y - 50 }) // 为保持数据顺时针
  }
  return point
}
const translateX = '200px';
const rotateY = '-57deg';
export function generateKeyframes(count) {
  const style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  document.head.appendChild(style);
  const sheet = style.sheet;
  for (let i = 0; i < count; i++) {
    const unit = 360 / count * i;
    const str = `@keyframes move${i} { 
      from {
        transform: rotateZ(-${unit}deg) translateX(${translateX}) rotateZ(${unit}deg)
          rotateY(${rotateY});
      }
      to {
        transform: rotateZ(${360 - unit}deg) translateX(${translateX})
          rotateZ(${unit - 360}deg) rotateY(${rotateY});
      }
    }`
    sheet.insertRule(str);
  }
  return style;
}
