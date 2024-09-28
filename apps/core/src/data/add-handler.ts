import * as Y from 'yjs';
import { Direction } from '../types';
import { DepthType } from '../helper';
import { updateNodeDataMap, getFatherDatas } from './data-helper';
import type { NodeData } from '../types';

// 根节点的默认名称
const firstLevetNodeName = '主题';
// 子节点的默认名称
const grandchildNodeName = '子主题';

// 添加节点的处理类
class AddHandler {
  public constructor(
    // 用于存储节点数据的 Yjs 文档
    private readonly ydoc: Y.Doc,
    // 节点数据映射表
    private readonly nodeDataMap: Y.Map<NodeData>,
  ) { }

  // 添加子节点
  public addChildNode(selectionId: string, depth: number, newId: string): void {
    const selectionData = this.nodeDataMap.get(selectionId);
    if (!selectionData) return;

    // 如果当前节点是根节点, 则根据左右子节点数量决定新节点的方向
    let direction = selectionData.direction;
    if (selectionData.isRoot) {
      const directionCounts = selectionData.children?.reduce((counts: number[], childId) => {
        const childData = this.nodeDataMap.get(childId);
        if (childData?.direction === Direction.LEFT) {
          counts[0] += 1;
        } else {
          counts[1] += 1;
        }
        return counts;
      }, [0, 0]);
      direction = directionCounts[1] > directionCounts[0] ? Direction.LEFT : Direction.RIGHT;
    }

    this.ydoc.transact(() => {
      // 在节点数据映射表中添加新节点
      this.nodeDataMap.set(newId, {
        label: depth === DepthType.firstLevel ? firstLevetNodeName : grandchildNodeName,
        direction,
        children: [],
        // 添加新节点的 tooltips 内容
        tooltip: depth === DepthType.firstLevel ? '添加主题节点' : '添加子主题节点'
      });

      // 将新节点添加到父节点的子节点列表中
      const selectionChildren = this.nodeDataMap.get(selectionId)!.children;
      selectionChildren.push(newId);
      updateNodeDataMap(this.nodeDataMap, selectionId, {
        children: selectionChildren,
        isExpand: true,
      });
    });
  }

  // 添加兄弟节点
  public addBrotherNode(selectionId: string, depth: number, newId: string): void {
    const selectionData = this.nodeDataMap.get(selectionId);
    if (!selectionData) return;

    // 如果当前节点是根节点, 则直接添加为子节点
    if (selectionData.isRoot) {
      return this.addChildNode(selectionId, depth, newId);
    }

    this.ydoc.transact(() => {
      // 在节点数据映射表中添加新节点
      this.nodeDataMap.set(newId, {
        label: depth === DepthType.firstLevel ? firstLevetNodeName : grandchildNodeName,
        direction: selectionData.direction,
        children: [],
        // 添加新节点的 tooltips 内容
        tooltip: depth === DepthType.firstLevel ? '添加主题节点' : '添加子主题节点'
      });

      // 将新节点添加到父节点的子节点列表中
      const [fatherId, fatherData] = getFatherDatas(this.nodeDataMap, selectionId);
      const brothers = fatherData.children;
      brothers.push(newId);
      updateNodeDataMap(this.nodeDataMap, fatherId, {
        children: brothers,
        isExpand: true,
      });
    });
  }
}

export default AddHandler;
