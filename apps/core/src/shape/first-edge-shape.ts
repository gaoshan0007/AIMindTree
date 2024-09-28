import { Direction } from '../types';
import { drawFirstEdge } from './common/draw-edge';
import type { RaphaelPaper, RaphaelAxisAlignedBoundingBox, RaphaelElement } from 'raphael';

// 一级边形状选项
interface FirstEdgeShapeOptions {
  paper: RaphaelPaper;
  sourceBBox: RaphaelAxisAlignedBoundingBox;
  targetBBox: RaphaelAxisAlignedBoundingBox;
  direction: Direction;
}

// 一级边形状类
export class FirstEdgeShape {
  private readonly shape: RaphaelElement;
  public constructor({
    paper,
    sourceBBox,
    targetBBox,
    direction
  }: FirstEdgeShapeOptions) {
    // 创建一级边形状
    this.shape = drawFirstEdge({
      paper,
      sourceBBox,
      targetBBox,
      direction
    });
    // 设置边形状的样式
    this.shape.attr({
      'stroke': '#000',
      'stroke-width': 2,
    });
    this.shape.toBack();
  }

  // 设置边形状样式
  public setStyle(styleType: 'disable' | 'base'): void {
    switch(styleType) {
      case 'disable': {
        this.shape.attr({
          'opacity': 0.4,
        });
        break;
      }
      case 'base':
      default: {
        this.shape.attr({
          'opacity': 1,
        });
        break;
      }
    }
  }

  // 删除边形状
  public remove(): void {
    this.shape.remove();
  }
}

// 创建一级边形状
export function createFirstEdgeShape(options: FirstEdgeShapeOptions): FirstEdgeShape {
  return new FirstEdgeShape(options);
}
