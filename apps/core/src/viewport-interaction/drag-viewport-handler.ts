import Viewport from '../viewport';

// 有效的拖拽距离差
const validDiff = 2;

// 拖拽视口处理器类
class DragViewportHandler {
  private isStart: boolean = false;
  private lastClientX: number = 0;
  private lastClientY: number = 0;
  private isMoveInited: boolean = false;

  public constructor(private readonly viewport: Viewport) { }

  // 处理鼠标按下事件
  public handleMousedown = (clientX: number, clientY: number): void => {
    this.isStart = true;
    this.lastClientX = clientX;
    this.lastClientY = clientY;
  }

  // 处理鼠标移动事件
  public handleMousemove = (clientX: number, clientY: number): void => {
    if (!this.isStart) return;

    const dx = this.lastClientX - clientX;
    const dy = this.lastClientY - clientY;

    // 如果移动距离超过有效距离,则开始移动视口
    if (!this.isMoveInited && (Math.abs(dx) > validDiff || Math.abs(dy) > validDiff)) {
      document.body.style.cursor = 'grabbing';
      this.isMoveInited = true;
    }

    // 移动视口
    if (this.isMoveInited) {
      this.viewport.translate(dx, dy);
    }

    // 更新上次鼠标位置
    this.lastClientX = clientX;
    this.lastClientY = clientY;
  }

  // 处理鼠标松开事件
  public handleMouseup = (): void => {
    this.isStart = false;
    this.isMoveInited = false;
    this.lastClientX = 0;
    this.lastClientY = 0;

    // 恢复默认光标样式
    document.body.style.cursor = 'default';
  }
}

export default DragViewportHandler;
