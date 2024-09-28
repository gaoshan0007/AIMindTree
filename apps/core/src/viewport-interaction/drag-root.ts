import Node from '../node/node';
import DragViewportHandler from './drag-viewport-handler';

// 拖拽根节点类
class DragRoot {
  private isStart: boolean = false;
  public constructor(
    private readonly root: Node,
    private readonly dragViewportHandler: DragViewportHandler
  ) {
    // 为根节点添加拖拽事件监听器
    root.on('drag', this.move, this.start, this.end);
    this.dragViewportHandler = dragViewportHandler;
  }

  // 处理拖拽开始事件
  private start = (clientX: number, clientY: number, event: MouseEvent): void => {
    event.stopPropagation();
    this.isStart = true;
    this.dragViewportHandler.handleMousedown.call(this.dragViewportHandler, clientX, clientY);
  }

  // 处理拖拽移动事件
  private move = (dx: number, dy: number, clientX: number, clientY: number): void => {
    if (!this.isStart) return;
    this.dragViewportHandler.handleMousemove.call(this.dragViewportHandler, clientX, clientY);
  }

  // 处理拖拽结束事件
  private end = (): void => {
    this.isStart = false;
    this.dragViewportHandler.handleMouseup.call(this.dragViewportHandler);
  }
}

export default DragRoot;
