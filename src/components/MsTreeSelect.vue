<template>
  <div
    ref="selectRef"
    class="ms-tree-select"
    :class="{ 'is-error': isInvalid }"
    :style="{ width: normalizedWidth }"
  >
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
          ref="inputRef"
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
        <input
          v-model="showInactiveChecked"
          class="ms-tree-select__inactive-input"
          type="checkbox"
        />
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

    <div v-if="isInvalid && errorMessage" class="ms-tree-select__error text-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/// Component con dùng để render đệ quy từng node trong tree.
/// CREATED BY: VVHung (10/06/2026)
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
    /// Render một node trong cây và các node con của nó.
    /// <param name="node">Node cần render.</param>
    /// Hàm render một node và các node con trong tree select.
    /// CREATED BY: VVHung (10/06/2026)
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

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (10/06/2026)
const props = defineProps({
  // Danh sách id đang chọn, dùng với v-model.
  modelValue: {
    type: Array,
    default: () => [],
  },
  // Danh sách node phẳng từ API.
  options: {
    type: Array,
    default: () => [],
  },
  // Field id của node.
  idKey: {
    type: String,
    default: 'organizationID',
  },
  // Field parent id để build cây.
  parentKey: {
    type: String,
    default: 'parentID',
  },
  // Field label hiển thị.
  labelKey: {
    type: String,
    default: 'organizationName',
  },
  // Text khi chưa chọn.
  placeholder: {
    type: String,
    default: 'Tất cả đơn vị',
  },
  // Chiều rộng trigger/menu.
  width: {
    type: [Number, String],
    default: 350,
  },
  // Hiển thị option "Không điều kiện".
  showInactiveOption: {
    type: Boolean,
    default: true,
  },
  // Số tag được hiển thị trực tiếp trong trigger.
  maxVisibleTags: {
    type: [Number, String],
    default: 1,
  },
  // Message lỗi validate.
  errorMessage: {
    type: String,
    default: '',
  },
  // Metadata validate, thường dùng meta.touched.
  meta: {
    type: Object,
    default: null,
  },
})

/// Khai báo các sự kiện component bắn ra ngoài.
/// CREATED BY: VVHung (13/06/2026)
const emit = defineEmits(['update:modelValue', 'change', 'blur'])

/// DOM ref bọc toàn bộ select để bắt click outside.
/// CREATED BY: VVHung (09/06/2026)
const selectRef = ref(null)
/// Ref tới input thật để component cha có thể gọi focus.
/// CREATED BY: VVHung (11/06/2026)
const inputRef = ref(null)
/// Cờ mở hoặc đóng dropdown/popup của component.
/// CREATED BY: VVHung (06/06/2026)
const isOpen = ref(false)
/// Từ khóa search nội bộ trong dropdown.
/// CREATED BY: VVHung (07/06/2026)
const searchText = ref('')
/// Tập id node đang được mở rộng trong tree select.
/// CREATED BY: VVHung (07/06/2026)
const expandedKeys = ref(new Set())
/// Cờ điều khiển hiển thị inactive checked.
/// CREATED BY: VVHung (09/06/2026)
const showInactiveChecked = ref(false)

/// Chiều rộng đã chuẩn hóa để gắn vào style.
/// CREATED BY: VVHung (09/06/2026)
const normalizedWidth = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width,
)
/// Danh sách id đang được chọn trong tree select.
/// CREATED BY: VVHung (07/06/2026)
const selectedValues = computed(() => props.modelValue)
/// Hàm chuẩn hóa id về chuỗi để so sánh ổn định.
/// CREATED BY: VVHung (10/06/2026)
const normalizeId = (id) => (id === null || id === undefined ? '' : String(id))
/// Tập giá trị dùng để kiểm tra selected set.
/// CREATED BY: VVHung (09/06/2026)
const selectedSet = computed(() => new Set(props.modelValue.map((id) => normalizeId(id))))
/// Cờ xác định trạng thái invalid.
/// CREATED BY: VVHung (07/06/2026)
const isInvalid = computed(() => Boolean(props.errorMessage && (!props.meta || props.meta.touched)))

/// Lấy id của option theo idKey.
/// <param name="option">Option cần lấy id.</param>
/// Hàm lấy id của một option tree.
/// CREATED BY: VVHung (11/06/2026)
const getId = (option) => normalizeId(option?.[props.idKey])

/// Lấy parent id của option theo parentKey.
/// <param name="option">Option cần lấy parent id.</param>
/// Hàm lấy id cha của một option tree.
/// CREATED BY: VVHung (13/06/2026)
const getParentId = (option) => normalizeId(option?.[props.parentKey])

/// Lấy label hiển thị của option theo labelKey.
/// <param name="option">Option cần lấy label.</param>
/// Hàm lấy nhãn hiển thị của một option tree.
/// CREATED BY: VVHung (08/06/2026)
const getLabel = (option) => option?.[props.labelKey] ?? ''

