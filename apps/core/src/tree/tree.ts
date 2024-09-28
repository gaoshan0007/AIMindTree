import Node from '../node/node';
import Position from '../position';
import Viewport from '../viewport';
import TreeRenderer from './tree-renderer';
import NodeCreator from '../node/node-creator';
import type { NodeDataMap } from '../types';

// 树类,用于渲染树
class Tree {
  private readonly root: Node;
  private readonly position: Position;
  private readonly treeRenderer: TreeRenderer;
  private readonly nodeCreator: NodeCreator;
  public constructor({
    data,
    viewport,
    nodeCreator,
  }: {
    data: NodeDataMap;
    viewport: Viewport;
    nodeCreator: NodeCreator;
  }) {
    this.nodeCreator = nodeCreator;

    // 创建根节点
    this.root = this.createRoot(data, viewport);
    this.position = new Position(this.root);

    // 创建树渲染器
    this.treeRenderer = new TreeRenderer({
      root: this.root,
      position: this.position,
      createNode: nodeCreator.createNode,
    });

    // 渲染整个树
    this.render(data);
  }

  // 获取根节点
  public getRoot(): Node {
    return this.root;
  }

  // 清空树
  public clear(): void {
    this.root.remove();
  }

  // 渲染树
  public render(nodeDataMap?: NodeDataMap | null): void {
    this.treeRenderer.render(nodeDataMap);
  }

  // 创建根节点
  private createRoot(
    nodeDataMap: NodeDataMap = {},
    viewport: Viewport,
  ): Node {
    // 找到根节点的 ID
    let rootId = Object.keys(nodeDataMap).find((id) => {
      return nodeDataMap[id].isRoot === true;
    })!;

    const rootData = nodeDataMap[rootId];

    // 创建根节点
    const root = this.nodeCreator.createNode({
      id: rootId,
      depth: 0,
      label: rootData.label,
      direction: rootData.direction,
    });

    // 将根节点居中显示
    const { width: viewportWidth, height: viewportHeight } = viewport.getViewbox();
    const rootBBox = root.getBBox();
    const rootX = (viewportWidth - rootBBox.width) / 2;
    const rootY = (viewportHeight - rootBBox.height) / 2;
    root.translateTo(rootX, rootY);

    return root;
  }
}

export default Tree;