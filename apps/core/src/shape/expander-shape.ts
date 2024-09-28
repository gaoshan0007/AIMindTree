import { Direction } from '../types';
import ShapeEventEmitter from './common/shape-event-emitter';
import { isMobile } from '../helper';
import type { RaphaelPaper, RaphaelAxisAlignedBoundingBox, RaphaelSet, RaphaelElement } from 'raphael';
import type { EventNames, EventArgs } from './common/shape-event-emitter';

// 展开按钮的圆圈半径
const circleRadius = isMobile ? 7 : 5;
// 展开按钮的操作图标宽度
const operationWidth = circleRadius * 0.6;
// 展开按钮的位置偏移量
const circlePositionOffset = isMobile ? 3 : 2;

// 展开按钮的宽度
export const expanderBoxWidth = circleRadius * 2 + circlePositionOffset + 3;

// 展开按钮形状类
class ExpanderShape {
  private readonly paper: RaphaelPaper;
  private readonly circleShape: RaphaelElement;
  private readonly horizontalShape: RaphaelElement;
  private readonly verticalShape: RaphaelElement;
  private readonly shapeSet: RaphaelSet;
  private readonly shapeEventEmitter: ShapeEventEmitter;
  private isExpand: boolean;
  public constructor({
    paper,
    nodeBBox,
    isExpand,
    direction,
  }: {
    paper: RaphaelPaper;
    nodeBBox: RaphaelAxisAlignedBoundingBox;
    isExpand: boolean;
    direction: Direction;
  }) {
    this.paper = paper;
    this.isExpand = isExpand;
    this.shapeSet = paper.set();

    // 根据节点方向计算展开按钮的位置
    const { x, y } = this.getPosition(nodeBBox, direction);

    // 创建展开按钮的圆圈
    this.circleShape = paper.circle(x, y, circleRadius);
    this.circleShape.attr({
      'fill': '#fff',
      'fill-opacity': 1,
    });

    // @ts-ignore
    this.circleShape.node.style['cursor'] = 'pointer';

    // 创建展开按钮的横竖线
    const {
      cx: circleCx,
      cy: circleCy,
    } = this.circleShape.getBBox();

    this.horizontalShape = paper.path([
      `M${circleCx - operationWidth} ${circleCy}`,
      `L${circleCx + operationWidth} ${circleCy}`,
    ].join(' '));

    this.verticalShape = this.paper.path([
      `M${circleCx} ${circleCy - operationWidth}`,
      `L${circleCx} ${circleCy + operationWidth}`,
    ].join(' '));

    // 将圆圈、横线和竖线添加到形状集合中
    this.shapeSet.push(this.circleShape).push(this.horizontalShape).push(this.verticalShape);

    // 如果节点处于展开状态,则隐藏竖线
    if (isExpand) {
      this.verticalShape.hide();
    }

    // 设置形状的样式
    this.shapeSet.attr({
      'stroke': '#000',
      'stroke-opacity': 0.7,
    });
    this.shapeSet.toFront();

    // 创建形状事件发射器
    this.shapeEventEmitter = new ShapeEventEmitter(this.shapeSet);

    // 初始化鼠标悬浮事件
    this.initHover();
  }

  // 添加事件监听器
  public on<T extends EventNames>(eventName: EventNames, ...args: EventArgs<T>): void {
    this.shapeEventEmitter.on(eventName, ...args);
  }

  // 改变展开状态
  public changeExpand(newIsExpand: boolean): void {
    if (this.isExpand === newIsExpand) return;

    if (newIsExpand) {
      this.verticalShape.hide();
    } else {
      this.verticalShape.show();
    }

    this.isExpand = newIsExpand;
  }

  // 移动展开按钮到指定位置
  public translateTo(nodeBBox: RaphaelAxisAlignedBoundingBox, direction: Direction) {
    const { x, y } = this.getPosition(nodeBBox, direction);

    const {
      cx: oldX,
      cy: oldY,
    } = this.getBBox();

    const dx = x - oldX;
    const dy = y - oldY;

    if (dx === 0 && dy === 0) {
      return;
    }

    this.shapeSet.translate(dx, dy);
  }

  // 获取展开按钮的边界框
  public getBBox(): RaphaelAxisAlignedBoundingBox {
    return this.circleShape.getBBox();
  }

  // 删除展开按钮
  public remove(): void {
    this.shapeSet.remove();
    this.shapeEventEmitter.removeAllListeners();
  }

  // 设置展开按钮的样式
  public setStyle(styleType: 'disable' | 'base' | 'hover'): void {
    switch(styleType) {
      case 'disable': {
        this.setStyle('base');
        this.shapeSet.attr({
          'opacity': 0.4,
        });
        break;
      }
      case 'hover': {
        this.setStyle('base');
        this.circleShape.attr({
          'fill': '#E7E7E7',
          'fill-opacity': 1,
        });
        break;
      }
      case 'base':
      default: {
        this.shapeSet.attr({
          'opacity': 1,
        });
        this.circleShape.attr({
          'fill': '#fff',
          'fill-opacity': 1,
        });
        break;
      }
    }
  }

  // 根据节点方向计算展开按钮的位置
  private getPosition(nodeBBox: RaphaelAxisAlignedBoundingBox, direction: Direction): {
    x: number;
    y: number;
  } {
    let x = 0;
    const y = nodeBBox.cy;
    if (direction === Direction.RIGHT) {
      x = nodeBBox.x2 + circleRadius + circlePositionOffset;
    } else {
      x = nodeBBox.x - circleRadius - circlePositionOffset;
    }

    return {
      x,
      y,
    };
  }

  // 初始化鼠标悬浮事件
  private initHover(): void {
    this.shapeEventEmitter.on('hover', () => {
      this.setStyle('hover');
    }, () => {
      this.setStyle('base');
    });
  }
}

export default ExpanderShape;
