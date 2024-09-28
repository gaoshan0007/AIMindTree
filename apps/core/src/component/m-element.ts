// MElement 类,提供了一些操作 DOM 元素的方法
class MElement {
  private dom: HTMLElement;
  public constructor(tag: string | HTMLElement, className: string = '') {
    // 如果传入的是字符串,则创建一个新的 DOM 元素
    if (typeof tag === 'string') {
      this.dom = document.createElement(tag);
      this.dom.className = className;
    } 
    // 如果传入的是 HTMLElement,则直接使用
    else {
      this.dom = tag;
    }
  }

  // 获取 DOM 元素
  public getDom(): HTMLElement {
    return this.dom;
  }

  // 设置子元素
  public setChildren(...eles: MElement[]): MElement {
    eles.forEach(ele => this.setChild(ele));
    return this;
  }

  // 添加子元素
  public setChild(arg: string | MElement): MElement {
    const ele: Text | HTMLElement = typeof arg === 'string'
      ? document.createTextNode(arg)
      : arg.dom;
    this.dom.appendChild(ele);
    return this;
  }

  // 设置 className
  public setClassName(v: string): MElement {
    this.dom.className = v;
    return this;
  }

  // 添加 class
  public addClass(name: string): MElement {
    this.dom.classList.add(name);
    return this;
  }

  // 检查是否有某个 class
  public hasClass(name: string): boolean {
    return this.dom.classList.contains(name);
  }

  // 移除 class
  public removeClass(name: string): MElement {
    this.dom.classList.remove(name);
    return this;
  }

  // 设置 innerHTML
  public setHtml(content: string): MElement {
    this.dom.innerHTML = content;
    return this;
  }

  // 设置 style
  public setCss(style: Record<string, string>): MElement {
    Object.keys(style).forEach((name: string) => {
      // @ts-ignore
      this.dom.style[name] = style[name];
    });
    return this;
  }

  // 添加事件监听器
  public addEventListener(...params: Parameters<HTMLElement["addEventListener"]>): void {
    this.dom.addEventListener(...params);
  }

  // 移除事件监听器
  public removeEventListener(...params: Parameters<HTMLElement["removeEventListener"]>): void {
    this.dom.removeEventListener(...params);
  }
}

// 创建 MElement 的工厂函数
const h = (tag: string | HTMLElement, className = '') => new MElement(tag, className);

export {
  MElement,
  h,
};
