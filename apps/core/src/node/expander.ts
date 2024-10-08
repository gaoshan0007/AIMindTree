import EventEmitter from 'eventemitter3';
import Position from '../position';
import Node from './node';
import NodeShape from '../shape/node-shape';
import ExpanderShape from '../shape/expander-shape';
import type { RaphaelPaper } from 'raphael';
import type { TraverseFunc, TraverseOptions } from './node';
import { isMobile } from '../helper';

// 节点 expander 事件映射
export interface ExpanderEventMap {
  mousedownExpander: (newIsExpander: boolean) => void;
}

// 节点 expander 类
class Expander {
  private readonly paper: RaphaelPaper;
  private readonly node: Node;
  private readonly nodeShape: NodeShape;
  private readonly eventEmitter: EventEmitter<ExpanderEventMap>;
  private readonly traverse: TraverseFunc;
  private expanderShape: ExpanderShape | null = null;
  private isExpand: boolean;
  public constructor({
    paper,
    node,
    nodeShape,
    isExpand,
    traverse,
  }: {
    paper: RaphaelPaper;
    node: Node;
    nodeShape: NodeShape;
    isExpand: boolean;
    traverse: TraverseFunc;
  }) {
    this.paper = paper;
    this.node = node;
    this.nodeShape = nodeShape;
    this.isExpand = isExpand;
    this.traverse = traverse;
    this.eventEmitter = new EventEmitter<ExpanderEventMap>();
  }

  // 获取节点是否展开
  public getIsExpand(): boolean {
    return this.isExpand;
  }

  // 改变节点的展开状态
  public changeExpand(newIsExpand: boolean): void {
    if (this.isExpand === newIsExpand) return;

    // 如果没有子节点,则删除 expander
    if (this.node.children.length === 0) {
      this.remove();
      return;
    }

    this.expanderShape?.changeExpand(newIsExpand);
    this.isExpand = newIsExpand;

    // 如果节点不展开,则隐藏子节点
    if (!newIsExpand) {
      this.node.children.forEach((child) => {
        this.traverse(child, this.hideNode);
      });
    }
  }

  // 创建 expander
  public create(): void {
    this.createShape();
    this.translateShape();
  }

  // 删除 expander
  public remove(): void {
    this.expanderShape?.remove();
    this.expanderShape = null;
    this.eventEmitter.removeAllListeners();
  }

  // 添加事件监听器
  public on<T extends EventEmitter.EventNames<ExpanderEventMap>>(
    eventName: T,
    callback: EventEmitter.EventListener<ExpanderEventMap, T>
  ) {
    this.eventEmitter.on(eventName, callback);
  }

  // 设置 expander 样式
  public setStyle(styleType: 'disable' | 'base'): void {
    this.expanderShape?.setStyle(styleType);
  }

  // 创建 expander 形状
  private createShape(): void {
    // 如果是根节点、已经有 expander、没有子节点或节点隐藏,则不创建 expander
    if (
      this.node.isRoot() || this.expanderShape !== null
      || this.node.children.length === 0
      || this.nodeShape.getIsHide()
    ) return;

    this.expanderShape = new ExpanderShape({
      paper: this.paper,
      nodeBBox: this.node.getBBox(),
      isExpand: this.isExpand,
      direction: this.node.direction!,
    });

    // 点击 expander 时切换展开状态
    const mousedownName = isMobile ? 'touchstart' : 'mousedown';
    this.expanderShape?.on(mousedownName, (event: MouseEvent) => {
      event.stopPropagation();
      const newIsExpand = !this.isExpand;
      this.changeExpand(newIsExpand);

      this.eventEmitter.emit('mousedownExpander', newIsExpand);
    });
  }

  // 移动 expander 到正确的位置
  private translateShape(): void {
    this.expanderShape?.translateTo(this.node.getBBox(), this.node.direction!);
  }

  // 隐藏节点
  private hideNode({
    nodeShape,
    expander,
    removeEdgeShape,
  }: TraverseOptions): void {
    nodeShape.hide();
    expander.remove();
    removeEdgeShape();
  }
}

export default Expander;
