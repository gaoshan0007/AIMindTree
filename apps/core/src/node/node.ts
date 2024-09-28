import Viewport from '../viewport';
import Expander from './expander';
import Drag from '../drag/drag';
import NodeShape from '../shape/node-shape';
import CollaborateShape from '../shape/collaborate-shape';
import ShapeGenerator from './shape-generator';
import { getDepthType, DepthType } from '../helper';
import { Direction } from '../types';
import type { ExpanderEventMap } from './expander';
import type { RaphaelPaper, RaphaelAxisAlignedBoundingBox } from 'raphael';
import type { DragEventMap } from '../drag/drag';
import type { EdgeShape } from './shape-generator';
import type { EventNames as ShapeEventNames, EventArgs as ShapeEventArgs } from '../shape/common/shape-event-emitter';
import type { StyleType } from '../shape/common/node-shape-style';
import type { ImageData } from '../types';

// 遍历节点的选项
export interface TraverseOptions {
  node: Node;
  nodeShape: NodeShape;
  edgeShape: EdgeShape | null;
  expander: Expander;
  removeEdgeShape: () => void;
}
// 遍历节点的回调函数
export type TraverseFunc = (node: Node, callback: (options: TraverseOptions) => void) => void;

// 节点事件映射
export interface NodeEventMap {
  mousedown: ShapeEventArgs<'mousedown'>;
  click: ShapeEventArgs<'click'>;
  dblclick: ShapeEventArgs<'dblclick'>;
  drag: ShapeEventArgs<'drag'>;
  touchstart: ShapeEventArgs<'touchstart'>;
  mousedownExpander: [ExpanderEventMap['mousedownExpander']];
  dragEnd: [DragEventMap['dragEnd']];
};

// 节点事件名称
export type NodeEventNames = keyof NodeEventMap;

// 节点选项
export interface NodeOptions {
  paper: RaphaelPaper;
  id: string;
  depth: number;
  label: string;
  direction: Direction;
  x?: number;
  y?: number;
  father?: Node | null;
  isExpand?: boolean;
  viewport: Viewport;
  imageData?: ImageData | null;
  link?: string;
}

// 节点类
class Node {
  private readonly paper: RaphaelPaper;
  private readonly shapeGenerator: ShapeGenerator;
  private readonly _id: string;
  private readonly _depth: number;
  private readonly _father: Node | null = null;
  private readonly nodeShape: NodeShape;
  private readonly expander: Expander;
  private readonly drag: Drag | null = null;
  private readonly _imageData: ImageData | null = null;
  private readonly _link: string = '';
  private _label: string;
  private _direction: Direction;
  private _children: Node[];
  private edgeShape: EdgeShape | null = null;
  private collaborateShape: CollaborateShape | null = null;

  public constructor({
    paper,
    id,
    depth,
    label,
    direction,
    x,
    y,
    father = null,
    isExpand,
    viewport,
    imageData,
    link,
  }: NodeOptions) {
    this.paper = paper;
    this._id = id;
    this._depth = depth;
    this._direction = direction;
    this._father = father || null;
    this._label = label;
    this._children = [];
    this._imageData = imageData || null;
    this._link = link || '';

    this.shapeGenerator = new ShapeGenerator({
      paper,
      depth,
      label,
      direction,
      father,
      imageData,
      link,
    });

    // 渲染节点和边
    this.nodeShape = this.shapeGenerator.createNode(x, y);
    if (x !== undefined || y !== undefined) {
      this.edgeShape = this.shapeGenerator.createEdge(this.nodeShape);
    }

    if (!this.isRoot()) {
      this.drag = new Drag({
        paper,
        node: this,
        viewport,
        nodeShape: this.nodeShape,
        traverse: this.traverse,
      });
    }

    this.expander = new Expander({
      paper,
      node: this,
      nodeShape: this.nodeShape,
      isExpand: isExpand === undefined ? true : isExpand,
      traverse: this.traverse,
    });
  }

  // 获取节点属性
  public get id() { return this._id; }
  public get depth() { return this._depth; }
  public get direction() { return this._direction; }
  public get father() { return this._father; }
  public get label() { return this._label; }
  public get children() { return this._children; }
  public get isExpand() { return this.expander.getIsExpand(); }
  public get imageData() { return this._imageData; }
  public get link() { return this._link; }

  // 获取某个方向的子节点
  public getDirectionChildren(direction: Direction): Node[] {
    return this.children?.filter((child) => {
      return child.direction === direction;
    }) || [];
  }

  // 获取节点的边界框
  public getBBox(): RaphaelAxisAlignedBoundingBox {
    return this.nodeShape.getBBox()!;
  }

