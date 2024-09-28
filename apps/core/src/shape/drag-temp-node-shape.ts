import { RaphaelAxisAlignedBoundingBox, RaphaelElement, RaphaelPaper, RaphaelSet } from "raphael";
import { Direction } from "../types";
import { getNodeXGap } from './gap';
import { drawFirstEdge, drawGrandChildEdge } from './common/draw-edge';

// 拖拽临时节点形状选项
interface DragTempNodeShapeOptions {
  paper: RaphaelPaper;
  sourceBBox: RaphaelAxisAlignedBoundingBox;
  targetBBox1: RaphaelAxisAlignedBoundingBox | null;
  targetBBox2: RaphaelAxisAlignedBoundingBox | null;
  targetDepth: number;
  direction: Direction;
}

// 拖拽临时节点形状相关常量
const firstBoundaryOffset = 55;
const boundaryYOffset = 14;
const rectWidth = 50;
const rectHeight = 13;
const grandchildYOffset = 3;

// 拖拽临时节点形状类
class DragTempNodeShape {
  private readonly paper: RaphaelPaper;
  private readonly shapeSet: RaphaelSet;

  public constructor({
    paper,
    sourceBBox,
    targetBBox1,
    targetBBox2,
    targetDepth,
    direction,
  }: DragTempNodeShapeOptions) {
    this.paper = paper;

    // 获取有效的目标边界框
    const validTargetBBox = targetBBox1 || targetBBox2;

    // 根据目标深度计算 Y 轴偏移量
    const yOffset = targetDepth === 1 ? firstBoundaryOffset : boundaryYOffset;

    let x = 0;

    // 计算矩形的 X 坐标
    if (validTargetBBox !== null) {
      x = direction === Direction.RIGHT ? validTargetBBox.x : (validTargetBBox.x2 - rectWidth);
    } else {
      const xGap = getNodeXGap(targetDepth);
      x = direction === Direction.RIGHT ? (sourceBBox.x2 + xGap) : (sourceBBox.x - xGap - rectWidth);
    }

    // 计算矩形的 Y 坐标
    let cy = 0;
    if (targetBBox1 !== null && targetBBox2 !== null) {
      cy = (targetBBox2.y + targetBBox1.y2) / 2;
    } else if (targetBBox1 !== null && targetBBox2 === null) {
      cy = targetBBox1.y2 + yOffset;

      if (targetDepth > 1) cy += grandchildYOffset;
    } else if (targetBBox1 === null && targetBBox2 !== null) {
      cy = targetBBox2.y - yOffset;

      if (targetDepth > 1) cy += grandchildYOffset;
    } else {
      cy = sourceBBox.cy;
    }

    const y = cy - rectHeight / 2;

    // 绘制矩形形状
    const rectShape = this.drawRect({ x, y });
    // 绘制边形状
    const edgeShape = this.drawPath({
      sourceBBox,
      targetBBox: rectShape.getBBox(),
      targetDepth,
      direction,
    });

    // 将矩形和边形状添加到形状集合中
    this.shapeSet = paper.set().push(rectShape).push(edgeShape);
  }

  // 删除拖拽临时节点形状
  public remove(): void {
    this.shapeSet.remove();
  }

  // 绘制矩形形状
  private drawRect({ x, y }: { x: number; y: number; }) {
    const rectShape = this.paper.rect(x, y, rectWidth, rectHeight, 6);
    rectShape.attr({
      'fill': '#E74C3C',
      'stroke-opacity': 0,
      'opacity': 0.8,
    });
    return rectShape;
  }

  // 绘制边形状
  private drawPath({
    sourceBBox,
    targetBBox,
    targetDepth,
    direction,
  }: {
    sourceBBox: RaphaelAxisAlignedBoundingBox;
    targetBBox: RaphaelAxisAlignedBoundingBox;
    targetDepth: number;
    direction: Direction;
  }): RaphaelElement {
    // 根据目标深度绘制不同类型的边形状
    const edgeShape = targetDepth === 1 ?
      drawFirstEdge({
        paper: this.paper,
        sourceBBox,
        targetBBox,
        direction,
      }) :
      drawGrandChildEdge({
        paper: this.paper,
        sourceBBox,
        targetBBox,
        direction,
        targetDepth,
      });

    // 设置边形状的样式
    edgeShape.attr({
      stroke: '#E74C3C',
      'stroke-width': 2,
      opacity: 0.6,
    });

    return edgeShape;
  }
}

export default DragTempNodeShape;
