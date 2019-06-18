<template>
  <div
    class="el-tree-node"
    @contextmenu="$event => this.handleContextMenu($event)"
    v-show="node.visible"
    :class="{
      'is-expanded': expanded,
      'is-current': tree.store.currentNode === node,
      'is-hidden': !node.visible,
      'is-focusable': !node.disabled,
      'is-checked': !node.disabled && node.checked,
      'no-el-tree-node__content': onlyShow && node.data.hasRight != 1
    }"
    role="treeitem"
    tabindex="-1"
    :aria-expanded="expanded"
    :aria-disabled="node.disabled"
    :aria-checked="node.checked"
    :draggable="tree.draggable"
    @dragstart.stop="handleDragStart"
    @dragover.stop="handleDragOver"
    @dragend.stop="handleDragEnd"
    @drop.stop="handleDrop"
    ref="node"
  >
    <div class="el-tree-node__content" :class="{ 'no-el-tree-node__content': onlyShow && node.data.hasRight != 1 }" :style="{ 'margin-left': (node.level - 1) * tree.indent + 'px' }">
      <span @click.stop="handleExpandIconClick" :class="[{ 'is-leaf': node.isLeaf, expanded: !node.isLeaf && expanded }, 'el-tree-node__expand-icon', tree.iconClass ? tree.iconClass : 'el-icon-caret-right']"> </span>
      <el-checkbox v-if="showCheckbox" v-model="node.checked" :indeterminate="node.indeterminate" :disabled="!!node.disabled" @click.native.stop @change="handleCheckChange"> </el-checkbox>
      <span v-if="node.loading" @click.stop="handleClick" class="el-tree-node__loading-icon el-icon-loading"> </span>
      <node-content :node="node"></node-content>
    </div>
    <el-collapse-transition>
      <div class="el-tree-node__children" :class="{ 'btn-content': node.data.buttonList && node.data.buttonList.length > 0 && node.data.nodeChildren && node.data.nodeChildren.length > node.data.buttonList.length, 'no-right-line': !node.data.nodeChildren || node.data.nodeChildren.length < 1 }" v-if="!renderAfterExpand || childNodeRendered" v-show="expanded" role="group" :aria-expanded="expanded">
        <el-tree-node :class="{ 'wei-btn-wrap': child.data.btn, 'no-wei-btn-wrap': !child.data.btn, 'no-el-tree-node': onlyShow && child.data.hasRight == 1 }" :onlyShow="onlyShow" :render-content="renderContent" v-for="child in node.childNodes" :render-after-expand="renderAfterExpand" :key="getNodeKey(child)" :node="child" @node-expand="handleChildNodeExpand"> </el-tree-node>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script type="text/jsx">
import ElCollapseTransition from 'element-ui/src/transitions/collapse-transition';
import ElCheckbox from 'element-ui/packages/checkbox';
import emitter from 'element-ui/src/mixins/emitter';
import { getNodeKey } from './model/util';

