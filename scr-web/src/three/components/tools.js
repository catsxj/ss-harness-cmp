import { Texture } from 'three';
export const generateRacks = (rows, cols, l, w, startX, startY) => {
  const result = [];
  const ySpace = (w - 30 * cols) / (cols + 1);
  const yStep = (w - ySpace) / cols;
  const y = startY + 30 / 2 + ySpace;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const obj = {
        name: 'A',
        // servers: [
        //   {
        //     type: 'server3',
        //     h: 8,
        //     y: 39
        //   },
        //   {
        //     type: 'switch',
        //     h: 10,
        //     y: 51
        //   }
        // ],
        size: { w: 30, h: 70, d: 30 }, // 尺寸
        position: {
          px: startX + (l / rows) * i,
          py: 0,
          pz: y + yStep * j,
          ry: Math.PI / 2
        }
      };
      result.push(obj);
    }
  }
  return result;
};
export function canvasTxture(str, configs = {}) {
  const { width, height, font = '20px SimHei', color = '#00ffff', fillColor = '#777' } = configs;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  // const g = ctx.createLinearGradient(0, 0, width, height);
  // g.addColorStop(0, '#777');
  // g.addColorStop(1, '#777');
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = 'top';
  ctx.font = font;
  ctx.fillStyle = color; // 编号颜色
  const txtWidth = ctx.measureText(str).width;
  ctx.fillText(str, width / 2 - txtWidth / 2, height / 2 - 20 / 2);
  const texture = new Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}
export const generateRackLocation = (l, w, cols, rows) => {
  const result = {};
  const LWIDTH = l / (cols + 1);
  const WWIDTH = w / (rows + 1);
  for (let i = 1; i <= cols; i++) {
    for (let j = 1; j <= rows; j++) {
      const obj = {
        size: { w: 30, h: 70, d: 30 }, // 尺寸
        position: {
          px: l / 2 - LWIDTH * i + 50,
          py: 0,
          pz: w / 2 - WWIDTH * j,
          ry: Math.PI / 2
        }
      };
      result[`${i},${j}`] = obj;
    }
  }
  return result;
};
