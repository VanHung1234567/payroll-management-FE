<template>
  <div ref="selectRef" class="ms-tree-select" :style="{ width: normalizedWidth }">
    <div class="ms-tree-select__box" :class="{ 'is-open': isOpen }" @click="openDropdown">
      <div class="ms-tree-select__values">
        <template v-if="hiddenSelectedCount">
          <span class="ms-tree-select__counter">{{ hiddenSelectedCount }}</span>
        </template>

        <template v-if="visibleSelectedOptions.length">
          <span
            v-for="option in visibleSelectedOptions"
            :key="getId(option)"
            class="ms-tree-select__tag"
          >
            <span class="ms-tree-select__tag-text">{{ getLabel(option) }}</span>
            <button
              type="button"
              class="ms-tree-select__tag-close flex items-center"
              @click.stop="removeOption(option)"
            >
              <span class="mi-close"></span>
            </button>
          </span>
        </template>

        <input
          v-model="searchText"
          class="ms-tree-select__input"
          :placeholder="selectedDisplayOptions.length ? '' : placeholder"
          @focus="openDropdown"
          @click.stop="openDropdown"
        />
      </div>

      <button
        v-if="selectedValues.length"
        type="button"
        class="ms-tree-select__clear"
        @click.stop="clearSelected"
      >
        <span class="mi-close"></span>
      </button>

      <button type="button" class="ms-tree-select__arrow" @click.stop="toggleDropdown">
        <span class="mi-chevron-down-black" :class="{ 'is-open': isOpen }"></span>
      </button>
    </div>

    <div v-if="isOpen" class="ms-tree-select__dropdown">
      <div v-if="filteredTree.length" class="ms-tree-select__node-list">
        <TreeNode
          v-for="node in filteredTree"
          :key="getId(node.raw)"
          :node="node"
          :is-checked="isChecked"
          :is-expanded="isExpanded"
          :get-id="getId"
          :get-label="getLabel"
          @toggle-check="toggleCheck"
          @toggle-expand="toggleExpand"
        />
      </div>

      <div v-else class="ms-tree-select__empty flex items-center justify-center">
        Không có dữ liệu
      </div>

      <label v-if="showInactiveOption" class="ms-tree-select__inactive">
        <input v-model="showInactiveChecked" class="ms-tree-select__inactive-input" type="checkbox" />
        <span class="ms-tree-select__checkbox" :class="{ 'is-checked': showInactiveChecked }">
          <svg
            v-if="showInactiveChecked"
            viewBox="0 0 16 16"
            class="ms-treeselect__check-mark"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8L6 11L13 4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span>Hiển thị đơn vị ngừng theo dõi</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: {
      type: Object,
      required: true,
    },
    isChecked: {
      type: Function,
      required: true,
    },
    isExpanded: {
      type: Function,
      required: true,
    },
    getId: {
      type: Function,
      required: true,
    },
    getLabel: {
      type: Function,
      required: true,
    },
  },
  emits: ['toggle-check', 'toggle-expand'],
  setup(props, { emit }) {
    const renderNode = (node) => {
      const id = props.getId(node.raw)
      const checked = props.isChecked(id)
      const hasChildren = node.children.length > 0
      const expanded = props.isExpanded(id)

      return h('div', { class: 'ms-tree-select__node-wrap' }, [
        h(
          'div',
          {
            class: [
              'ms-tree-select__node',
              {
                'is-checked': checked,
                'is-child': node.level > 0,
                'is-branch': hasChildren,
              },
            ],
            style: {
              paddingLeft: `${12 + node.level * 20}px`,
            },
          },
          [
            h(
              'button',
              {
                type: 'button',
                class: 'ms-tree-select__expand',
                onClick: (event) => {
                  event.stopPropagation()
                  if (hasChildren) emit('toggle-expand', id)
                },
              },
              hasChildren
                ? [h('span', { class: expanded ? 'mi-chevron-bottom' : 'mi-chevron-right' })]
                : [],
            ),
            h(
              'button',
              {
                type: 'button',
                class: ['ms-tree-select__checkbox', { 'is-checked': checked }],
                onClick: (event) => {
                  event.stopPropagation()
                  emit('toggle-check', node)
                },
              },
              checked
                ? [
                    h(
                      'svg',
                      {
                        viewBox: '0 0 16 16',
                        class: 'ms-treeselect__check-mark',
                        fill: 'none',
                        xmlns: 'http://www.w3.org/2000/svg',
                      },
                      [
                        h('path', {
                          d: 'M3 8L6 11L13 4',
                          stroke: 'currentColor',
                          'stroke-width': '2',
                          'stroke-linecap': 'round',
                          'stroke-linejoin': 'round',
                        }),
                      ],
                    ),
                  ]
                : [],
            ),
            h(
              'button',
              {
                type: 'button',
                class: 'ms-tree-select__node-label',
                onClick: () => emit('toggle-check', node),
              },
              props.getLabel(node.raw),
            ),
          ],
        ),
        hasChildren && expanded
          ? h(
              'div',
              { class: 'ms-tree-select__children' },
              node.children.map((child) => renderNode(child)),
            )
          : null,
      ])
    }

    return () => renderNode(props.node)
  },
})

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
  idKey: {
    type: String,
    default: 'OrganizationID',
  },
  parentKey: {
    type: String,
    default: 'ParentID',
  },
  labelKey: {
    type: String,
    default: 'OrganizationName',
  },
  placeholder: {
    type: String,
    default: 'Tất cả đơn vị',
  },
  width: {
    type: [Number, String],
    default: 350,
  },
  showInactiveOption: {
    type: Boolean,
    default: true,
  },
  maxVisibleTags: {
    type: [Number, String],
    default: 1,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectRef = ref(null)
const isOpen = ref(false)
const searchText = ref('')
const expandedKeys = ref(new Set())
const showInactiveChecked = ref(false)

const normalizedWidth = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width,
)
const selectedValues = computed(() => props.modelValue)
const selectedSet = computed(() => new Set(props.modelValue))

