import Node from '../node/node';
import Position from '../position';
import type { NodeDataMap } from '../types';
import type { CreateNodeFunc } from '../node/node-creator';

// 渲染新节点的参数
interface RenderNewParams {
  nodeDataMap: NodeDataMap;
  sourceId: string;
  depth: number;
  father: Node | null;
}

// 使用相对节点渲染的参数
interface RenderParams {
  nodeDataMap: NodeDataMap;
  sourceId: string;
  depth: number;
  relativeNode: Node;
}

// 树渲染器类
class TreeRenderer {
  private readonly root: Node;
  private readonly position: Position;
  private readonly createNode: CreateNodeFunc;
  public constructor({
    root,
    position,
    createNode,
  }: {
    root: Node;
    position: Position;
    createNode: CreateNodeFunc;
  }) {
    this.root = root;
    this.position = position;
    this.createNode = createNode;
  }

  // 渲染整个树
  public render(nodeDataMap?: NodeDataMap | null): void {
    if (!nodeDataMap) return;
    this.renderWithRelativeNode({
      nodeDataMap,
      sourceId: this.root.id,
      relativeNode: this.root,
      depth: 0,
    });
    this.position.reset();
  }

  // 使用相对节点渲染
  renderWithRelativeNode({
    nodeDataMap,
    sourceId,
    relativeNode,
    depth,
  }: RenderParams): Node {
    const currentNode = relativeNode;
    const nodeData = nodeDataMap[sourceId];

    // 更新节点标签、展开状态和方向
    if (nodeData.label !== currentNode.label) {
      currentNode.setLabel(nodeData.label);
    }
    if (nodeData.isExpand !== currentNode.isExpand) {
      currentNode.changeExpand(nodeData.isExpand!);
    }
    if (nodeData.direction !== currentNode.direction) {
      currentNode.changeDirection(nodeData.direction);
    }

    // 清空当前节点的子节点,并重新渲染
    const oldChildren = currentNode.children;
    currentNode.clearChild();
    nodeData.children.forEach((childId) => {
      const childNodeData = nodeDataMap[childId];
      if (!childNodeData) return;

      const childRelativeNodeIndex = oldChildren.findIndex((node) => {
        return node.id === childId;
      });

      let childRelativeNode: Node | null = null;
      if (childRelativeNodeIndex > -1) {
        const targetNodeList = oldChildren.splice(childRelativeNodeIndex, 1);
        childRelativeNode = targetNodeList[0];
      }

      const childNode = childRelativeNode !== null
        ? this.renderWithRelativeNode({
          nodeDataMap,
          sourceId: childId,
          relativeNode: childRelativeNode!,
          depth: depth + 1,
        })
        : this.renderNew({
          nodeDataMap,
          sourceId: childId,
          depth: depth + 1,
          father: currentNode,
        });

      currentNode.pushChild(childNode);
    });

    // 删除剩余的旧子节点
    oldChildren.forEach((oldChild) => {
      oldChild.remove();
    });

    return currentNode;
  }

  // 渲染新节点
  renderNew({
    nodeDataMap,
    sourceId,
    depth,
    father,
  }: RenderNewParams): Node {
    const nodeData = nodeDataMap[sourceId];

    // 创建新节点
    const currentNode = this.createNode({
      id: sourceId,
      depth,
      label: nodeData.label,
      direction: nodeData.direction,
      father,
      isExpand: nodeData.isExpand,
      imageData: nodeData.imageData,
      link: nodeData.link,
    });

    // 递归渲染子节点
    nodeData.children.forEach((childId) => {
      const childNodeData = nodeDataMap[childId];
      if (!childNodeData) return;
      const childNode = this.renderNew({
        nodeDataMap,
        sourceId: childId,
        depth: depth + 1,
        father: currentNode,
      });
      currentNode.pushChild(childNode);
    });

    return currentNode;
  }
}

export default TreeRenderer;