/// Map option theo id để lấy dữ liệu nhanh.
/// CREATED BY: VVHung (09/06/2026)
const optionMap = computed(() => {
  const map = new Map()
  props.options.forEach((option) => {
    map.set(getId(option), option)
  })
  return map
})

/// Map gom các node con theo id cha để dựng cây.
/// CREATED BY: VVHung (12/06/2026)
const parentMap = computed(() => {
  const map = new Map()
  props.options.forEach((option) => {
    const parentId = getParentId(option)
    map.set(getId(option), parentId || null)
  })
  return map
})

/// Cây option đầy đủ sau khi dựng từ danh sách phẳng.
/// CREATED BY: VVHung (08/06/2026)
const tree = computed(() => buildTree(props.options))

/// Cây option sau khi lọc theo từ khóa tìm kiếm.
/// CREATED BY: VVHung (07/06/2026)
const filteredTree = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return tree.value

  return filterTree(tree.value, keyword)
})

/// Danh sách option được chọn dùng để render tag trên input.
/// CREATED BY: VVHung (09/06/2026)
const selectedDisplayOptions = computed(() =>
  selectedValues.value
    .map((id) => optionMap.value.get(normalizeId(id)))
    .filter(Boolean)
    .filter((option) => !hasSelectedAncestor(getId(option))),
)

/// Số tag tối đa được hiển thị trực tiếp trên input.
/// CREATED BY: VVHung (09/06/2026)
const maxVisibleTags = computed(() => {
  const count = Number(props.maxVisibleTags)
  return Number.isFinite(count) && count > 0 ? count : 1
})

/// Danh sách option phục vụ visible selected options.
/// CREATED BY: VVHung (11/06/2026)
const visibleSelectedOptions = computed(() =>
  selectedDisplayOptions.value.slice(-maxVisibleTags.value),
)

/// Số option đã chọn đang bị gom vào phần còn lại.
/// CREATED BY: VVHung (12/06/2026)
const hiddenSelectedCount = computed(() =>
  Math.max(selectedDisplayOptions.value.length - visibleSelectedOptions.value.length, 0),
)

/// Build danh sách phẳng thành cấu trúc cây.
/// <param name="options">Danh sách option phẳng.</param>
/// Hàm dựng cấu trúc cây từ danh sách option phẳng.
/// CREATED BY: VVHung (06/06/2026)
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

/// Lọc cây theo từ khóa nhưng vẫn giữ các node cha của kết quả khớp.
/// <param name="nodes">Danh sách node cần lọc.</param>
/// <param name="keyword">Từ khóa tìm kiếm.</param>
/// Hàm lọc cây theo từ khóa nhưng vẫn giữ quan hệ cha con.
/// CREATED BY: VVHung (08/06/2026)
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

/// Lấy id của node hiện tại và tất cả node con.
/// <param name="node">Node cần lấy danh sách id.</param>
/// Hàm lấy toàn bộ id con cháu của một node.
/// CREATED BY: VVHung (07/06/2026)
const getDescendantIds = (node) => [
  getId(node.raw),
  ...node.children.flatMap((child) => getDescendantIds(child)),
]

/// Lấy các option con trực tiếp theo parent id.
/// <param name="parentId">Id của node cha.</param>
/// Hàm lấy danh sách node con theo id cha.
/// CREATED BY: VVHung (08/06/2026)
const getChildrenByParent = (parentId) =>
  props.options.filter((option) => getParentId(option) === normalizeId(parentId))

/// Cập nhật trạng thái chọn của các node cha sau khi node con thay đổi.
/// <param name="set">Tập id đang được chọn.</param>
/// Hàm cập nhật trạng thái chọn của các node cha.
/// CREATED BY: VVHung (09/06/2026)
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

/// Chọn hoặc bỏ chọn node và toàn bộ node con của nó.
/// Hàm bật/tắt chọn một node trong tree.
/// CREATED BY: VVHung (06/06/2026)
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

/// Xóa một tag đã chọn khỏi tree select.
/// Hàm bỏ chọn một option khỏi danh sách đã chọn.
/// CREATED BY: VVHung (11/06/2026)
const removeOption = (option) => {
  const node = findNode(tree.value, getId(option))
  if (node) {
    const next = new Set(selectedSet.value)
    getDescendantIds(node).forEach((id) => next.delete(id))
    updateAncestors(next, getId(option))
    updateValue([...next])
  }
}

/// Hàm xóa toàn bộ option đang chọn.
/// CREATED BY: VVHung (10/06/2026)
const clearSelected = () => {
  updateValue([])
}

/// Cập nhật v-model và phát sự kiện change.
/// Hàm emit danh sách id mới sau khi chọn tree thay đổi.
/// CREATED BY: VVHung (10/06/2026)
const updateValue = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

