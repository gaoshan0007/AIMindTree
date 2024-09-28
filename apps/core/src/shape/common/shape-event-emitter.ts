import { RaphaelSet, RaphaelElement, RaphaelBaseElement } from 'raphael';

// 形状事件名称
export type EventNames = 'mousedown' | 'click' | 'dblclick' | 'drag' | 'hover' | 'touchstart';
// 形状事件参数类型
export type EventArgs<EventName extends EventNames> = Parameters<RaphaelBaseElement[EventName]>;

// 形状事件参数映射
type EventArgsMap = Partial<{
  [EventName in EventNames]: EventArgs<EventName>[];
}>;

// 形状事件发射器类
class ShapeEventEmitter {
  private readonly eventArgs: EventArgsMap = {};
  public constructor(private readonly shape: RaphaelElement | RaphaelSet) { }

  // 添加事件监听器
  public on<T extends EventNames>(eventName: T, ...args: EventArgs<T>): void {
    if (!eventName) return;

    if (this.eventArgs[eventName] === undefined) {
      this.eventArgs[eventName] = [];
    }

    this.eventArgs[eventName]!.push(args);

    // @ts-ignore
    this.shape[eventName](...args);
  }

  // 移除所有事件监听器
  public removeAllListeners(): void {
    const eventNames: EventNames[] = Object.keys(this.eventArgs) as EventNames[];
    eventNames.forEach((eventName: EventNames) => {
      const events = this.eventArgs[eventName];

      events?.forEach((args) => {
        // @ts-ignore
        this.shape[`un${eventName}`](...args);
      });
    })
  }
}

export default ShapeEventEmitter;
