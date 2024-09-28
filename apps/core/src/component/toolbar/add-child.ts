import ToolOperation from '../../tool-operation';
import Selection from '../../selection/selection';
import { MElement } from '../m-element';
import { createToolbarItem } from './create-toolbar-item';

// AddChild类代表一个工具栏项,允许用户向当前选中的节点添加子节点
class AddChild {
  // 代表整个工具栏项的MElement
  public readonly el: MElement;
  // 代表工具栏项内按钮的MElement
  public readonly btnEl: MElement;
  // ToolOperation实例的引用,用于处理树的各种操作
  private readonly toolOperation: ToolOperation;
  // Selection实例的引用,用于跟踪当前选中的节点
  private readonly selection: Selection;

  constructor({
    toolOperation,
    selection,
  }: {
    toolOperation: ToolOperation;
    selection: Selection;
  }) {
    this.toolOperation = toolOperation;
    this.selection = selection;
    const elements = this.element();
    this.el = elements.el;
    this.btnEl = elements.btnEl;
  }

  // 更新工具栏项的状态,根据当前选择情况启用或禁用按钮
  public setState(): void {
    const selectNodes = this.selection.getSelectNodes();
    if (selectNodes.length === 1) {
      this.btnEl.removeClass('disabled');
    } else {
      this.btnEl.addClass('disabled');
    }
  }

  // 创建工具栏项元素,包括触发addChildNode操作的按钮
  private element(): {
    el: MElement;
    btnEl: MElement;
  } {
    const {
      el,
      btnEl,
    } = createToolbarItem({
      iconName: 'add-child',
      tipLabel: 'Add Subtopic',
    });

    btnEl.addEventListener('click', () => {
      this.toolOperation.addChildNode();
      console.log("test");
    }, false);

    return {
      el,
      btnEl,
    };
  }
}

export default AddChild;
