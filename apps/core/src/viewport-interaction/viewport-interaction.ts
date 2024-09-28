import Node from '../node/node';
import Viewport from '../viewport';
import PaperWrapper from '../paper-wrapper';
import DragViewportHandler from './drag-viewport-handler';
import DragRoot from './drag-root';
import DragBackground from './drag-background';
import ViewportWheel from './viewport-wheel';
import ViewportResize from './viewport-resize';
import { isMobile } from '../helper';

// 视口交互选项
interface ViewportInteractionOptions {
  paperWrapper: PaperWrapper;
  viewport: Viewport;
  root: Node;
}

// 缩放速度
const zoomSpeed = 0.25;

// 视口交互类,用于操作视口
class ViewportInteraction {
  private readonly viewport: Viewport;
  private readonly root: Node;
  private readonly dragBackground: DragBackground;
  private readonly viewportWheel: ViewportWheel;
  private readonly viewportResize: ViewportResize;
  public constructor(options: ViewportInteractionOptions) {
    const {
      paperWrapper,
      viewport,
      root,
    } = options;

    this.viewport = viewport;
    this.root = root;

    // 初始化拖拽
    const dragResult = this.initDrag(options);
    this.dragBackground = dragResult.dragBackground;

    // 初始化滚轮事件
    const wrapperDom = paperWrapper.getWrapperDom();
    this.viewportWheel = new ViewportWheel(viewport, wrapperDom);

    // 初始化调整大小事件
    this.viewportResize = new ViewportResize(paperWrapper, viewport);
  }

  // 禁用背景拖拽
  public disableBackgroundDrag = (): void => this.dragBackground.disable();

  // 启用背景拖拽
  public enableBackgroundDrag = (): void => this.dragBackground.enable();

  // 启用移动和缩放
  public enableMoveScale = (): void => this.viewportWheel.enableMoveScale();

  // 禁用移动和缩放
  public disableMoveScale = (): void => this.viewportWheel.disableMoveScale();

  // 放大视口
  public zoomIn(): void {
    this.viewport.addScale(zoomSpeed);
  }

  // 缩小视口
  public zoomOut(): void {
    this.viewport.addScale(-zoomSpeed);
  }

  // 将视口移动到中心
  public translateToCenter(): void {
    const rootBBox = this.root.getBBox();
    const viewbox = this.viewport.getViewbox();

    const targetX = rootBBox.cx - viewbox.width / 2;
    const targetY = rootBBox.cy - viewbox.height / 2;

    this.viewport.translateTo(targetX, targetY);
  }

  // 清除所有交互
  public clear(): void {
    this.dragBackground.clear();
    this.viewportWheel.clear();
    this.viewportResize.clear();
  }

  // 初始化拖拽
  private initDrag({
    paperWrapper,
    viewport,
    root,
  }: ViewportInteractionOptions): {
    dragRoot: DragRoot;
    dragBackground: DragBackground;
  } {
    const dragViewportHandler = new DragViewportHandler(viewport);
    const svgDom = paperWrapper.getSvgDom();

    const dragRoot = new DragRoot(root, dragViewportHandler);
    const dragBackground = new DragBackground(svgDom, dragViewportHandler, isMobile);

    return {
      dragRoot,
      dragBackground,
    };
  }
}

export default ViewportInteraction;
