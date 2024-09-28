import ShapeEventEmitter from './common/shape-event-emitter';
import NodeShapeStyle from './common/node-shape-style';
import { Direction } from '../types';
import { isMobile } from '../helper';
import type { EventNames, EventArgs } from './common/shape-event-emitter';
import type { RaphaelPaper, RaphaelSet, RaphaelElement, RaphaelAxisAlignedBoundingBox, RaphaelAttributes } from 'raphael';
import type { StyleType } from './common/node-shape-style';
import type { ImageData } from '../types';

// 节点不可见时的坐标
const invisibleX = -999999;
const invisibleY = -999999;

// 节点默认的填充宽度和高度
const defaultPaddingWidth = 40;
const defaultRectHeight = 37;
const borderPadding = 6;

// 节点形状选项
export interface NodeShapeOptions {
  paper: RaphaelPaper;
  x?: number;
  y?: number;
  label: string;
  paddingWidth?: number;
  rectHeight?: number;
  labelBaseAttr?: Partial<RaphaelAttributes>;
  rectBaseAttr?: Partial<RaphaelAttributes>;
  borderBaseAttr?: Partial<RaphaelAttributes>;
  imageData?: ImageData | null;
  link?: string;
}

// 节点形状类
class NodeShape {
  private readonly paper: RaphaelPaper;
  private readonly shapeSet: RaphaelSet;
  private readonly borderShape: RaphaelElement;
  private readonly labelShape: RaphaelElement;
  private readonly rectShape: RaphaelElement;
  private readonly imageShape: RaphaelElement | null = null;
  private readonly paddingWidth: number;
  private readonly rectHeight: number;
  private readonly shapeEventEmitter: ShapeEventEmitter;
  private readonly nodeShapeStyle: NodeShapeStyle;
  private readonly imageData: ImageData | null = null;
  private label: string;
  private isHide: boolean = false;
  private isHoverInCalled: boolean = false;
  public constructor({
    paper,
    x,
    y,
    label,
    paddingWidth = defaultPaddingWidth,
    rectHeight = defaultRectHeight,
    labelBaseAttr,
    rectBaseAttr,
    borderBaseAttr,
    imageData,
    link,
  }: NodeShapeOptions) {
    this.paper = paper;
    this.label = label;
    this.paddingWidth = paddingWidth;
    this.rectHeight = rectHeight;

    // 如果没有 x 或 y 坐标,则将形状移动到不可见的位置
    const hasValidPosition = (x !== undefined && y !== undefined);
    const shapeX = hasValidPosition ? x : invisibleX;
    const shapeY = hasValidPosition ? y : invisibleY;

    // 创建节点形状元素
    this.labelShape = paper.text(shapeX, shapeY, label);
    this.borderShape = paper.rect(shapeX, shapeY, 0, 0, 4);
    this.rectShape = paper.rect(shapeX, shapeY, 0, 0, 4);
    this.shapeSet = paper.set()
      .push(this.labelShape)
      .push(this.borderShape)
      .push(this.rectShape);

    // 如果有图像数据,则创建图像形状
    if (imageData) {
      this.imageShape = paper.image(imageData.src, shapeX, shapeY, imageData.width, imageData.height);
      this.shapeSet.push(this.imageShape);
    }
    this.imageData = imageData || null;

    // 如果有链接,则为标签添加点击事件
    if (link) {
      const mousedownEventName = isMobile ? 'touchstart' : 'mousedown';
      this.labelShape[mousedownEventName](() => {
        window.location.href = link;
      });
      this.labelShape.attr({
        stroke: '#3498DB',
      });
      // @ts-ignore
      this.labelShape.node.style.cursor = 'pointer';
    }

    // 创建节点样式管理器
    this.nodeShapeStyle = new NodeShapeStyle({
      shapeSet: this.shapeSet,
      labelShape: this.labelShape,
      borderShape: this.borderShape,
      rectShape: this.rectShape,
      labelBaseAttr,
      rectBaseAttr,
      borderBaseAttr,
    });
    this.nodeShapeStyle.setBaseStyle();

    // 将标签移到最前面
    this.labelShape.toFront();
    // @ts-ignore
    this.labelShape.node.style['user-select'] = 'none';

    // 设置节点位置
    this.setPosition(shapeX, shapeY);
    this.shapeEventEmitter = new ShapeEventEmitter(this.shapeSet);

    // 如果没有有效的位置,则隐藏节点
    if (!hasValidPosition) {
      this.hide();
    }

    this.initHover();
  }

  // 获取节点的边界框
  public getBBox(): RaphaelAxisAlignedBoundingBox {
    return this.rectShape.getBBox();
  }

  // 获取标签的边界框
  public getLabelBBox(): RaphaelAxisAlignedBoundingBox {
    return this.labelShape.getBBox();
  }

  // 设置节点标签
  public setLabel(label: string, direction?: Direction): void {
    const beforeLabelBBox = this.labelShape.getBBox();
    this.labelShape.attr({
      text: label,
    });
    const afterLabelBBox = this.labelShape.getBBox();

    const bbox = this.getBBox();
    const diff = afterLabelBBox.width - beforeLabelBBox.width;

    this.setPosition(bbox.x, bbox.y);

    // 如果方向不是右或左,则将形状整体移动
    if (direction !== Direction.RIGHT && direction !== Direction.LEFT) {
      this.shapeSet.translate(-diff / 2, 0);
    }

    this.label = label;
  }

