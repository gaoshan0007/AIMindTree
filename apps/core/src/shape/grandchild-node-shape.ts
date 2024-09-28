import NodeShape from './node-shape';
import type { NodeShapeOptions } from './node-shape';

// 孙子节点标签的字体大小
export const fontSize = 13;
// 孙子节点的填充宽度
const paddingWidth = 20;
// 孙子节点的高度
export const rectHeight = 21;

// 创建孙子节点形状
export function createGrandchildNodeShape(options: NodeShapeOptions): NodeShape {
  return new NodeShape({
    ...options,
    // 设置标签的基础样式
    labelBaseAttr: {
      'font-size': fontSize,
    },
    // 设置矩形的基础样式
    rectBaseAttr: {
      'stroke-opacity': 0,
    },
    paddingWidth,
    rectHeight,
  });
}
