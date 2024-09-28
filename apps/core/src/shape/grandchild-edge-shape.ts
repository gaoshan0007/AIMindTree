import { Direction } from '../types';
import { drawGrandChildEdge } from './common/draw-edge';
import type { RaphaelPaper, RaphaelAxisAlignedBoundingBox, RaphaelElement } from 'raphael';

// 孙子节点边形状选项
interface GrandchildEdgeShapeOptions {
  paper: RaphaelPaper;
  sourceBBox: RaphaelAxisAlignedBoundingBox;
  targetBBox: RaphaelAxisAlignedBoundingBox;
  direction: Direction;
  targetDepth: number;
}

// 孙子节点边形状类
export class GrandchildEdgeShape {
  private readonly shape: RaphaelElement;
  public constructor({
    paper,
    sourceBBox,
    targetBBox,
    direction,
    targetDepth,
  }: GrandchildEdgeShapeOptions) {
    // 创建孙子节点边形状
    this.shape = drawGrandChildEdge({
      paper,
      sourceBBox,
      targetBBox,
      direction,
      targetDepth,
      hasUnder: true,
    });

    // 设置边形状的样式
    this.shape.attr({
      'stroke': '#000',
      'stroke-width': 1.5,
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

// 创建孙子节点边形状
export function createGrandchildEdgeShape(options: GrandchildEdgeShapeOptions) {
  return new GrandchildEdgeShape(options);
}