/// Tìm node trong cây theo id.
/// <param name="nodes">Danh sách node cần tìm.</param>
/// <param name="id">Id cua node can tim.</param>
/// Hàm tìm node trong cây theo id.
/// CREATED BY: VVHung (13/06/2026)
const findNode = (nodes, id) => {
  for (const node of nodes) {
    if (getId(node.raw) === id) return node
    const child = findNode(node.children, id)
    if (child) return child
  }
  return null
}

/// Mở rộng danh sách id đang chọn để bao gồm cả node con khi node cha được chọn.
/// <param name="value">Danh sách id đang chọn.</param>
/// Hàm tự mở các nhánh chứa node đang được chọn.
/// CREATED BY: VVHung (09/06/2026)
const expandSelectedValues = (value) => {
  const next = new Set(value.map((id) => normalizeId(id)).filter(Boolean))

  Array.from(next).forEach((id) => {
    const node = findNode(tree.value, id)
    if (!node) return
    getDescendantIds(node).forEach((descendantId) => next.add(descendantId))
  })

  return Array.from(next)
}

/// Hàm đồng bộ node con khi node cha được chọn.
/// CREATED BY: VVHung (10/06/2026)
const syncSelectedDescendants = () => {
  if (!props.modelValue.length || !tree.value.length) return

  const expandedValues = expandSelectedValues(props.modelValue)
  if (isSameIdList(expandedValues, props.modelValue)) return
  updateValue(expandedValues)
}

/// So sánh hai danh sách id sau khi chuẩn hóa.
/// <param name="left">Danh sách id thứ nhất.</param>
/// <param name="right">Danh sách id thứ hai.</param>
/// Cờ xác định trạng thái same id list.
/// CREATED BY: VVHung (11/06/2026)
const isSameIdList = (left, right) => {
  const leftText = left.map(normalizeId).sort().join(';')
  const rightText = right.map(normalizeId).sort().join(';')
  return leftText === rightText
}

watch(
  [() => props.modelValue, tree],
  () => {
    syncSelectedDescendants()
  },
  { immediate: true, deep: true },
)

/// Kiểm tra option có node cha đang được chọn hay không để ẩn tag trùng lặp.
/// <param name="id">Id cua option can kiem tra.</param>
/// Cờ kiểm tra có selected ancestor.
/// CREATED BY: VVHung (10/06/2026)
const hasSelectedAncestor = (id) => {
  let parentId = parentMap.value.get(id)
  while (parentId) {
    if (selectedSet.value.has(parentId)) return true
    parentId = parentMap.value.get(parentId)
  }
  return false
}

/// Kiểm tra id có đang được chọn hay không.
/// <param name="id">Id cần kiểm tra.</param>
/// Cờ xác định trạng thái checked.
/// CREATED BY: VVHung (07/06/2026)
const isChecked = (id) => selectedSet.value.has(id)

/// Kiểm tra node có đang mở rộng hay không.
/// <param name="id">Id cua node can kiem tra.</param>
/// Cờ xác định trạng thái expanded.
/// CREATED BY: VVHung (13/06/2026)
const isExpanded = (id) => expandedKeys.value.has(id)

/// Mở hoặc thu gọn một node trong cây.
/// Hàm mở hoặc thu gọn một node trong tree.
/// CREATED BY: VVHung (08/06/2026)
const toggleExpand = (id) => {
  const next = new Set(expandedKeys.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedKeys.value = next
}

/// Hàm mở dropdown tree select.
/// CREATED BY: VVHung (13/06/2026)
const openDropdown = () => {
  isOpen.value = true
}

/// Hàm bật/tắt dropdown.
/// CREATED BY: VVHung (07/06/2026)
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

/// Xử lý click bên ngoài tree select để đóng dropdown.
/// Hàm đóng dropdown/popup khi click ra ngoài.
/// CREATED BY: VVHung (07/06/2026)
const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    const wasOpen = isOpen.value
    isOpen.value = false
    if (wasOpen) {
      emit('blur', event)
    }
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

defineExpose({
  focus: () => inputRef.value?.focus?.(),
})
</script>

<style>
.ms-tree-select {
  position: relative;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
}

.ms-tree-select__box {
  position: relative;
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

.ms-tree-select:not(.is-error) .ms-tree-select__box:hover,
.ms-tree-select:not(.is-error) .ms-tree-select__box.is-open {
  border-color: #0e9a62;
  box-shadow: 0 0 0 2px #2563eb1a;
  outline: none;
}

.ms-tree-select.is-error .ms-tree-select__box {
  border-color: #f04438;
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

.ms-tree-select.is-error .ms-tree-select__dropdown {
  top: calc(100% - 18px);
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
  width: 12px;
  height: 12px;
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

.ms-tree-select__error {
  margin-top: 4px;
  color: #f04438;
  font-size: 12px;
  height: auto;
  line-height: 20px;
}

.text-error {
  color: #f7453b !important;
  font-size: 12px !important;
  height: auto;
  line-height: 20px;
  margin-top: 8px !important;
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