  // 获取节点标签的边界框
  public getLabelBBox(): RaphaelAxisAlignedBoundingBox {
    return this.nodeShape.getLabelBBox();
  }

  // 获取节点的深度类型
  public getDepthType(): DepthType {
    return getDepthType(this.depth);
  }

  // 获取根节点
  public getRoot(): Node | null {
    let root: Node | null = this;
    while (root && root.getDepthType() !== DepthType.root) {
      root = root.father;
    }
    return root;
  }

  // 判断是否为根节点
  public isRoot(): boolean {
    return this.getDepthType() === DepthType.root;
  }

  // 添加事件监听器
  public on<T extends NodeEventNames>(eventName: T, ...args: NodeEventMap[T]): void {
    const shapeEventNames: NodeEventNames[] = ['mousedown', 'click', 'dblclick', 'drag', 'touchstart'];
    const expanderEventNames: NodeEventNames[] = ['mousedownExpander'];
    const dragEventNames: NodeEventNames[] = ['dragEnd'];

    if (shapeEventNames.includes(eventName)) {
      if (eventName === 'drag' && !this.isRoot()) {
        return;
      }
      this.nodeShape.on(eventName as ShapeEventNames, ...args as ShapeEventArgs<ShapeEventNames>);
    } else if (expanderEventNames.includes(eventName)) {
      this.expander.on(eventName as keyof ExpanderEventMap, ...args as [ExpanderEventMap[keyof ExpanderEventMap]]);
    } else if (dragEventNames.includes(eventName)) {
      this.drag?.on(eventName as keyof DragEventMap, ...args as [DragEventMap[keyof DragEventMap]])
    }
  }

  // 清空子节点
  public clearChild(): void {
    this._children = [];
  }

  // 添加子节点
  public pushChild(child: Node): void {
    this.children.push(child);
  }

  // 改变节点的展开状态
  public changeExpand(isExpand: boolean): void {
    if (isExpand === undefined) return;
    this.expander.changeExpand(isExpand);
  }

  // 改变节点的方向
  public changeDirection(direction: Direction): void {
    this._direction = direction;
    this.shapeGenerator.changeDirection(direction);
  }

  // 移动节点到指定位置
  public translateTo(x: number, y: number) {
    this.nodeShape.translateTo(x, y);

    this.removeEdgeShape();
    this.edgeShape = this.shapeGenerator.createEdge(this.nodeShape);

    this.father?.expander.create();
    this.expander.create();
  }

  // 删除节点
  public remove(): void {
    if (!this.isRoot()) {
      const brothers = this.father?.children;
      if (!brothers) return;

      // 从父节点的子节点列表中移除
      const index = brothers?.findIndex((brother) => this.id === brother.id);
      if (index > -1) {
        brothers.splice(index, 1);
      }

      // 如果兄弟节点为空,则删除父节点的 expander
      if (brothers.length === 0) {
        this.father?.expander.remove();
      }
    }

    this.traverse(this, ({ node: curNode }) => {
      curNode.nodeShape.remove();
      curNode.removeEdgeShape();
      curNode.expander.remove();
      curNode.drag?.clear();
      curNode.collaborateShape?.remove();
    });
  }

  // 设置节点标签
  public setLabel(label: string): void {
    this._label = label;
    this.nodeShape.setLabel(label, this.direction);
    this.collaborateShape?.setPosition(this.getBBox());
  }

  // 设置节点样式
  public setStyle(styleType: StyleType): void {
    this.nodeShape.setStyle(styleType);
  }

  // 将节点移到最前面
  public nodeShapeToFront(): void {
    this.nodeShape.toFront();
  }

  // 判断节点是否不可见
  public isInvisible(): boolean {
    return this.nodeShape.isInvisible();
  }

  // 设置协作样式
  public setCollaborateStyle(style: { color: string; name: string; } | null): void {
    if (style) {
      this.collaborateShape = new CollaborateShape({
        paper: this.paper,
        nodeBBox: this.getBBox(),
        name: style.name,
        color: style.color,
      });
    } else {
      this.collaborateShape?.remove();
    }
  }

  // 遍历节点
  private traverse(node: Node, callback: (options: TraverseOptions) => void): void {
    callback({
      node,
      nodeShape: node.nodeShape,
      expander: node.expander,
      edgeShape: node.edgeShape,
      removeEdgeShape: node.removeEdgeShape,
    });
    node.children.forEach((child) => this.traverse(child, callback));
  }

  // 删除边
  private removeEdgeShape = (): void => {
    this.edgeShape?.remove();
    this.edgeShape = null;
  }
}

export default Node;
