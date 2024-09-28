import type { RaphaelPaper, RaphaelElement, RaphaelAxisAlignedBoundingBox } from 'raphael';

// 多选形状类
class MultiSelectShape {
  private startX: number = 0;
  private startY: number = 0;
  private isInit: boolean = false;
  private rectShape: RaphaelElement | null = null;
  public constructor(private readonly paper: RaphaelPaper) {}

  // 初始化多选形状
  public init(startX: number, startY: number) {
    this.startX = startX;
    this.startY = startY;
    this.isInit = true;
  }

  // 调整多选形状大小
  public resize(endX: number, endY: number) {
    if (!this.isInit) return;

    const { startX, startY } = this;

    // 计算多选框的位置和大小
    const x = startX < endX ? startX : endX;
    const y = startY < endY ? startY : endY;
    const width = Math.abs(startX - endX);
    const height = Math.abs(startY - endY);

    // 创建或更新多选框形状
    if (this.rectShape === null) {
      this.rectShape = this.paper.rect(x, y, width, height);
      this.rectShape.attr({
        stroke: '#73a1bf',
        fill: 'rgba(153,124,255,0.1)',
        opacity: 0.8,
      })
    } else {
      this.rectShape.attr({ x, y, width, height });
    }
  }

  // 隐藏多选形状
  public hide() {
    this.isInit = false;
    this.rectShape?.remove();
    this.rectShape = null;
  }

  // 获取多选框的边界框
  public getBBox(): RaphaelAxisAlignedBoundingBox {
    return this.rectShape?.getBBox()!;
  }
}


export default MultiSelectShape;
