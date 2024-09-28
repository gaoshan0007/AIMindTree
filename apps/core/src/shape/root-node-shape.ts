import NodeShape from './node-shape';
import type { NodeShapeOptions } from './node-shape';

// 根节点标签的字体大小
export const fontSize = 25;
// 根节点的填充宽度
const paddingWidth = 42;
// 根节点的高度
export const rectHeight = 52;

// 创建根节点形状
export function createRootNodeShape(options: NodeShapeOptions): NodeShape {
  return new NodeShape({
    ...options,
    // 设置标签的基础样式
    labelBaseAttr: {
      'font-size': fontSize,
      'fill': '#fff',
      'fill-opacity': 1,
    },
    // 设置矩形的基础样式
    rectBaseAttr: {
      'fill': '#3F89DE',
      'fill-opacity': 1,
      'stroke-opacity': 0, 
    },
    paddingWidth,
    rectHeight,
  });
}
