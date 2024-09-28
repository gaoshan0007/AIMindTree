import type { RaphaelPaper, RaphaelElement, RaphaelSet, RaphaelAxisAlignedBoundingBox } from 'raphael';

// 协作标签的填充宽高和边框宽度
const paddingWidth = 20;
const paddingHeight = 12;
const borderPadding = 6;
const borderWidth = 2;

// 协作标签形状类
class CollaborateShape {
  private readonly labelShape: RaphaelElement;
  private readonly rectShape: RaphaelElement;
  private readonly borderShape: RaphaelElement;
  private readonly shapeSet: RaphaelSet;
  public constructor({
    paper,
    nodeBBox,
    name,
    color,
  }: {
    paper: RaphaelPaper;
    nodeBBox: RaphaelAxisAlignedBoundingBox;
    name: string;
    color: string;
  }) {
    // 创建协作标签的矩形、文本和边框形状
    this.rectShape = paper.rect(nodeBBox.x, nodeBBox.y, 0, 0);
    this.labelShape = paper.text(nodeBBox.x, nodeBBox.y, name);
    this.borderShape = paper.rect(nodeBBox.x, nodeBBox.y, 0, 0, 4);
    this.shapeSet = paper.set().push(this.labelShape, this.rectShape, this.borderShape);
    this.shapeSet.toBack();

    // 设置协作标签的样式
    this.labelShape.attr({
      'stroke': '#fff',
    });

    this.rectShape.attr({
      'fill': color,
      'stroke-opacity': 0,
    });

    this.borderShape.attr({
      'stroke': color,
      'stroke-width': borderWidth,
      'fill-opacity': 0,
    });

    // 设置协作标签的位置
    this.setPosition(nodeBBox);
  }

  // 删除协作标签
  public remove(): void {
    this.shapeSet.remove();
  }

  // 设置协作标签的位置
  public setPosition(nodeBBox: RaphaelAxisAlignedBoundingBox): void {
    const labelBBox = this.labelShape.getBBox();

    // 计算协作标签的宽高
    const rectWidth = labelBBox.width + paddingWidth;
    const rectHeight = labelBBox.height + paddingHeight;

    // 设置矩形和边框的大小
    this.rectShape.attr({
      width: rectWidth,
      height: rectHeight,
    });

    this.borderShape.attr({
      width: nodeBBox.width + borderPadding,
      height: nodeBBox.height + borderPadding,
    });

    // 计算协作标签的位置
    const rectBBox = this.rectShape.getBBox();
    const rectX = nodeBBox.x - borderPadding / 2;
    const rectY = nodeBBox.y - rectBBox.height - borderPadding / 2;

    const labelX = rectX + (rectBBox.width - labelBBox.width) / 2;
    const labelY = rectY + (rectBBox.height - labelBBox.height) / 2;

    const borderX = nodeBBox.x - borderPadding / 2;
    const borderY = nodeBBox.y - borderPadding / 2;

    // 移动协作标签的各个形状到指定位置
    this.shapeTranslateTo(this.labelShape, labelX, labelY);
    this.shapeTranslateTo(this.rectShape, rectX, rectY);
    this.shapeTranslateTo(this.borderShape, borderX, borderY);
  }

  // 移动形状到指定位置
  private shapeTranslateTo(shape: RaphaelElement | RaphaelSet, x: number, y: number): void {
    const { x: oldX, y: oldY } = shape.getBBox();
    const dx = x - oldX;
    const dy = y - oldY;

    if (dx === 0 && dy === 0) return;

    shape.translate(dx, dy);
  }
}

export default CollaborateShape;