const getId = (option) => option?.[props.idKey]
const getParentId = (option) => option?.[props.parentKey]
const getLabel = (option) => option?.[props.labelKey] ?? ''

const optionMap = computed(() => {
  const map = new Map()
  props.options.forEach((option) => {
    map.set(getId(option), option)
  })
  return map
})

const parentMap = computed(() => {
  const map = new Map()
  props.options.forEach((option) => {
    map.set(getId(option), getParentId(option))
  })
  return map
})

const tree = computed(() => buildTree(props.options))

const filteredTree = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return tree.value

  return filterTree(tree.value, keyword)
})

const selectedDisplayOptions = computed(() =>
  selectedValues.value
    .map((id) => optionMap.value.get(id))
    .filter(Boolean)
    .filter((option) => !hasSelectedAncestor(getId(option))),
)

const maxVisibleTags = computed(() => {
  const count = Number(props.maxVisibleTags)
  return Number.isFinite(count) && count > 0 ? count : 1
})

const visibleSelectedOptions = computed(() =>
  selectedDisplayOptions.value.slice(-maxVisibleTags.value),
)

const hiddenSelectedCount = computed(() =>
  Math.max(selectedDisplayOptions.value.length - visibleSelectedOptions.value.length, 0),
)

const buildTree = (options) => {
  const nodeMap = new Map()
  const roots = []

  options.forEach((option) => {
    nodeMap.set(getId(option), {
      raw: option,
      children: [],
      level: 0,
    })
  })

  nodeMap.forEach((node) => {
    const parentId = getParentId(node.raw)
    const parentNode = parentId ? nodeMap.get(parentId) : null

    if (parentNode) {
      node.level = parentNode.level + 1
      parentNode.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const fixLevel = (nodes, level = 0) => {
    nodes.forEach((node) => {
      node.level = level
      fixLevel(node.children, level + 1)
    })
  }

  fixLevel(roots)
  return roots
}

const filterTree = (nodes, keyword) =>
  nodes
    .map((node) => {
      const matched = getLabel(node.raw).toLowerCase().includes(keyword)
      const children = filterTree(node.children, keyword)
      if (!matched && !children.length) return null
      return {
        ...node,
        children,
      }
    })
    .filter(Boolean)

const getDescendantIds = (node) => [
  getId(node.raw),
  ...node.children.flatMap((child) => getDescendantIds(child)),
]

const getChildrenByParent = (parentId) =>
  props.options.filter((option) => getParentId(option) === parentId)

const updateAncestors = (set, optionId) => {
  let parentId = parentMap.value.get(optionId)

  while (parentId) {
    const children = getChildrenByParent(parentId)
    const isAllChildrenChecked =
      children.length > 0 && children.every((child) => set.has(getId(child)))

    if (isAllChildrenChecked) {
      set.add(parentId)
    } else {
      set.delete(parentId)
    }

    parentId = parentMap.value.get(parentId)
  }
}

const toggleCheck = (node) => {
  const next = new Set(selectedSet.value)
  const ids = getDescendantIds(node)
  const shouldCheck = !ids.every((id) => next.has(id))

  ids.forEach((id) => {
    if (shouldCheck) {
      next.add(id)
    } else {
      next.delete(id)
    }
  })

  updateAncestors(next, getId(node.raw))
  updateValue([...next])
  searchText.value = ''
}

const removeOption = (option) => {
  const node = findNode(tree.value, getId(option))
  if (node) {
    const next = new Set(selectedSet.value)
    getDescendantIds(node).forEach((id) => next.delete(id))
    updateAncestors(next, getId(option))
    updateValue([...next])
  }
}

const clearSelected = () => {
  updateValue([])
}

const updateValue = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const findNode = (nodes, id) => {
  for (const node of nodes) {
    if (getId(node.raw) === id) return node
    const child = findNode(node.children, id)
    if (child) return child
  }
  return null
}

const hasSelectedAncestor = (id) => {
  let parentId = parentMap.value.get(id)
  while (parentId) {
    if (selectedSet.value.has(parentId)) return true
    parentId = parentMap.value.get(parentId)
  }
  return false
}

const isChecked = (id) => selectedSet.value.has(id)
const isExpanded = (id) => expandedKeys.value.has(id)

const toggleExpand = (id) => {
  const next = new Set(expandedKeys.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedKeys.value = next
}

const openDropdown = () => {
  isOpen.value = true
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(
  tree,
  (nodes) => {
    const next = new Set(expandedKeys.value)
    nodes.forEach((node) => next.add(getId(node.raw)))
    expandedKeys.value = next
  },
  { immediate: true },
)
</script>

<style>
.ms-tree-select {
  position: relative;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
}

.ms-tree-select__box {
  min-height: 32px;
  padding: 3px 60px 3px 4px;
  display: flex;
  align-items: center;
  border: 1px solid #d5d7da;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
}

.ms-tree-select__box:hover,
.ms-tree-select__box.is-open {
  border-color: #0e9a62;
}

.ms-tree-select__values {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

.ms-tree-select__counter {
  width: 32px;
  height: 24px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d5d7da;
  border-radius: 6px;
  background: #e9eaeb;
  color: #101828;
  font-size: 12px;
  line-height: 16px;
  box-sizing: border-box;
}

.ms-tree-select__tag {
  max-width: 100%;
  min-width: 0;
  flex: 0 1 auto;
  height: 24px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #d5d7da;
  border-radius: 6px;
  background: #f5f5f5;
  color: #101828;
  font-size: 12px;
  line-height: 16px;
  box-sizing: border-box;
  cursor: default;
}

.ms-tree-select__tag:hover {
  background: #e9eaeb;
}

.ms-tree-select__tag-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.ms-tree-select__tag-close,
.ms-tree-select__clear,
.ms-tree-select__arrow,
.ms-tree-select__expand,
.ms-tree-select__node-label {
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.ms-tree-select__input {
  min-width: 40px;
  flex: 1 1 40px;
  height: 24px;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #101828;
  caret-color: #0e9a62;
  font: inherit;
  line-height: 18px;
  cursor: pointer;
}

.ms-tree-select__input::placeholder {
  color: #98a2b3;
}

.ms-tree-select__clear,
.ms-tree-select__arrow {
  position: absolute;
  top: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
}

.ms-tree-select__clear {
  right: 28px;
}

.ms-tree-select__arrow {
  right: 4px;
}

.ms-tree-select__dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  z-index: 40;
  width: 100%;
  max-height: 360px;
  overflow: auto;
  border: 1px solid #d5d7da;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px #0000001f;
}

.ms-tree-select__node-list {
  padding: 4px 0;
}

.ms-tree-select__node-wrap {
  margin: 0;
}

.ms-tree-select__node {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
  background: #fff;
  color: #101828;
  box-sizing: border-box;
}

.ms-tree-select__node:hover {
  background: #e9eaeb;
}

.ms-tree-select__node.is-checked {
  background: #edfcf4;
  color: #0e9a62;
}

.ms-tree-select__node.is-checked:hover {
  background: #cdeadf;
}

.ms-tree-select__node.is-branch {
  font-weight: 500;
}

.ms-tree-select__node.is-child {
  font-weight: 500;
}

.ms-tree-select__expand {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ms-tree-select__checkbox {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d5d7da;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
}

.ms-tree-select__checkbox.is-checked {
  border-color: #0e9a62;
  background: #0e9a62;
  color: #fff;
}

.ms-treeselect__check-mark {
  width: 10px;
  height: 10px;
  margin-left: 1px;
  flex-shrink: 0;
}

.ms-tree-select__node-label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  margin-left: 8px;
  white-space: nowrap;
  font: inherit;
  line-height: 18px;
  transform: translateY(1px);
}

.ms-tree-select__inactive {
  height: 32px;
  margin-top: 4px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #edfcf4;
  color: #101828;
  box-sizing: border-box;
  cursor: pointer;
}

.ms-tree-select__inactive .ms-tree-select__checkbox {
  background: #edfcf4;
}

.ms-tree-select__inactive .ms-tree-select__checkbox.is-checked {
  background: #0e9a62;
}

.ms-tree-select__inactive-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.ms-tree-select__empty {
  padding: 12px;
  color: #667085;
  font-size: 13px;
  line-height: 18px;
}

.mi-chevron-down-black {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  -webkit-mask-image: url('../assets/images/ICON_3.svg');
  -webkit-mask-position: -32px -224px;
  -webkit-mask-size: 752px 400px;
  -webkit-mask-repeat: no-repeat;
  background-image: none;
  background-color: #717680;
  transition: transform 0.12s ease;
}

.mi-chevron-down-black.is-open {
  transform: rotate(180deg);
}

.mi-chevron-right {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  -webkit-mask-image: url('../assets/images/ICON_3.svg');
  -webkit-mask-position: -96px -224px;
  -webkit-mask-size: 752px 400px;
  -webkit-mask-repeat: no-repeat;
  background-image: none;
  background-color: #717680;
}

.mi-chevron-bottom {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  -webkit-mask-image: url('../assets/images/ICON_3.svg');
  -webkit-mask-position: -32px -224px;
  -webkit-mask-size: 752px 400px;
  -webkit-mask-repeat: no-repeat;
  background-image: none;
  background-color: #717680;
}

.mi-close {
  display: inline-block;
  width: 12px;
  height: 12px;
  -webkit-mask-image: url('../assets/images/ICON_4.svg');
  -webkit-mask-position: -442px -56px;
  -webkit-mask-repeat: no-repeat;
  background-color: #717680;
  flex-shrink: 0;
}
</style>
