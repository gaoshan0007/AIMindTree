import PaperWrapper from '../../paper-wrapper';
import Viewport from '../../viewport';
import { h, MElement } from '../m-element';

const zoomSpeed = 0.25;

// 视口缩放组件,位于右下角
class ViewportScale {
  private readonly viewport: Viewport;
  private readonly el: MElement;
  private readonly scaleLabelEl: MElement;
  public constructor({
    paperWrapper,
    viewport,
  }: {
    paperWrapper: PaperWrapper;
    viewport: Viewport;
  }) {
    this.viewport = viewport;
    const elements = this.element();
    this.el = elements.el;
    this.scaleLabelEl = elements.scaleLabelEl;

    const wrapperDom = paperWrapper.getWrapperDom();
    wrapperDom.appendChild(this.el.getDom());

    // 监听视口缩放事件,更新缩放比例标签
    viewport.on('changeScale', (scale: number) => {
      this.scaleLabelEl.setHtml(this.getScalePercent(scale));
    });
  }

  private element(): {
    el: MElement,
    scaleLabelEl: MElement;
  } {
    const scale = this.viewport.getScale();
    // 缩小按钮
    const zoomOutEl = h('div', 'scale-btn').setChild(
      h('div', 'scale-btn-icon zoom-out')
    );

    // 放大按钮
    const zoomInEl = h('div', 'scale-btn').setChild(
      h('div', 'scale-btn-icon zoom-in')
    );

    // 缩放比例标签
    const scaleLabelEl = h('div', 'scale-label').setChild(this.getScalePercent(scale))

    // 视口缩放控制器
    const el = h('div', 'viewport-scale-controller').setChildren(
      zoomOutEl,
      scaleLabelEl,
      zoomInEl,
    );

    // 点击缩小按钮,缩小视口
    zoomOutEl.addEventListener('click', () => {
      this.viewport.addScale(-zoomSpeed);
    }, false);

    // 点击放大按钮,放大视口
    zoomInEl.addEventListener('click', () => {
      this.viewport.addScale(zoomSpeed);
    }, false);

    // 点击缩放比例标签,将视口缩放比例恢复到 100%
    scaleLabelEl.addEventListener('click', () => {
      this.viewport.setScale(1);
    }, false);

    return {
      el,
      scaleLabelEl,
    };
  }

  // 获取缩放比例百分比字符串
  private getScalePercent(scale: number): string {
    return `${Math.floor(scale * 100)}%`
  }
}

export default ViewportScale;