  // 移动节点到指定位置
  public translateTo(x: number, y: number): void {
    const { x: oldX, y: oldY, } = this.getBBox();
    const dx = x - oldX;
    const dy = y - oldY;

    this.show();

    if (dx === 0 && dy === 0) return;

    this.shapeSet.translate(dx, dy);
  }

  // 平移节点
  public translate(dx: number, dy: number): void {
    this.shapeSet.translate(dx, dy);
  }

  // 设置节点样式
  public setStyle(styleType: StyleType): void {
    this.nodeShapeStyle.setStyle(styleType);
  }

  // 获取节点样式
  public getStyle(): StyleType {
    return this.nodeShapeStyle.getStyle();
  }

  // 克隆节点
  public clone(): NodeShape {
    const { x, y } = this.getBBox();
    return new NodeShape({
      paper: this.paper,
      x,
      y,
      label: this.label,
      paddingWidth: this.paddingWidth,
      rectHeight: this.rectHeight,
      ...this.nodeShapeStyle.getBaseAttr(),
    });
  }

  // 删除节点
  public remove(): void {
    this.shapeSet.remove();
    this.shapeEventEmitter.removeAllListeners();
  }

  // 添加事件监听器
  public on<T extends EventNames>(eventName: EventNames, ...args: EventArgs<T>): void {
    this.shapeEventEmitter.on(eventName, ...args);
  }

  // 显示节点
  public show(): void {
    this.shapeSet.show();
    this.isHide = false;
  }

  // 隐藏节点
  public hide(): void {
    this.shapeSet.hide();
    this.isHide = true;
  }

  // 获取节点是否隐藏
  public getIsHide(): boolean {
    return this.isHide;
  }

  // 将节点移到最前面
  public toFront(): void {
    this.borderShape.toFront();
    this.rectShape.toFront();
    this.labelShape.toFront();
  }

  // 判断节点是否不可见
  public isInvisible(): boolean {
    const bbox = this.getBBox();
    return bbox.x === invisibleX && bbox.y === invisibleY;
  }

  // 将形状移动到指定位置
  private shapeTranslateTo(shape: RaphaelElement | RaphaelSet, x: number, y: number): void {
    const { x: oldX, y: oldY } = shape.getBBox();
    const dx = x - oldX;
    const dy = y - oldY;

    if (dx === 0 && dy === 0) return;

    shape.translate(dx, dy);
  }

  // 设置节点位置
  private setPosition(x: number, y: number): void {
    const { labelShape, borderShape, rectShape, imageShape, paddingWidth, rectHeight, imageData } = this;

    const labelBBox = labelShape.getBBox();
    const paddingHeight = rectHeight - labelBBox.height;

    // 根据图像数据的方向,确定标签和图像的位置
    const leftShape = imageData?.toward === 'right' ? labelShape : imageShape;
    const rightShape = imageData?.toward === 'right' ? imageShape : labelShape;
    const defaultBBox = { x: 0, y: 0, width: 0, height: 0 };
    const leftBBox = leftShape?.getBBox() || defaultBBox;
    const rightBBox = rightShape?.getBBox() || defaultBBox;

    let imageGap = 0;
    if (imageShape) {
      imageGap = (imageData?.gap !== undefined && imageData?.gap >= 0) ? imageData?.gap : 8;
    }

    // 计算节点的宽高
    const contentWidth = leftBBox.width + rightBBox.width + paddingWidth + imageGap;
    const contentHeight = paddingHeight + Math.max(leftBBox.height, rightBBox.height);

    rectShape.attr({
      width: contentWidth,
      height: contentHeight,
    });

    borderShape.attr({
      width: contentWidth + borderPadding,
      height: contentHeight + borderPadding,
    });

    // 设置各个形状的位置
    const leftShapeX = x + (paddingWidth / 2);
    const leftShapeY = y + ((contentHeight - leftBBox.height) / 2);
    const rightShapeX = leftShapeX + leftBBox.width + imageGap;
    const rightShapeY = y + ((contentHeight - rightBBox.height) / 2)

    this.shapeTranslateTo(borderShape, x - borderPadding / 2, y - borderPadding / 2);
    leftShape && this.shapeTranslateTo(leftShape, leftShapeX, leftShapeY);
    rightShape && this.shapeTranslateTo(rightShape, rightShapeX, rightShapeY);
  }

  // 初始化鼠标悬浮事件
  private initHover(): void {
    if (isMobile) return;

    this.shapeEventEmitter.on('hover', () => {
      const curStyleType = this.nodeShapeStyle.getStyle();
      if (curStyleType !== 'select' && curStyleType !== 'disable') {
        this.nodeShapeStyle.setStyle('hover');
        this.isHoverInCalled = true;
      }
    }, () => {
      const curStyleType = this.nodeShapeStyle.getStyle();
      if (this.isHoverInCalled && curStyleType !== 'select' && curStyleType !== 'disable') {
        this.nodeShapeStyle.setStyle('base');
        this.isHoverInCalled = false;
      }
    });
  }
}

export default NodeShape;