export default {
  name: 'ElTreeNode',

  componentName: 'ElTreeNode',

  mixins: [emitter],

  props: {
    onlyShow: {
      type: Boolean,
      default: false
    },
    node: {
      default() {
        return {};
      }
    },
    props: {},
    renderContent: Function,
    renderAfterExpand: {
      type: Boolean,
      default: true
    },
  },

  components: {
    ElCollapseTransition,
    ElCheckbox,
    NodeContent: {
      props: {
        node: {
          required: true
        }
      },
      render(h) {
        const parent = this.$parent;
        const tree = parent.tree;
        const node = this.node;
        const { data, store } = node;
        return (
          parent.renderContent
            ? parent.renderContent.call(parent._renderProxy, h, { _self: tree.$vnode.context, node, data, store })
            : tree.$scopedSlots.default
              ? tree.$scopedSlots.default({ node, data })
              : <span class="el-tree-node__label">{ node.label }<b class="btn-text-tip">{ node.data.buttonList && node.data.buttonList.length>0?"（ 以下为该菜单操作权限 ）":"" }</b></span>
        );
      }
    }
  },

  data() {
    return {
      tree: null,
      expanded: false,
      childNodeRendered: false,
      showCheckbox: false,
      oldChecked: null,
      oldIndeterminate: null
    };
  },

  watch: {
    'node.indeterminate'(val) {
      this.handleSelectChange(this.node.checked, val);
    },

    'node.checked'(val) {
      this.handleSelectChange(val, this.node.indeterminate);
    },

    'node.expanded'(val) {
      this.$nextTick(() => this.expanded = val);
      if (val) {
        this.childNodeRendered = true;
      }
    }
  },

  methods: {
    getNodeKey(node) {
      // log(node);
      return getNodeKey(this.tree.nodeKey, node.data);
    },

    handleSelectChange(checked, indeterminate) {
      if (this.oldChecked !== checked && this.oldIndeterminate !== indeterminate) {
        this.tree.$emit('check-change', this.node.data, checked, indeterminate);
      }
      this.oldChecked = checked;
      this.indeterminate = indeterminate;
    },

    handleClick() {
      // log(val);
      const store = this.tree.store;
      store.setCurrentNode(this.node);
      this.tree.$emit('current-change', store.currentNode ? store.currentNode.data : null, store.currentNode);
      this.tree.currentNode = this;
      if (this.tree.expandOnClickNode) {
        this.handleExpandIconClick();
      }
      if (this.tree.checkOnClickNode && !this.node.disabled) {
        this.handleCheckChange(null, {
          target: { checked: !this.node.checked }
        });
      }
      this.tree.$emit('node-click', this.node.data, this.node, this);
    },

    handleContextMenu(event) {
      if (this.tree._events['node-contextmenu'] && this.tree._events['node-contextmenu'].length > 0) {
        event.stopPropagation();
        event.preventDefault();
      }
      this.tree.$emit('node-contextmenu', event, this.node.data, this.node, this);
    },

    handleExpandIconClick() {
      if (this.node.isLeaf) return;
      if (this.expanded) {
        this.tree.$emit('node-collapse', this.node.data, this.node, this);
        this.node.collapse();
      } else {
        this.node.expand();
        this.$emit('node-expand', this.node.data, this.node, this);
      }
    },

    handleCheckChange(value, ev) {
      // log(this.node);
      this.node.setChecked(ev.target.checked, !this.tree.checkStrictly);
      this.$nextTick(() => {
        const store = this.tree.store;
        this.tree.$emit('check', this.node.data, {
          checkedNodes: store.getCheckedNodes(),
          checkedKeys: store.getCheckedKeys(),
          halfCheckedNodes: store.getHalfCheckedNodes(),
          halfCheckedKeys: store.getHalfCheckedKeys(),
        });
      });
    },

    handleChildNodeExpand(nodeData, node, instance) {
      this.broadcast('ElTreeNode', 'tree-node-expand', node);
      this.tree.$emit('node-expand', nodeData, node, instance);
    },

    handleDragStart(event) {
      if (!this.tree.draggable) return;
      this.tree.$emit('tree-node-drag-start', event, this);
    },

    handleDragOver(event) {
      if (!this.tree.draggable) return;
      this.tree.$emit('tree-node-drag-over', event, this);
      event.preventDefault();
    },

    handleDrop(event) {
      event.preventDefault();
    },

    handleDragEnd(event) {
      if (!this.tree.draggable) return;
      this.tree.$emit('tree-node-drag-end', event, this);
    }
  },

  created() {
    const parent = this.$parent;

    if (parent.isTree) {
      this.tree = parent;
    } else {
      this.tree = parent.tree;
    }

    const tree = this.tree;
    if (!tree) {
      // console.warn('Can not find node\'s tree.');
    }

    const props = tree.props || {};
    const childrenKey = props['children'] || 'children';

    this.$watch(`node.data.${childrenKey}`, () => {
      this.node.updateChildren();
    });

    this.showCheckbox = tree.showCheckbox;

    if (this.node.expanded) {
      this.expanded = true;
      this.childNodeRendered = true;
    }

    if(this.tree.accordion) {
      this.$on('tree-node-expand', node => {
        if(this.node !== node) {
          this.node.collapse();
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.el-tree-node.wei-btn-wrap {
  display: inline-block;
}
.el-tree-node {
  white-space: unset;
}
.el-tree-node__content:hover,
.el-tree-node__content {
  background: transparent !important;
}
.el-tree-node__label /deep/ .btn-text-tip {
  color: #9b9b9b;
  font-size: 13px;
  font-weight: normal;
}
.btn-content .no-wei-btn-wrap > .el-tree-node__content {
  border-top: 1px solid #dcdfe6;
  margin-right: 20px;
}
.no-el-tree-node__content {
  display: none !important;
}
</style>
