import NodeShape from './node-shape';
import type { NodeShapeOptions } from './node-shape';

// 一级节点标签的字体大小
export const fontSize = 16;
// 一级节点的填充宽度
const paddingWidth = 40;
// 一级节点的高度
export const rectHeight = 37;

// 创建一级节点形状
export function createFirstNodeShape(options: NodeShapeOptions): NodeShape {
  return new NodeShape({
    ...options,
    // 设置标签的基础样式
    labelBaseAttr: {
      'font-size': fontSize,
    },
    // 设置矩形的基础样式
    rectBaseAttr: {
      'fill': '#eee',
      'fill-opacity': 1,
      'stroke': '#808080',
      'stroke-opacity': 0, 
    },
    paddingWidth,
    rectHeight,
  });
}
