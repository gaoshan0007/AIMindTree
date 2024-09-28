import { DepthType, getDepthType } from '../helper';

// 一级节点的 X 和 Y 轴间隙
const firstLevelXGap = 40;
const firstLevelYGap = 25;

// 孙子节点的 X 和 Y 轴间隙
const grandchildXGap = 24;
const grandchildYGap = 15;

// 根据节点深度获取 Y 轴间隙
export function getNodeYGap(depth: number): number {
  return getDepthType(depth) === DepthType.firstLevel ? firstLevelYGap : grandchildYGap;
}

// 根据节点深度获取 X 轴间隙
export function getNodeXGap(depth: number): number {
  return getDepthType(depth) === DepthType.firstLevel ? firstLevelXGap : grandchildXGap;
}
