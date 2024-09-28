import PaperWrapper from './paper-wrapper';
import EventEmitter from 'eventemitter3';
import type { RaphaelPaper } from 'raphael';

// 视口的边界框
export interface Viewbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 视口事件映射
interface ViewportEventMap {
  changeScale: (scale: number) => void;
}

// 视口缩放的最大和最小比例
const maxScale = 3;
const minScale = 0.25;

// 缩放变化值
const scaleStep = 0.1;

// 视口类
class Viewport {
  private readonly paper: RaphaelPaper;
  private readonly eventEmitter: EventEmitter<ViewportEventMap>;
  private readonly viewbox: Viewbox = { x: 0, y: 0, width: 0, height: 0 };
  private wrapperWidth: number;
  private wrapperHeight: number;
  private scale: number = 1;
  public constructor(
    private readonly paperWrapper: PaperWrapper,
    scale?: number,
  ) {
    // 如果传入了缩放比例,则使用该比例
    if (scale && Number.isFinite(scale)) {
      this.scale = scale;
    }

    this.paper = this.paperWrapper.getPaper();
    const paperSize = this.paperWrapper.getSize();
    this.wrapperWidth = paperSize.width;
    this.wrapperHeight = paperSize.height;

    this.eventEmitter = new EventEmitter<ViewportEventMap>();

    // 确保缩放比例在最大和最小值之间
    if (this.scale > maxScale) {
      this.scale = maxScale;
    } else if (this.scale < minScale) {
      this.scale = minScale;
    }
    this.setScale(this.scale);
  }

  // 获取视口的边界框
  public getViewbox(): Viewbox {
    return this.viewbox;
  }

  // 获取当前的缩放比例
  public getScale(): number {
    return this.scale;
  }

  // 设置缩放比例
  public setScale(scale: number): void {
    // 确保缩放比例在最大和最小值之间
    if (scale > maxScale) {
      scale = maxScale;
    } else if (scale < minScale) {
      scale = minScale;
    }

    const viewbox = this.viewbox;

    // 根据缩放比例计算视口的宽高和位置
    viewbox.width = this.wrapperWidth / scale;
    viewbox.height = this.wrapperHeight / scale;
    viewbox.x = this.getScalePosition(this.scale, scale, viewbox.x, this.wrapperWidth);
    viewbox.y = this.getScalePosition(this.scale, scale, viewbox.y, this.wrapperHeight);
    this.scale = scale;

    // 设置视口的显示区域
    this.setViewBox();
    // 触发缩放事件
    this.eventEmitter.emit('changeScale', this.scale);
  }

  // 增加缩放比例
  public addScale(dScale: number): void {
    const newScale = this.scale + (dScale * scaleStep);
    this.setScale(newScale);
  }

  // 监听视口事件
  public on<T extends EventEmitter.EventNames<ViewportEventMap>>(
    eventName: T,
    callback: EventEmitter.EventListener<ViewportEventMap, T>
  ) {
    this.eventEmitter.on(eventName, callback);
  }

  // 平移视口
  public translate(dx: number, dy: number) {
    const viewbox = this.viewbox;
    viewbox.x = viewbox.x + (dx / this.scale);
    viewbox.y = viewbox.y + (dy / this.scale);
    this.setViewBox();
  }

  // 设置视口位置
  public translateTo(x: number, y: number) {
    const viewbox = this.viewbox;
    viewbox.x = x;
    viewbox.y = y;
    this.setViewBox();
  }

  // 调整视口大小
  public resize(width: number, height: number) {
    const viewbox = this.viewbox;
    viewbox.width = (width / this.wrapperWidth) * viewbox.width;
    viewbox.height = (height / this.wrapperHeight) * viewbox.height;

    this.setViewBox();

    this.wrapperWidth = width;
    this.wrapperHeight = height;
  }

  // 根据鼠标位置获取视口中的坐标
  public getViewportPosition(clientX: number, clientY: number): {
    x: number;
    y: number;
  } {
    const wrapperDom = this.paperWrapper.getWrapperDom();
    const wrapperRect = wrapperDom.getBoundingClientRect();

    return {
      x: this.viewbox.x + (clientX - wrapperRect.x) / this.scale,
      y: this.viewbox.y + (clientY - wrapperRect.y) / this.scale,
    };
  }

  // 根据视口坐标获取偏移量
  public getOffsetPosition(x: number, y: number): {
    offsetX: number;
    offsetY: number;
  } {
    return {
      offsetX: (x - this.viewbox.x) * this.scale,
      offsetY: (y - this.viewbox.y) * this.scale,
    }
  }

  // 根据缩放比例计算新的位置
  private getScalePosition(oldScale: number, scale: number, oldPosition: number, wrapperSize: number) {
    return oldPosition + wrapperSize * ((1 / oldScale) - (1 / scale)) / 2;
  }

  // 设置视口的显示区域
  private setViewBox(): void {
    const viewbox = this.viewbox;
    this.paper.setViewBox(viewbox.x, viewbox.y, viewbox.width, viewbox.height, true);
  }
}

export default Viewport;
