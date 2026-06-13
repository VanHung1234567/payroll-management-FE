<template>
  <div ref="tableContainerRef" class="ms-table-container" @scroll.capture="handleTableScroll">
    <DxDataGrid
      ref="dataGridRef"
      class="ms-table"
      :data-source="tableRows"
      :key-expr="keyExpr"
      :show-borders="false"
      :show-column-lines="false"
      :show-row-lines="false"
      :hover-state-enabled="false"
      :column-auto-width="false"
      :allow-column-resizing="true"
      :allow-column-reordering="true"
      column-resizing-mode="widget"
      :height="'100%'"
      :focused-row-enabled="false"
      :row-alternation-enabled="false"
      @context-menu-preparing="handleContextMenuPreparing"
      @toolbar-preparing="handleToolbarPreparing"
      @row-prepared="handleRowPrepared"
      @option-changed="handleOptionChanged"
    >
      <DxScrolling mode="standard" show-scrollbar="always" :use-native="true" />
      <DxColumnFixing :enabled="true" />
      <DxPaging :enabled="false" />

      <DxColumn
        :width="50"
        :min-width="50"
        :allow-sorting="false"
        :allow-resizing="false"
        :allow-reordering="false"
        :fixed="true"
        fixed-position="left"
        header-cell-template="selectionHeaderTemplate"
        cell-template="selectionCellTemplate"
      />

      <DxColumn
        v-for="column in displayColumns"
        :key="column.fieldName"
        :data-field="column.fieldName"
        :caption="column.caption"
        :width="column.width"
        :min-width="200"
        :allow-sorting="false"
        :allow-resizing="true"
        :allow-reordering="true"
        :fixed="column.isFixed"
        :fixed-position="column.fixedPosition || 'left'"
        header-cell-template="headerCellTemplate"
        cell-template="dataCellTemplate"
      />

      <DxColumn
        v-if="showFillColumn"
        name="__fill-space"
        :min-width="0"
        :allow-sorting="false"
        :allow-resizing="false"
        :allow-reordering="false"
        header-cell-template="fillSpaceTemplate"
        cell-template="fillSpaceTemplate"
      />

      <DxColumn
        v-if="hasVisibleActions"
        name="__action-space"
        :width="actionColumnWidth"
        :min-width="actionColumnWidth"
        :allow-sorting="false"
        :allow-resizing="false"
        :allow-reordering="false"
        header-cell-template="actionSpaceHeaderTemplate"
        cell-template="actionSpaceCellTemplate"
      />

      <template #selectionHeaderTemplate>
        <button
          type="button"
          class="ms-table__checkbox"
          :class="{ 'is-checked': isAllPageChecked, 'is-indeterminate': isPageIndeterminate }"
          @click.stop="toggleAllPageRows"
        >
          <svg
            v-if="isAllPageChecked"
            viewBox="0 0 16 16"
            class="ms-table__check-mark"
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
          <svg
            v-else-if="isPageIndeterminate"
            viewBox="0 0 16 16"
            class="ms-table__minus-mark"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 8H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </template>

      <template #selectionCellTemplate="{ data }">
        <button
          type="button"
          class="ms-table__checkbox"
          :class="{ 'is-checked': isRowChecked(data.data) }"
          @click.stop="toggleRow(data.data)"
        >
          <svg
            v-if="isRowChecked(data.data)"
            viewBox="0 0 16 16"
            class="ms-table__check-mark"
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
        </button>
        <div v-if="hasVisibleActions" class="ms-table__action-cell" :style="actionCellStyle">
          <button
            v-if="props.showAddAction"
            type="button"
            class="button-command-wrap"
            @click.stop="$emit('row-add', data.data)"
          >
            <span class="mi-plus-primary" title="Thêm"></span>
          </button>
          <button
            v-if="props.showActiveAction"
            type="button"
            class="button-command-wrap"
            @click.stop="$emit('row-active', data.data)"
          >
            <span
              :class="isActiveStatus(data.data) ? 'ms-circle-orange' : 'ms-circle-check-green'"
              :title="isActiveStatus(data.data) ? 'Ngừng theo dõi' : 'Đang theo dõi'"
            ></span>
          </button>
          <button
            v-if="props.showCopyAction"
            type="button"
            class="button-command-wrap"
            @click.stop="$emit('row-copy', data.data)"
          >
            <span class="ms-copy" title="Nhân bản"></span>
          </button>
          <button
            v-if="props.showEditAction"
            type="button"
            class="button-command-wrap"
            @click.stop="$emit('row-edit', data.data)"
          >
            <span class="ms-pencil" title="Sửa"></span>
          </button>
          <button
            v-if="props.showDeleteAction"
            type="button"
            class="button-command-wrap"
            @click.stop="$emit('row-delete', data.data)"
          >
            <span class="ms-trash-red" title="Xóa"></span>
          </button>
        </div>
      </template>

      <template #actionSpaceHeaderTemplate>
        <div class="ms-table__action-space"></div>
      </template>

      <template #actionSpaceCellTemplate>
        <div class="ms-table__action-space"></div>
      </template>

      <template #fillSpaceTemplate>
        <div class="ms-table__fill-space"></div>
      </template>

      <template #headerCellTemplate="{ data }">
        <div class="ms-table__header-content">
          <button
            type="button"
            class="ms-table__header-button"
            @click.stop="openHeaderMenu(data, $event)"
          >
            <span v-if="isPinnedIconColumn(data.column.dataField)" class="ms-icon-pinned"></span>
            <span class="ms-table__cell-truncate">{{ data.column.caption }}</span>
            <span
              v-if="getHeaderSortDirection(data.column.dataField)"
              :class="
                getHeaderSortDirection(data.column.dataField) === 'asc'
                  ? 'ms-icon-sort-asc'
                  : 'ms-icon-sort-desc'
              "
            ></span>
          </button>
        </div>
      </template>

      <template #dataCellTemplate="{ data }">
        <span v-if="isStatusColumn(data.column.dataField)" :class="statusClass(data.data)">
          <span class="ms-status-badge__dot"></span>
          {{ getStatusText(data.data) }}
        </span>
        <span
          v-else-if="shouldHighlightValueFormula(data.data, data.column.dataField)"
          class="ms-table__cell-truncate ms-table__cell-truncate--value-formula"
        >
          <span
            v-for="(token, index) in getFormulaTokens(data.data, data.column.dataField)"
            :key="`${token.text}-${index}`"
            :class="`ms-table__formula-token ms-table__formula-token--${token.type}`"
          >
            {{ token.text }}
          </span>
        </span>
        <span v-else class="ms-table__cell-truncate">
          {{
            formatCellValue(
              getDisplayValue(data.data, data.column.dataField),
              data.column.dataField,
            )
          }}
        </span>
      </template>
    </DxDataGrid>

    <div v-if="showEmptyState" class="ms-table__empty-state">
      <div class="ms-empty"></div>
      <div class="ms-table__empty-text">Không có dữ liệu</div>
    </div>

    <div v-if="isLoading" class="ms-table__loading-overlay">
      <div class="ms-loading"></div>
    </div>

    <div
      v-if="hoveredRow && hasVisibleActions"
      class="ms-table__floating-actions"
      :style="{ ...actionCellStyle, top: `${floatingActionTop}px` }"
      @mouseenter="clearActionHideTimer"
      @mouseleave="scheduleHideRowActions"
    >
      <button
        v-if="props.showAddAction"
        type="button"
        class="button-command-wrap"
        @click.stop="$emit('row-add', hoveredRow)"
      >
        <span class="mi-plus-primary" title="Đưa vào danh sách sử dụng"></span>
      </button>
      <button
        v-if="props.showActiveAction"
        type="button"
        class="button-command-wrap"
        @click.stop="$emit('row-active', hoveredRow)"
      >
        <span
          :class="isActiveStatus(hoveredRow) ? 'ms-circle-orange' : 'ms-circle-check-green'"
          :title="isActiveStatus(hoveredRow) ? 'Ngừng theo dõi' : 'Đang theo dõi'"
        ></span>
      </button>
      <button
        v-if="props.showCopyAction"
        type="button"
        class="button-command-wrap"
        @click.stop="$emit('row-copy', hoveredRow)"
      >
        <span class="ms-copy" title="Nhân bản"></span>
      </button>
      <button
        v-if="props.showEditAction"
        type="button"
        class="button-command-wrap"
        @click.stop="$emit('row-edit', hoveredRow)"
      >
        <span class="ms-pencil" title="Sửa"></span>
      </button>
      <button
        v-if="props.showDeleteAction"
        type="button"
        class="button-command-wrap"
        @click.stop="$emit('row-delete', hoveredRow)"
      >
        <span class="ms-trash-red" title="Xóa"></span>
      </button>
    </div>

    <div v-if="headerMenu.isOpen" class="ms-table__menu" :style="headerMenuStyle">
      <button
        type="button"
        class="ms-menu-item"
        :class="{ 'is-active': !sort }"
        @click="applySort('')"
      >
        <span class="ms-icon-circle-off"></span>
        <span>Không sắp xếp</span>
        <span v-if="!sort" class="ms-icon-check1"></span>
      </button>
      <button
        type="button"
        class="ms-menu-item"
        :class="{ 'is-active': sort === headerMenu.apiSortField }"
        @click="applySort(headerMenu.apiSortField)"
      >
        <span class="ms-icon-arrow-up"></span>
        <span>Tăng dần</span>
        <span v-if="sort === headerMenu.apiSortField" class="ms-icon-check1"></span>
      </button>
      <button
        type="button"
        class="ms-menu-item"
        :class="{ 'is-active': sort === `-${headerMenu.apiSortField}` }"
        @click="applySort(`-${headerMenu.apiSortField}`)"
      >
        <span class="ms-icon-arrow-down"></span>
        <span>Giảm dần</span>
        <span v-if="sort === `-${headerMenu.apiSortField}`" class="ms-icon-check1"></span>
      </button>
      <button type="button" class="ms-menu-item" @click="togglePin(headerMenu.fieldName)">
        <span
          :class="isPinnedIconColumn(headerMenu.fieldName) ? 'ms-icon-unpinned' : 'ms-icon-pinned'"
        ></span>
        <span>{{ isPinnedIconColumn(headerMenu.fieldName) ? 'Bỏ ghim cột' : 'Ghim cột' }}</span>
        <span v-if="isPinnedIconColumn(headerMenu.fieldName)" class="ms-icon-check1"></span>
      </button>
    </div>

    <MsPagination
      v-model:page-index="pageIndex"
      v-model:page-size="pageSize"
      :total="total"
      class="ms-table__pagination"
    />

    <MsModal
      v-model="pinDialogVisible"
      title="Không thể ghim cột"
      confirm-text="Đóng"
      :show-cancel="false"
    >
      Tổng độ rộng các cột được ghim vượt quá giới hạn cho phép. Vui lòng giảm độ rộng các cột muốn
      ghim hoặc chọn ghim ít cột hơn.
    </MsModal>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  DxColumn,
  DxColumnFixing,
  DxDataGrid,
  DxPaging,
  DxScrolling,
} from 'devextreme-vue/data-grid'
import 'devextreme/dist/css/dx.light.css'
import GridConfigAPI from '@/apis/components/gridConfig/GridConfig.js'
import SalaryCompositionAPI from '@/apis/components/salaryComposition/SalaryCompositionAPI.js'
import SalaryCompositionSystemAPI from '@/apis/components/salaryCompositionSystem/SalaryCompositionSystem.js'
import MsModal from '@/components/MsModal.vue'
import MsPagination from '@/components/MsPagination.vue'
import { useGridTableStore } from '@/stores/gridTable.js'
import {
  SALARY_COMPOSITION_TYPE_OPTIONS,
  SALARY_COMPOSITION_VALUE_TYPE_OPTIONS,
} from '@/utils/constants'

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (08/06/2026)
const props = defineProps({
  // Key định danh state paging/search và query data của grid.
  gridKey: {
    type: String,
    default: 'salary_composition',
  },
  // Key riêng để lấy cấu hình cột; dùng khi một grid muốn reuse config của grid khác.
  configGridKey: {
    type: String,
    default: '',
  },
  // Object API hoặc tên API map nội bộ; cần có paging/filter.
  dataApi: {
    type: [Object, String],
    default: () => SalaryCompositionAPI,
  },
  // Field khóa chính của row.
  keyExpr: {
    type: String,
    default: 'salaryCompositionID',
  },
  // Trang mặc định khi khởi tạo state.
  pageIndex: {
    type: Number,
    default: 1,
  },
  // Số dòng/trang mặc định khi khởi tạo state.
  pageSize: {
    type: Number,
    default: 15,
  },
  // Từ khóa tìm kiếm gửi lên API.
  search: {
    type: String,
    default: '',
  },
  // Danh sách field search nếu backend hỗ trợ.
  searchFields: {
    type: String,
    default: '',
  },
  // Bộ lọc truyền từ toolbar/page, sẽ merge vào payload API.
  filters: {
    type: Object,
    default: () => ({}),
  },
  // Hiển thị action đổi trạng thái theo dõi/ngừng theo dõi.
  showActiveAction: {
    type: Boolean,
    default: true,
  },
  // Hiển thị action thêm/đưa vào sử dụng.
  showAddAction: {
    type: Boolean,
    default: false,
  },
  // Hiển thị action nhân bản.
  showCopyAction: {
    type: Boolean,
    default: true,
  },
  // Hiển thị action sửa.
  showEditAction: {
    type: Boolean,
    default: true,
  },
  // Hiển thị action xóa.
  showDeleteAction: {
    type: Boolean,
    default: true,
  },
  // Tăng giá trị này từ parent để yêu cầu grid clear toàn bộ checkbox.
  clearSelectionSignal: {
    type: Number,
    default: 0,
  },
  // Danh sach don vi phang de hien thi cot don vi theo cay, an con khi cha da duoc chon.
  organizationOptions: {
    type: Array,
    default: () => [],
  },
})

/// Khai báo các sự kiện component bắn ra ngoài.
/// CREATED BY: VVHung (07/06/2026)
const emit = defineEmits([
  'row-active',
  'row-add',
  'row-copy',
  'row-edit',
  'row-delete',
  'selection-change',
  'update:selectedRows',
])

/// Store quản lý state dùng chung của các grid.
/// CREATED BY: VVHung (13/06/2026)
const gridTableStore = useGridTableStore()
/// State dùng chung để lưu paging, sort, filter và lựa chọn của grid.
/// CREATED BY: VVHung (11/06/2026)
const gridState = gridTableStore.ensureGridState(props.gridKey, {
  pageIndex: props.pageIndex,
  pageSize: props.pageSize,
  search: props.search,
  searchFields: props.searchFields,
})
/// Trang hiện tại của grid, đồng bộ với grid store.
/// CREATED BY: VVHung (11/06/2026)
const pageIndex = computed({
  get: () => gridState.pageIndex,
  set: (value) => gridTableStore.setPageIndex(props.gridKey, Number(value)),
})
/// Số dòng mỗi trang của grid, đồng bộ với grid store.
/// CREATED BY: VVHung (12/06/2026)
const pageSize = computed({
  get: () => gridState.pageSize,
  set: (value) => gridTableStore.setPageSize(props.gridKey, Number(value)),
})
/// Chuỗi sort hiện tại gửi lên API phân trang.
/// CREATED BY: VVHung (10/06/2026)
const sort = ref('')
/// Tập key của các dòng đang được chọn.
/// CREATED BY: VVHung (11/06/2026)
const selectedKeys = ref(new Set())
/// Map lưu dữ liệu dòng đã chọn theo key.
/// CREATED BY: VVHung (09/06/2026)
const selectedRowMap = ref(new Map())
/// Danh sách cấu hình cột đã chuẩn hóa từ API.
/// CREATED BY: VVHung (11/06/2026)
const configColumns = ref([])
/// Đối tượng Vue Query dùng để đọc, cập nhật và refetch cache.
/// CREATED BY: VVHung (11/06/2026)
const queryClient = useQueryClient()
/// Cờ hiển thị dialog xác nhận ghim/bỏ ghim cột.
/// CREATED BY: VVHung (09/06/2026)
const pinDialogVisible = ref(false)
/// Ref tới instance DevExtreme DataGrid.
/// CREATED BY: VVHung (11/06/2026)
const dataGridRef = ref(null)
/// Dữ liệu dòng đang được hover để hiển thị action nổi.
/// CREATED BY: VVHung (11/06/2026)
const hoveredRow = ref(null)
/// Tọa độ top của cụm action nổi theo dòng đang hover.
/// CREATED BY: VVHung (09/06/2026)
const floatingActionTop = ref(0)
/// Timer trì hoãn ẩn cụm action nổi.
/// CREATED BY: VVHung (13/06/2026)
const actionHideTimer = ref(null)
/// DOM row đang hiển thị cụm action nổi.
/// CREATED BY: VVHung (10/06/2026)
const activeActionRowElement = ref(null)
/// Timer debounce lưu thứ tự cột sau khi kéo thả.
/// CREATED BY: VVHung (06/06/2026)
const reorderTimer = ref(null)
/// Timer debounce lưu độ rộng cột sau khi kéo resize.
/// CREATED BY: VVHung (09/06/2026)
const resizePersistTimer = ref(null)
/// Cờ đánh dấu đang chờ lưu độ rộng cột.
/// CREATED BY: VVHung (13/06/2026)
const pendingResizePersist = ref(null)
/// Tập field đang hiển thị icon ghim trên header cột.
/// CREATED BY: VVHung (06/06/2026)
const pinnedIconFields = ref(new Set())
/// Danh sách field đang ghim theo đúng thứ tự người dùng ghim.
/// CREATED BY: VVHung (10/06/2026)
const pinnedFieldStack = ref([])
/// Cờ xác định DataGrid đã sẵn sàng để gọi instance API.
/// CREATED BY: VVHung (11/06/2026)
const isGridReady = ref(false)
/// Cờ tạm chặn lưu sortOrder khi grid tự reorder.
/// CREATED BY: VVHung (07/06/2026)
const suppressOrderPersist = ref(false)
/// Timer tạm chặn lưu sortOrder khi grid đang tự cập nhật cột.
/// CREATED BY: VVHung (10/06/2026)
let suppressOrderPersistTimer = null
/// Hàng đợi lưu cấu hình cột để tránh gọi API chồng nhau.
/// CREATED BY: VVHung (09/06/2026)
let persistQueue = Promise.resolve()

/// Map API dữ liệu theo loại grid được truyền vào.
/// CREATED BY: VVHung (06/06/2026)
const DATA_API_MAP = {
  SalaryCompositionAPI,
  SalaryCompositionSystemAPI,
}

/// API thực tế được chọn để lấy dữ liệu grid.
/// CREATED BY: VVHung (08/06/2026)
const resolvedDataApi = computed(() => {
  if (typeof props.dataApi !== 'string') return props.dataApi

  return DATA_API_MAP[props.dataApi] || SalaryCompositionAPI
})

/// Bộ filter đã chuẩn hóa trước khi gửi API.
/// CREATED BY: VVHung (12/06/2026)
const normalizedFilters = computed(() => {
  const entries = Object.entries(props.filters || {}).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined && value !== ''
  })

  return Object.fromEntries(entries)
})

/// Cờ kiểm tra có active filters.
/// CREATED BY: VVHung (07/06/2026)
const hasActiveFilters = computed(() => Object.keys(normalizedFilters.value).length > 0)

/// Lấy thông tin phân trang, tìm kiếm, sắp xếp và bộ lọc để gửi lên API.
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getPagingPayload() {
  return {
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    search: props.search,
    sort: sort.value,
    searchFields: props.searchFields,
    ...normalizedFilters.value,
  }
}

// Chỉ các field thật có trong bảng/database mới được gửi lên backend để sort.
// Các field hiển thị như NatureName, TaxTypeName... chỉ là field ảo ở frontend.
/// Tập field cần gửi sort theo tên cột database.
/// CREATED BY: VVHung (13/06/2026)
const DB_SORT_FIELDS = new Set([
  'SalaryCompositionID',
  'SalaryCompositionCode',
  'SalaryCompositionName',
  'OrganizationIDs',
  'SalaryCompositionType',
  'SalaryCompositionTypeID',
  'Nature',
  'TaxType',
  'IsTaxReduction',
  'NormFormula',
  'AllowOverNorm',
  'ValueType',
  'ValueFormula',
  'Description',
  'PayslipDisplayType',
  'CreatedSource',
  'Status',
  'CreatedDate',
  'OrganizationNames',
])

/// Map chuyển field hiển thị trên grid sang field sort gửi backend.
/// CREATED BY: VVHung (10/06/2026)
const SORT_FIELD_MAP = {
  OrganizationName: 'OrganizationNames',
  OrganizationNames: 'OrganizationNames',
  TypeName: 'SalaryCompositionType',
  SalaryCompositionTypeID: 'SalaryCompositionType',
  NatureName: 'Nature',
  TaxTypeName: 'TaxType',
  ValueTypeName: 'ValueType',
  PayslipDisplayTypeName: 'PayslipDisplayType',
  CreatedSourceName: 'CreatedSource',
  StatusName: 'Status',
}
/// Map text loại thành phần theo value.
/// CREATED BY: VVHung (08/06/2026)
const typeOptionTextMap = createOptionTextMap(SALARY_COMPOSITION_TYPE_OPTIONS)
/// Map text kiểu giá trị theo value.
/// CREATED BY: VVHung (11/06/2026)
const valueTypeOptionTextMap = createOptionTextMap(SALARY_COMPOSITION_VALUE_TYPE_OPTIONS)

/// Chuẩn hóa tên cột sắp xếp sang field backend cho phép sort.
/// <param name="fieldName">Tên field cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function normalizeSortField(fieldName) {
  const pascalFieldName = toPascalCase(fieldName)
  const mappedFieldName = SORT_FIELD_MAP[pascalFieldName] || pascalFieldName

  return DB_SORT_FIELDS.has(mappedFieldName) ? mappedFieldName : ''
}

/// State menu sort/ghim đang mở trên header cột.
/// CREATED BY: VVHung (08/06/2026)
const headerMenu = reactive({
  isOpen: false,
  fieldName: '',
  apiFieldName: '',
  apiSortField: '',
  left: 0,
  top: 0,
})

/// Grid key thực tế dùng để lấy cấu hình cột.
/// CREATED BY: VVHung (07/06/2026)
const resolvedConfigGridKey = computed(() => props.configGridKey || props.gridKey)
/// Query key lấy cấu hình cột của grid.
/// CREATED BY: VVHung (11/06/2026)
const gridConfigQueryKey = computed(() => ['grid-config', resolvedConfigGridKey.value])
/// Query key lấy dữ liệu phân trang của grid.
/// CREATED BY: VVHung (07/06/2026)
const pagingQueryKey = computed(() => [
  'grid-table-paging',
  props.gridKey,
  pageIndex.value,
  pageSize.value,
  props.search,
  props.searchFields,
  sort.value,
  normalizedFilters.value,
])

/// Response dữ liệu phân trang nhận từ API.
/// CREATED BY: VVHung (08/06/2026)
const { data: gridConfigResponse, isFetching: isConfigFetching } = useQuery({
  queryKey: gridConfigQueryKey,
  queryFn: () => GridConfigAPI.getGridKey(resolvedConfigGridKey.value),
})

/// Response cấu hình cột nhận từ API GridConfig.
/// CREATED BY: VVHung (08/06/2026)
const { data: pagingResponse, isFetching: isRowsFetching } = useQuery({
  queryKey: pagingQueryKey,
  queryFn: () => {
    const payload = getPagingPayload()
    if (hasActiveFilters.value && typeof resolvedDataApi.value.filter === 'function') {
      return resolvedDataApi.value.filter(payload)
    }

    return resolvedDataApi.value.paging(payload)
  },
})

/// Cờ xác định trạng thái loading.
/// CREATED BY: VVHung (10/06/2026)
const isLoading = computed(() => isConfigFetching.value || isRowsFetching.value)

/// Danh sách cột phục vụ raw config columns.
/// CREATED BY: VVHung (07/06/2026)
const rawConfigColumns = computed(() => {
  const payload = normalizeResponseData(gridConfigResponse.value)
  if (Array.isArray(payload)) return payload
  return payload.data || []
})

watch(
  rawConfigColumns,
  async (columns) => {
    if (!columns.length) return
    const shouldApplyOrderDirectly = isGridReady.value
    const previousPinnedFields = [...pinnedFieldStack.value]
    configColumns.value = columns.map(normalizeColumn)
    setPinnedFieldStack(getNextPinnedFieldStack(previousPinnedFields, configColumns.value))
    if (shouldApplyOrderDirectly) {
      await applyColumnOrderToGrid()
      syncAndPersistFixedColumns(displayColumns.value)
      repaintGrid()
    }
    window.setTimeout(() => {
      isGridReady.value = true
    }, 0)
  },
  { immediate: true },
)

watch(
  () => [props.search, props.searchFields],
  () => {
    gridTableStore.setSearch(props.gridKey, props.search, props.searchFields)
  },
)

watch(
  normalizedFilters,
  () => {
    hideRowActions()
    pageIndex.value = 1
  },
  { deep: true },
)

/// Dữ liệu phân trang đã được chuẩn hóa từ response API.
/// CREATED BY: VVHung (10/06/2026)
const pagingData = computed(() => normalizeResponseData(pagingResponse.value))
/// Danh sách bản ghi hiện tại đang hiển thị trong grid.
/// CREATED BY: VVHung (13/06/2026)
const rows = computed(() => pagingData.value.data || [])
/// Tổng số bản ghi dùng cho phân trang.
/// CREATED BY: VVHung (12/06/2026)
const total = computed(() => pagingData.value.total || rows.value.length)
/// Cờ hiển thị trạng thái không có dữ liệu của grid.
/// CREATED BY: VVHung (13/06/2026)
const showEmptyState = computed(() => !isLoading.value && rows.value.length === 0)
/// Số lượng nút thao tác dòng đang được bật.
/// CREATED BY: VVHung (11/06/2026)
const visibleActionCount = computed(
  () =>
    Number(props.showActiveAction) +
    Number(props.showAddAction) +
    Number(props.showCopyAction) +
    Number(props.showEditAction) +
    Number(props.showDeleteAction),
)
/// Cờ xác định grid có cần render vùng nút thao tác không.
/// CREATED BY: VVHung (13/06/2026)
const hasVisibleActions = computed(() => visibleActionCount.value > 0)
/// Độ rộng cột thao tác tính theo số nút đang hiển thị.
/// CREATED BY: VVHung (10/06/2026)
const actionColumnWidth = computed(() => Math.max(48, visibleActionCount.value * 40 + 40))
/// Style độ rộng áp dụng cho cụm nút thao tác nổi.
/// CREATED BY: VVHung (09/06/2026)
const actionCellStyle = computed(() => ({
  width: `${actionColumnWidth.value - 40}px`,
}))
/// Danh sách dòng đã gắn thêm trạng thái checkbox chọn dòng.
/// CREATED BY: VVHung (07/06/2026)
const tableRows = computed(() => {
  return rows.value.map((row) => ({
    ...row,
    __msSelected: selectedKeys.value.has(getRowKey(row)),
  }))
})
/// Map đơn vị theo id để format tên đơn vị nhanh.
/// CREATED BY: VVHung (12/06/2026)
const organizationOptionMap = computed(() => {
  const map = new Map()
  props.organizationOptions.forEach((organization) => {
    const id = normalizeId(getOrganizationId(organization))
    if (id) {
      map.set(id, organization)
    }
  })
  return map
})

watch(
  [isLoading, rows],
  () => {
    hideRowActions()
  },
  { flush: 'post' },
)

watch(
  () => props.clearSelectionSignal,
  () => {
    clearSelection()
  },
)

/// Danh sách cột visible đã sắp xếp để render lên grid.
/// CREATED BY: VVHung (07/06/2026)
const displayColumns = computed(() =>
  configColumns.value
    .filter((column) => column.visible !== false)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)),
)
/// Cờ render cột trống để grid vẫn kéo hết chiều ngang.
/// CREATED BY: VVHung (10/06/2026)
const showFillColumn = computed(() => displayColumns.value.length <= 1)

/// Tạm dừng lưu thứ tự cột khi đang đồng bộ từ cấu hình backend vào grid.
/// CREATED BY: VVHung (05/06/2026)
function suppressOrderPersistTemporarily() {
  suppressOrderPersist.value = true
  if (suppressOrderPersistTimer) {
    window.clearTimeout(suppressOrderPersistTimer)
  }

  suppressOrderPersistTimer = window.setTimeout(() => {
    suppressOrderPersist.value = false
    suppressOrderPersistTimer = null
  }, 300)
}

/// Cập nhật thứ tự cột trực tiếp trên instance để tránh remount grid khi chỉ đổi SortOrder.
/// CREATED BY: VVHung (05/06/2026)
async function applyColumnOrderToGrid() {
  await nextTick()

  const rawGridInstance = dataGridRef.value?.instance
  const gridInstance = typeof rawGridInstance === 'function' ? rawGridInstance() : rawGridInstance
  if (!gridInstance) return

  suppressOrderPersistTemporarily()
  gridInstance.beginUpdate()
  try {
    displayColumns.value.forEach((column, index) => {
      gridInstance.columnOption(column.fieldName, 'visibleIndex', index + 1)
    })
  } finally {
    gridInstance.endUpdate()
  }
}

/// Repaint grid sau khi đổi visible/sort/fixed runtime để DevExtreme bỏ cache cột cũ.
/// CREATED BY: VVHung (09/06/2026)
function repaintGrid() {
  const rawGridInstance = dataGridRef.value?.instance
  const gridInstance = typeof rawGridInstance === 'function' ? rawGridInstance() : rawGridInstance
  gridInstance?.repaint?.()
  gridInstance?.updateDimensions?.()
}

/// Apply trạng thái fixed trực tiếp vào DevExtreme để tránh grid dùng cache cột cũ sau hide/show/drag.
/// <param name="orderedColumns">Danh sách cột visible theo thứ tự cần hiển thị.</param>
/// CREATED BY: VVHung (09/06/2026)
function applyFixedColumnsToGrid(orderedColumns = displayColumns.value) {
  const rawGridInstance = dataGridRef.value?.instance
  const gridInstance = typeof rawGridInstance === 'function' ? rawGridInstance() : rawGridInstance
  if (!gridInstance) return

  suppressOrderPersistTemporarily()
  gridInstance.beginUpdate()
  try {
    orderedColumns.forEach((column, index) => {
      gridInstance.columnOption(column.fieldName, 'visibleIndex', index + 1)
      gridInstance.columnOption(column.fieldName, 'fixed', Boolean(column.isFixed))
      if (column.isFixed) {
        gridInstance.columnOption(column.fieldName, 'fixedPosition', column.fixedPosition || 'left')
      }
    })
  } finally {
    gridInstance.endUpdate()
  }
}

/// Style động áp dụng cho header menu style.
/// CREATED BY: VVHung (13/06/2026)
const headerMenuStyle = computed(() => ({
  left: `${headerMenu.left}px`,
  top: `${headerMenu.top}px`,
}))

/// Cờ xác định trạng thái all page checked.
/// CREATED BY: VVHung (13/06/2026)
const isAllPageChecked = computed(
  () => rows.value.length > 0 && rows.value.every((row) => selectedKeys.value.has(getRowKey(row))),
)

/// Cờ xác định trạng thái page indeterminate.
/// CREATED BY: VVHung (10/06/2026)
const isPageIndeterminate = computed(
  () => rows.value.some((row) => selectedKeys.value.has(getRowKey(row))) && !isAllPageChecked.value,
)

/// Chuẩn hóa dữ liệu trả về từ API về payload sử dụng trong màn hình.
/// <param name="response">Response trả về từ API.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function normalizeResponseData(response) {
  return response?.data?.data ?? response?.data ?? {}
}

/// Chuẩn hóa cấu hình cột từ backend sang cấu hình hiển thị của grid.
/// <param name="column">Cấu hình cột cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function normalizeColumn(column) {
  const rawFieldName = column.fieldName || column.FieldName

  return {
    ...column,
    gridConfigID: column.gridConfigID || column.GridConfigID,
    gridKey: column.gridKey || column.GridKey || props.gridKey,
    apiFieldName: rawFieldName,
    apiSortField: normalizeSortField(rawFieldName),
    fieldName: toCamelCase(rawFieldName),
    caption: column.caption || column.Caption,
    width: Math.max(Number(column.width || column.Width || 200), 200),
    visible: normalizeBoolean(column.visible ?? column.Visible ?? true),
    isFixed: Boolean(column.isFixed ?? column.IsFixed),
    fixedPosition: column.fixedPosition || column.FixedPosition || null,
    allowSorting: column.allowSorting ?? column.AllowSorting ?? true,
    sortOrder: column.sortOrder ?? column.SortOrder,
  }
}

/// Chuẩn hóa giá trị boolean từ backend.
/// <param name="value">Giá trị cần xử lý.</param>
/// <returns>Giá trị boolean.</returns>
/// CREATED BY: VVHung (05/06/2026)
function normalizeBoolean(value) {
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1'
  return Boolean(value)
}

/// Lấy danh sách cột cần hiển thị icon ghim ban đầu.
/// <param name="columns">Danh sách cột cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getInitialPinnedFieldStack(columns) {
  const fixedColumns = columns
    .filter((column) => column.visible !== false && column.isFixed)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))

  if (!fixedColumns.length) return []

  return [fixedColumns[fixedColumns.length - 1].fieldName]
}

/// Lấy mốc ghim tiếp theo khi cấu hình cột thay đổi.
/// <param name="previousPinnedFields">Mốc ghim đang được dùng trước khi config đổi.</param>
/// <param name="columns">Danh sách cột mới.</param>
/// <returns>Stack field đang là mốc ghim.</returns>
/// CREATED BY: VVHung (09/06/2026)
function getNextPinnedFieldStack(previousPinnedFields, columns) {
  const fieldNames = new Set(columns.map((column) => column.fieldName))
  const visibleFields = new Set(
    columns.filter((column) => column.visible !== false).map((column) => column.fieldName),
  )
  const preservedPinnedFields = previousPinnedFields.filter(
    (fieldName) => fieldNames.has(fieldName) && visibleFields.has(fieldName),
  )

  if (preservedPinnedFields.length) return preservedPinnedFields
  return getInitialPinnedFieldStack(columns)
}

/// Cập nhật stack ghim và chỉ hiện icon ở mốc ghim hiện tại.
/// <param name="fieldStack">Danh sach field ghim theo thu tu lich su.</param>
/// CREATED BY: VVHung (09/06/2026)
function setPinnedFieldStack(fieldStack) {
  const uniqueFieldStack = [...new Set(fieldStack)]
  pinnedFieldStack.value = uniqueFieldStack
  const currentPinnedField = uniqueFieldStack[uniqueFieldStack.length - 1]
  pinnedIconFields.value = currentPinnedField ? new Set([currentPinnedField]) : new Set()
}

/// Chuyển tên field sang dạng camelCase.
/// <param name="value">Giá trị cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function toCamelCase(value) {
  if (!value) return value
  return `${value[0].toLowerCase()}${value.slice(1)}`
}

/// Chuyển tên field sang dạng PascalCase.
/// <param name="value">Giá trị cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function toPascalCase(value) {
  if (!value) return value
  return `${value[0].toUpperCase()}${value.slice(1)}`
}

/// Lấy khóa định danh của dòng dữ liệu.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getRowKey(row) {
  return row?.[props.keyExpr] ?? row?.[toPascalCase(props.keyExpr)]
}

/// Lấy giá trị gốc của ô dữ liệu theo tên field.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <param name="fieldName">Tên field cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getRawCellValue(row, fieldName) {
  return row?.[fieldName] ?? row?.[toPascalCase(fieldName)]
}

/// Lấy giá trị hiển thị của ô dữ liệu theo mapping frontend.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <param name="fieldName">Tên field cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getDisplayValue(row, fieldName) {
  const lowerField = String(fieldName || '').toLowerCase()
  const value = getRawCellValue(row, fieldName)

  if (lowerField === 'normformula') {
    return ''
  }

  if (lowerField === 'valueformula') {
    return isAutoSumValueFormula(value) ? '-' : value
  }

  if (
    lowerField === 'organizationid' ||
    lowerField === 'organizationids' ||
    lowerField === 'organizationname' ||
    lowerField === 'organizationnames'
  ) {
    return formatOrganizationDisplay(row, value) || (
      row.organizationNames ??
      row.OrganizationNames ??
      row.organizationName ??
      row.OrganizationName ??
      value
    )
  }

  if (
    lowerField === 'salarycompositiontype' ||
    lowerField === 'salarycompositiontypeid' ||
    lowerField === 'typename'
  ) {
    return (
      row.typeName ??
      row.TypeName ??
      optionText(row.salaryCompositionType ?? row.SalaryCompositionType ?? value, typeOptionTextMap)
    )
  }

  if (lowerField === 'nature' || lowerField === 'naturename') {
    return optionText(row.nature ?? row.Nature ?? value, {
      1: 'Thu nhập',
      2: 'Khấu trừ',
      3: 'Khác',
    })
  }

  if (lowerField === 'taxtype' || lowerField === 'taxtypename') {
    return optionText(row.taxType ?? row.TaxType ?? value, {
      1: 'Chịu thuế',
      2: 'Miễn thuế toàn phần',
      3: 'Miễn thuế một phần',
    })
  }

  if (lowerField === 'valuetype' || lowerField === 'valuetypename') {
    return optionText(row.valueType ?? row.ValueType ?? value, valueTypeOptionTextMap)
  }

  if (lowerField === 'valuetype' || lowerField === 'valuetypename') {
    return optionText(row.valueType ?? row.ValueType ?? value, {
      1: 'Tiền tệ',
      2: 'Số',
      3: 'Phần trăm',
      4: 'Công thức',
    })
  }

  if (lowerField === 'payslipdisplaytype' || lowerField === 'payslipdisplaytypename') {
    return optionText(row.payslipDisplayType ?? row.PayslipDisplayType ?? value, {
      1: 'Có',
      2: 'Không',
      3: 'Chỉ hiện nếu giá trị khác 0',
    })
  }

  if (lowerField === 'createdsource' || lowerField === 'createdsourcename') {
    return optionText(row.createdSource ?? row.CreatedSource ?? value, {
      1: 'Tự thêm',
      2: 'Mặc định',
    })
  }

  return value
}

/// Chuẩn hóa id về string để so sánh an toàn.
/// <param name="id">Id cần chuẩn hóa.</param>
/// <returns>Id dang string.</returns>
/// CREATED BY: VVHung (06/06/2026)
function normalizeId(id) {
  return id === null || id === undefined ? '' : String(id).trim()
}

/// Lấy id đơn vị từ option.
/// <param name="organization">Đơn vị cần xử lý.</param>
/// <returns>Id don vi.</returns>
/// CREATED BY: VVHung (06/06/2026)
function getOrganizationId(organization) {
  return (
    organization?.organizationID ??
    organization?.OrganizationID ??
    organization?.id ??
    organization?.ID ??
    null
  )
}

/// Lấy id cha của đơn vị từ option.
/// <param name="organization">Đơn vị cần xử lý.</param>
/// <returns>Id don vi cha.</returns>
/// CREATED BY: VVHung (06/06/2026)
function getOrganizationParentId(organization) {
  return (
    organization?.parentID ??
    organization?.ParentID ??
    organization?.parentId ??
    organization?.ParentId ??
    null
  )
}

/// Lấy tên hiển thị của đơn vị từ option.
/// <param name="organization">Đơn vị cần xử lý.</param>
/// <returns>Tên đơn vị.</returns>
/// CREATED BY: VVHung (06/06/2026)
function getOrganizationLabel(organization) {
  return (
    organization?.organizationName ??
    organization?.OrganizationName ??
    organization?.name ??
    organization?.Name ??
    ''
  )
}

/// Tách danh sách id dạng string từ cell dữ liệu.
/// <param name="value">Gia tri cell can tach.</param>
/// <returns>Danh sach id.</returns>
/// CREATED BY: VVHung (06/06/2026)
function splitIds(value) {
  if (Array.isArray(value)) return value.map(normalizeId).filter(Boolean)
  return String(value ?? '')
    .split(/[;,]/)
    .map(normalizeId)
    .filter(Boolean)
}

/// Kiểm tra một id có cha đang nằm trong tập đã chọn hay không.
/// <param name="id">Id cần kiểm tra.</param>
/// <param name="selectedIdSet">Tập id đang chọn.</param>
/// <returns>true neu co cha dang chon.</returns>
/// CREATED BY: VVHung (06/06/2026)
function hasSelectedOrganizationAncestor(id, selectedIdSet) {
  let parentId = normalizeId(getOrganizationParentId(organizationOptionMap.value.get(id)))

  while (parentId) {
    if (selectedIdSet.has(parentId)) return true
    parentId = normalizeId(getOrganizationParentId(organizationOptionMap.value.get(parentId)))
  }

  return false
}

/// Hiển thị tên đơn vị theo cây: nếu cha đã được chọn thì không hiện các con.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <param name="fallbackValue">Giá trị fallback khi không có options.</param>
/// <returns>Chuỗi tên đơn vị hiển thị.</returns>
/// CREATED BY: VVHung (06/06/2026)
function formatOrganizationDisplay(row, fallbackValue) {
  if (!props.organizationOptions.length) return ''

  const ids = splitIds(
    row.organizationIDs ??
      row.OrganizationIDs ??
      row.organizationID ??
      row.OrganizationID ??
      fallbackValue,
  )
  if (!ids.length) return ''

  const selectedIdSet = new Set(ids)
  const labels = ids
    .filter((id) => !hasSelectedOrganizationAncestor(id, selectedIdSet))
    .map((id) => getOrganizationLabel(organizationOptionMap.value.get(id)))
    .filter(Boolean)

  return labels.join(', ')
}

/// Lấy nhãn hiển thị tương ứng với giá trị option.
/// <param name="value">Giá trị cần xử lý.</param>
/// <param name="map">Map giá trị sang nhãn hiển thị.</param>
/// CREATED BY: VVHung (03/06/2026)
function optionText(value, map) {
  return map[Number(value)] ?? value
}

/// Tạo map tra cứu nhãn option theo giá trị.
/// <param name="options">Danh sách option cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function createOptionTextMap(options) {
  return Object.fromEntries(options.map((option) => [Number(option.value), option.label]))
}

/// Kiểm tra công thức giá trị có phải cấu hình tự động cộng tổng không.
/// <param name="value">Giá trị cần xử lý.</param>
/// <returns>true nếu thỏa điều kiện, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
function isAutoSumValueFormula(value) {
  if (typeof value !== 'string') return false

  try {
    return JSON.parse(value)?.mode === 'auto_sum'
  } catch {
    return value.includes('"mode":"auto_sum"') || value.includes('"mode": "auto_sum"')
  }
}

/// Kiểm tra ô công thức giá trị có cần tô màu công thức không.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <param name="fieldName">Tên field cần xử lý.</param>
/// <returns>true nếu thỏa điều kiện, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
function shouldHighlightValueFormula(row, fieldName) {
  if (String(fieldName || '').toLowerCase() !== 'valueformula') return false

  const value = getRawCellValue(row, fieldName)
  return value !== null && value !== undefined && value !== '' && !isAutoSumValueFormula(value)
}

/// Tách công thức thành các token để hiển thị màu trong grid.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <param name="fieldName">Tên field cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getFormulaTokens(row, fieldName) {
  const value = String(getRawCellValue(row, fieldName) ?? '')
  const parts = value.split(/([=+\-*/(),])/).filter((part) => part !== '')

  return parts.map((text, index) => {
    if (/^[=+\-*/(),]$/.test(text)) {
      return { text, type: 'operator' }
    }

    const nextToken = parts[index + 1] ?? ''
    if (/^[A-Z][A-Z0-9_]*$/.test(text) && nextToken === '(' && !text.includes('_')) {
      return { text, type: 'function' }
    }

    return { text, type: 'parameter' }
  })
}

/// Kiểm tra dòng dữ liệu đã được chọn hay chưa.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>true nếu thỏa điều kiện, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
function isRowChecked(row) {
  return selectedKeys.value.has(getRowKey(row))
}

/// Chọn hoặc bỏ chọn một dòng dữ liệu.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function toggleRow(row) {
  const next = new Set(selectedKeys.value)
  const nextRows = new Map(selectedRowMap.value)
  const key = getRowKey(row)
  if (next.has(key)) {
    next.delete(key)
    nextRows.delete(key)
  } else {
    next.add(key)
    nextRows.set(key, row)
  }
  selectedKeys.value = next
  selectedRowMap.value = nextRows
  emitSelectionChange()
}

/// Chọn hoặc bỏ chọn tất cả dòng trên trang hiện tại.
/// CREATED BY: VVHung (03/06/2026)
function toggleAllPageRows() {
  const next = new Set(selectedKeys.value)
  const nextRows = new Map(selectedRowMap.value)
  if (isAllPageChecked.value) {
    rows.value.forEach((row) => {
      const key = getRowKey(row)
      next.delete(key)
      nextRows.delete(key)
    })
  } else {
    rows.value.forEach((row) => {
      const key = getRowKey(row)
      next.add(key)
      nextRows.set(key, row)
    })
  }
  selectedKeys.value = next
  selectedRowMap.value = nextRows
  emitSelectionChange()
}

/// Xóa toàn bộ lựa chọn hiện tại trên grid.
/// CREATED BY: VVHung (03/06/2026)
function clearSelection() {
  if (!selectedKeys.value.size) return
  selectedKeys.value = new Set()
  selectedRowMap.value = new Map()
  emitSelectionChange()
}

/// Lấy danh sách dòng đang được chọn.
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getSelectedRows() {
  return [...selectedRowMap.value.values()]
}

/// Phát sự kiện thay đổi danh sách dòng được chọn.
/// CREATED BY: VVHung (03/06/2026)
function emitSelectionChange() {
  const selectedRows = getSelectedRows()
  emit('selection-change', selectedRows)
  emit('update:selectedRows', selectedRows)
}

/// Xử lý sự kiện chuẩn bị context menu của grid.
/// <param name="event">Sự kiện phát sinh từ giao diện.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleContextMenuPreparing(event) {
  event.items = []
  event.cancel = true
}

/// Xử lý sự kiện chuẩn bị toolbar của grid.
/// <param name="event">Sự kiện phát sinh từ giao diện.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleToolbarPreparing(event) {
  event.toolbarOptions.items = []
}

/// Xử lý sự kiện sau khi dòng dữ liệu được render.
/// <param name="event">Sự kiện phát sinh từ giao diện.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleRowPrepared(event) {
  if (event.rowType !== 'data') return
  const rowElement = event.rowElement?.classList ? event.rowElement : event.rowElement?.[0]
  if (!rowElement) return

  if (event.data.__msEmptyRow) {
    rowElement.classList.add('is-empty-placeholder')
    return
  }

  rowElement.classList.toggle('is-selected', Boolean(event.data.__msSelected))
  rowElement.style.position = 'relative'

  rowElement.onmouseenter = () => showRowActions(event.data, rowElement)
  rowElement.onmouseleave = scheduleHideRowActions
}

/// Hiển thị cụm nút thao tác nổi của dòng dữ liệu.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <param name="rowElement">Phần tử DOM của dòng dữ liệu.</param>
/// CREATED BY: VVHung (03/06/2026)
function showRowActions(row, rowElement) {
  clearActionHideTimer()
  if (activeActionRowElement.value && activeActionRowElement.value !== rowElement) {
    activeActionRowElement.value.classList.remove('is-action-hover')
  }

  activeActionRowElement.value = rowElement
  rowElement.classList.add('is-action-hover')
  hoveredRow.value = row
  updateFloatingActionTop()
}

/// Cập nhật vị trí top của cụm nút thao tác nổi.
/// CREATED BY: VVHung (03/06/2026)
function updateFloatingActionTop() {
  if (!activeActionRowElement.value) return

  const containerRect = activeActionRowElement.value
    .closest('.ms-table-container')
    ?.getBoundingClientRect()
  const rowRect = activeActionRowElement.value.getBoundingClientRect()
  floatingActionTop.value = rowRect.top - (containerRect?.top || 0)
}

/// Hẹn giờ ẩn cụm nút thao tác nổi.
/// CREATED BY: VVHung (03/06/2026)
function scheduleHideRowActions() {
  clearActionHideTimer()
  actionHideTimer.value = window.setTimeout(hideRowActions, 80)
}

/// Xóa bộ đếm thời gian ẩn cụm nút thao tác nổi.
/// CREATED BY: VVHung (03/06/2026)
function clearActionHideTimer() {
  if (!actionHideTimer.value) return
  window.clearTimeout(actionHideTimer.value)
  actionHideTimer.value = null
}

/// Ẩn cụm nút thao tác nổi của dòng dữ liệu.
/// CREATED BY: VVHung (03/06/2026)
function hideRowActions() {
  clearActionHideTimer()
  activeActionRowElement.value?.classList.remove('is-action-hover')
  activeActionRowElement.value = null
  hoveredRow.value = null
}

/// Xử lý sự kiện cuộn bảng và ẩn thao tác nổi.
/// CREATED BY: VVHung (03/06/2026)
function handleTableScroll() {
  if (!hoveredRow.value) return
  updateFloatingActionTop()
}

/// Xử lý thay đổi option của DevExtreme grid.
/// <param name="event">Sự kiện phát sinh từ giao diện.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleOptionChanged(event) {
  if (event.fullName?.includes('.width')) {
    handleColumnWidthChanged(event)
    return
  }

  if (event.fullName?.includes('.visibleIndex')) {
    if (event.fullName?.includes('fixed') || event.fullName?.includes('fixedPosition')) return
    queueColumnOrderPersist(event)
  }
}

/// Xử lý thay đổi độ rộng cột và lưu cấu hình.
/// <param name="event">Sự kiện phát sinh từ giao diện.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleColumnWidthChanged(event) {
  const match = event.fullName.match(/columns\[(\d+)\]\.width/)
  if (!match) return

  const columnIndex = Number(match[1])
  const dataField = event.component.columnOption(columnIndex, 'dataField')
  const column = configColumns.value.find((item) => item.fieldName === dataField)
  if (!column) return

  const nextWidth = Math.max(Number(event.value || column.width), 200)
  if (nextWidth === column.width) return

  column.width = nextWidth
  queueColumnWidthPersist(column, nextWidth)
}

/// Đưa thay đổi độ rộng cột vào hàng đợi lưu cấu hình.
/// <param name="column">Cấu hình cột cần xử lý.</param>
/// <param name="width">Độ rộng cột cần lưu.</param>
/// CREATED BY: VVHung (03/06/2026)
function queueColumnWidthPersist(column, width) {
  pendingResizePersist.value = { column, width }

  if (resizePersistTimer.value) {
    window.clearTimeout(resizePersistTimer.value)
  }

  resizePersistTimer.value = window.setTimeout(() => {
    if (!pendingResizePersist.value) return

    const { column: pendingColumn, width: pendingWidth } = pendingResizePersist.value
    pendingResizePersist.value = null
    resizePersistTimer.value = null
    enqueuePersistColumn(pendingColumn, { Width: pendingWidth })
  }, 350)
}

/// Đưa thay đổi thứ tự cột vào hàng đợi lưu cấu hình.
/// <param name="event">Sự kiện phát sinh từ giao diện.</param>
/// CREATED BY: VVHung (03/06/2026)
function queueColumnOrderPersist(event) {
  if (!isGridReady.value || suppressOrderPersist.value) return
  if (event.fullName?.includes('.fixed') || event.fullName?.includes('.fixedPosition')) return

  if (reorderTimer.value) {
    window.clearTimeout(reorderTimer.value)
  }

  reorderTimer.value = window.setTimeout(() => {
    persistColumnOrder(event.component)
  }, 250)
}

/// Luu thu tu cot hien tai len backend.
/// <param name="component">Instance grid cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function persistColumnOrder(component) {
  if (suppressOrderPersist.value) return

  const orderedColumns = getCurrentOrderedColumns(component).map((column, index) => ({
    column,
    visibleIndex: index,
  }))

  if (!orderedColumns.length) return

  orderedColumns.forEach((item, index) => {
    const nextSortOrder = index + 1
    if (Number(item.column.sortOrder) === nextSortOrder) return
    item.column.sortOrder = nextSortOrder
    enqueuePersistColumn(item.column, { SortOrder: nextSortOrder })
  })

  const changedFixedColumns = syncFixedColumns(orderedColumns.map((item) => item.column))
  changedFixedColumns.forEach((column) => {
    enqueuePersistColumn(column, {
      IsFixed: column.isFixed,
      FixedPosition: column.fixedPosition,
    })
  })
}

/// Mở menu cấu hình ở header cột.
/// <param name="data">Dữ liệu truyền vào hàm.</param>
/// <param name="event">Sự kiện phát sinh từ giao diện.</param>
/// CREATED BY: VVHung (03/06/2026)
function openHeaderMenu(data, event) {
  const column = configColumns.value.find((item) => item.fieldName === data.column.dataField)
  if (!column) return

  const rect = event.currentTarget.getBoundingClientRect()
  headerMenu.fieldName = column.fieldName
  headerMenu.apiFieldName = column.apiFieldName
  headerMenu.apiSortField = column.apiSortField
  headerMenu.left = rect.left
  headerMenu.top = rect.bottom + 4
  headerMenu.isOpen = true
}

/// Áp dụng trạng thái sắp xếp cho cột đang chọn.
/// <param name="nextSort">Trang thai sap xep can ap dung.</param>
/// CREATED BY: VVHung (03/06/2026)
function applySort(nextSort) {
  if (!nextSort) {
    sort.value = ''
    headerMenu.isOpen = false
    return
  }

  const sortField = String(nextSort).replace('-', '')
  if (!DB_SORT_FIELDS.has(sortField)) {
    console.warn(`Field "${sortField}" không có trong database nên không gửi sort lên API.`)
    headerMenu.isOpen = false
    return
  }

  sort.value = nextSort
  headerMenu.isOpen = false
}

/// Lấy chiều sắp xếp đang áp dụng cho header cột.
/// <param name="fieldName">Tên field cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getHeaderSortDirection(fieldName) {
  const column = configColumns.value.find((item) => item.fieldName === fieldName)
  if (!column?.apiSortField || !sort.value) return ''
  if (sort.value === column.apiSortField) return 'asc'
  if (sort.value === `-${column.apiSortField}`) return 'desc'
  return ''
}

/// Kiểm tra cột có đang hiển thị icon ghim hay không.
/// <param name="fieldName">Tên field cần xử lý.</param>
/// <returns>true nếu thỏa điều kiện, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
function isPinnedIconColumn(fieldName) {
  return pinnedIconFields.value.has(fieldName)
}

/// Ghim hoac bo ghim cot dang chon.
/// <param name="fieldName">Tên field cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function togglePin(fieldName) {
  const column = configColumns.value.find((item) => item.fieldName === fieldName)
  if (!column) return

  const orderedColumns = getConfigOrderedVisibleColumns()

  if (isPinnedIconColumn(fieldName)) {
    setPinnedFieldStack(pinnedFieldStack.value.slice(0, -1))

    const changedColumns = syncFixedColumns(orderedColumns)
    changedColumns.forEach((item) => {
      enqueuePersistColumn(item, {
        IsFixed: item.isFixed,
        FixedPosition: item.fixedPosition,
      })
    })
    repaintGrid()
    headerMenu.isOpen = false
    return
  }

  if (getColumnDisplayIndex(fieldName, orderedColumns) > 4) {
    pinDialogVisible.value = true
    headerMenu.isOpen = false
    return
  }

  setPinnedFieldStack([...pinnedFieldStack.value.filter((item) => item !== fieldName), fieldName])

  const changedColumns = syncFixedColumns(orderedColumns)
  const changedColumnIds = new Set(changedColumns.map((item) => item.gridConfigID))
  changedColumns.forEach((item) => {
    enqueuePersistColumn(item, {
      IsFixed: item.isFixed,
      FixedPosition: item.fixedPosition,
    })
  })
  if (!changedColumnIds.has(column.gridConfigID)) {
    enqueuePersistColumn(column, {
      IsFixed: true,
      FixedPosition: 'left',
    })
  }
  repaintGrid()
  headerMenu.isOpen = false
}

/// Đồng bộ trạng thái cột cố định với cấu hình grid.
/// CREATED BY: VVHung (03/06/2026)
function syncFixedColumns(orderedColumns = getCurrentOrderedColumns()) {
  suppressOrderPersist.value = true
  if (suppressOrderPersistTimer) {
    window.clearTimeout(suppressOrderPersistTimer)
  }

  const maxPinnedIndex = orderedColumns.reduce((maxIndex, column, index) => {
    if (!pinnedIconFields.value.has(column.fieldName)) return maxIndex
    return Math.max(maxIndex, index)
  }, -1)

  const changedColumns = []
  configColumns.value.forEach((column) => {
    const columnIndex = orderedColumns.findIndex((item) => item.fieldName === column.fieldName)
    const shouldFixed = maxPinnedIndex >= 0 && columnIndex >= 0 && columnIndex <= maxPinnedIndex
    const nextFixedPosition = shouldFixed ? 'left' : null
    if (column.isFixed !== shouldFixed || column.fixedPosition !== nextFixedPosition) {
      changedColumns.push(column)
    }
    column.isFixed = shouldFixed
    column.fixedPosition = nextFixedPosition
  })

  applyFixedColumnsToGrid(orderedColumns)

  suppressOrderPersistTimer = window.setTimeout(() => {
    suppressOrderPersist.value = false
    suppressOrderPersistTimer = null
  }, 300)

  return changedColumns
}

/// Đồng bộ và lưu lại trạng thái fixed sau khi thứ tự cột thay đổi từ cấu hình.
/// CREATED BY: VVHung (09/06/2026)
function syncAndPersistFixedColumns(orderedColumns = getCurrentOrderedColumns()) {
  const changedColumns = syncFixedColumns(orderedColumns)
  changedColumns.forEach((column) => {
    enqueuePersistColumn(column, {
      IsFixed: column.isFixed,
      FixedPosition: column.fixedPosition,
    })
  })
}

/// Lấy danh sách cột theo đúng thứ tự đang hiển thị trên grid.
/// <param name="gridInstance">Instance grid neu co.</param>
/// <returns>Danh sách cột đang hiển thị theo thứ tự hiện tại.</returns>
/// CREATED BY: VVHung (09/06/2026)
function getCurrentOrderedColumns(gridInstance = null) {
  const rawGridInstance = gridInstance || dataGridRef.value?.instance
  const component = typeof rawGridInstance === 'function' ? rawGridInstance() : rawGridInstance

  if (!component) return displayColumns.value

  const orderedColumns = displayColumns.value
    .map((column) => ({
      column,
      visibleIndex: Number(component.columnOption(column.fieldName, 'visibleIndex')),
    }))
    .filter((item) => Number.isFinite(item.visibleIndex) && item.visibleIndex >= 0)
    .sort((a, b) => a.visibleIndex - b.visibleIndex)
    .map((item) => item.column)

  return orderedColumns.length ? orderedColumns : displayColumns.value
}

/// Lấy danh sách cột visible theo config hiện tại, không phụ thuộc cache visibleIndex của grid.
/// <returns>Danh sach cot visible theo SortOrder hien tai.</returns>
/// CREATED BY: VVHung (09/06/2026)
function getConfigOrderedVisibleColumns() {
  return [...displayColumns.value]
}

/// Lấy vị trí hiển thị hiện tại của cột.
/// <param name="fieldName">Ten field can kiem tra.</param>
/// <returns>Vị trí hiển thị của cột.</returns>
/// CREATED BY: VVHung (09/06/2026)
function getColumnDisplayIndex(fieldName, orderedColumns = getCurrentOrderedColumns()) {
  return orderedColumns.findIndex((column) => column.fieldName === fieldName)
}

/// Đưa thay đổi cấu hình cột vào hàng đợi lưu.
/// <param name="column">Cấu hình cột cần xử lý.</param>
/// <param name="patch">Phần cấu hình cột cần cập nhật.</param>
/// CREATED BY: VVHung (03/06/2026)
function enqueuePersistColumn(column, patch) {
  updateGridConfigCache(column, patch)
  persistQueue = persistQueue.catch(() => {}).then(() => persistColumn(column, patch))

  return persistQueue
}

/// Cập nhật cache cấu hình cột để popup tùy chỉnh cột hiển thị ngay thứ tự mới.
/// <param name="column">Cot can cap nhat.</param>
/// <param name="patch">Phần cấu hình thay đổi.</param>
/// CREATED BY: VVHung (07/06/2026)
function updateGridConfigCache(column, patch = {}) {
  const targetFieldName = column.apiFieldName || column.fieldName
  if (!targetFieldName) return

  queryClient.setQueryData(gridConfigQueryKey.value, (oldData) => {
    const payload = normalizeResponseData(oldData)
    const currentColumns = getGridConfigColumns(payload)
    if (!currentColumns.length) return oldData

    const nextColumns = currentColumns.map((item) => {
      const fieldName = item.fieldName || item.FieldName
      if (fieldName !== targetFieldName) return item

      const nextVisible = patch.Visible ?? patch.visible ?? column.visible
      const nextWidth = patch.Width ?? patch.width ?? column.width
      const nextIsFixed = patch.IsFixed ?? patch.isFixed ?? column.isFixed
      const nextFixedPosition = patch.FixedPosition ?? patch.fixedPosition ?? column.fixedPosition
      const nextSortOrder = patch.SortOrder ?? patch.sortOrder ?? column.sortOrder

      return {
        ...item,
        width: nextWidth,
        Width: nextWidth,
        visible: nextVisible,
        Visible: nextVisible,
        isFixed: nextIsFixed,
        IsFixed: nextIsFixed,
        fixedPosition: nextFixedPosition,
        FixedPosition: nextFixedPosition,
        sortOrder: nextSortOrder,
        SortOrder: nextSortOrder,
      }
    })

    return replaceGridConfigColumns(oldData, nextColumns)
  })
}

/// Lấy mảng cột từ payload cấu hình grid.
/// <param name="payload">Payload cấu hình grid.</param>
/// <returns>Danh sach cot.</returns>
/// CREATED BY: VVHung (07/06/2026)
function getGridConfigColumns(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

/// Thay mang cot vao dung shape response hien tai cua vue-query.
/// <param name="oldData">Dữ liệu cache cũ.</param>
/// <param name="nextColumns">Danh sách cột mới.</param>
/// <returns>Dữ liệu cache mới.</returns>
/// CREATED BY: VVHung (07/06/2026)
function replaceGridConfigColumns(oldData, nextColumns) {
  if (Array.isArray(oldData)) return nextColumns
  if (Array.isArray(oldData?.data)) return { ...oldData, data: nextColumns }
  if (Array.isArray(oldData?.data?.data)) {
    return {
      ...oldData,
      data: {
        ...oldData.data,
        data: nextColumns,
      },
    }
  }

  return oldData
}

/// Lưu cấu hình cột lên backend.
/// <param name="column">Cấu hình cột cần xử lý.</param>
/// <param name="patch">Phần cấu hình cột cần cập nhật.</param>
/// CREATED BY: VVHung (03/06/2026)
function persistColumn(column, patch) {
  if (!column.gridConfigID) return

  return GridConfigAPI.put(column.gridConfigID, {
    GridKey: column.gridKey || props.gridKey,
    FieldName: column.apiFieldName,
    Caption: column.caption,
    Width: column.width,
    Visible: column.visible,
    IsFixed: column.isFixed,
    FixedPosition: column.fixedPosition,
    AllowSorting: column.allowSorting,
    SortOrder: column.sortOrder,
    ...patch,
  }).catch((error) => {
    console.error('Update grid config failed:', error)
  })
}

/// Định dạng giá trị ô trước khi hiển thị.
/// <param name="value">Giá trị cần xử lý.</param>
/// <param name="fieldName">Tên field cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function formatCellValue(value, fieldName = '') {
  if (String(fieldName || '').toLowerCase() === 'normformula') return ''
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  return value
}

/// Kiểm tra field có phải cột trạng thái không.
/// <param name="fieldName">Tên field cần xử lý.</param>
/// <returns>true nếu thỏa điều kiện, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
function isStatusColumn(fieldName) {
  // Bảng salary composition hiện không có cột Status/StatusName trong database.
  // Không tự render badge cho field ảo StatusName để tránh hiển thị sai dữ liệu.
  return ['status'].includes(String(fieldName || '').toLowerCase())
}

/// Lấy giá trị trạng thái của bản ghi.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getStatusValue(row) {
  return row?.status ?? row?.Status ?? row?.statusName ?? row?.StatusName
}

/// Kiểm tra bản ghi đang ở trạng thái theo dõi hay không.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>true nếu thỏa điều kiện, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
function isActiveStatus(row) {
  const value = getStatusValue(row)
  if (typeof value === 'string') return !value.toLowerCase().includes('ngừng')
  return Number(value) === 1
}

/// Lấy nhãn hiển thị trạng thái của bản ghi.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getStatusText(row) {
  return isActiveStatus(row) ? 'Đang theo dõi' : 'Ngừng theo dõi'
}

/// Lấy class CSS hiển thị trạng thái của bản ghi.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function statusClass(row) {
  return [
    'ms-status-badge',
    isActiveStatus(row) ? 'ms-status-badge--success' : 'ms-status-badge--warning',
  ]
}

/// Xử lý click ngoài vùng đang mở để đóng menu nổi.
/// <param name="event">Sự kiện phát sinh từ giao diện.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleDocumentClick(event) {
  if (
    !event.target?.closest?.('.ms-table__menu') &&
    !event.target?.closest?.('.ms-table__header-button')
  ) {
    headerMenu.isOpen = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentClick)
  if (reorderTimer.value) {
    window.clearTimeout(reorderTimer.value)
  }
  if (resizePersistTimer.value) {
    window.clearTimeout(resizePersistTimer.value)
  }
  if (suppressOrderPersistTimer) {
    window.clearTimeout(suppressOrderPersistTimer)
  }
  clearActionHideTimer()
})
</script>

<style>
.ms-table-container {
  position: relative;
  height: 100%;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0 0 8px 8px;
  background: #fff;
}

.ms-table {
  flex: 1;
  min-height: 0;
  font-size: 13px;
  line-height: 18px;
  color: #101828;
  text-align: left;
}

.ms-table .dx-datagrid {
  background: #fff;
}

/* Scrollbar DevExtreme giống ảnh mẫu:
   - track trong suốt
   - thumb 8px
   - hover/active chỉ đổi màu, không phình to
   - scrollbar nằm trên layer riêng, không bị checkbox/cell đè */
.ms-table .dx-scrollable {
  position: relative;
}

.ms-table .dx-scrollable-container {
  overflow: hidden !important;
}

.ms-table .dx-scrollable-scrollbar {
  background: transparent !important;
  opacity: 1 !important;
  z-index: 60 !important;
  transition: none !important;
}

.ms-table .dx-scrollable-scrollbar.dx-state-hover,
.ms-table .dx-scrollable-scrollbar.dx-state-active,
.ms-table .dx-scrollable-scrollbar.dx-scrollable-scrollbar-active {
  opacity: 1 !important;
}

/* Horizontal scrollbar */
.ms-table .dx-scrollable-scrollbar-horizontal,
.ms-table .dx-scrollable-scrollbar-horizontal.dx-state-hover,
.ms-table .dx-scrollable-scrollbar-horizontal.dx-state-active,
.ms-table .dx-scrollable-scrollbar-horizontal.dx-scrollable-scrollbar-active {
  left: 4px !important;
  right: 4px !important;
  bottom: 4px !important;
  height: 4px !important;
  min-height: 4px !important;
  max-height: 4px !important;
}

/* Vertical scrollbar */
.ms-table .dx-scrollable-scrollbar-vertical,
.ms-table .dx-scrollable-scrollbar-vertical.dx-state-hover,
.ms-table .dx-scrollable-scrollbar-vertical.dx-state-active,
.ms-table .dx-scrollable-scrollbar-vertical.dx-scrollable-scrollbar-active {
  top: 4px !important;
  right: 4px !important;
  bottom: 4px !important;
  width: 4px !important;
  min-width: 4px !important;
  max-width: 4px !important;
}

/* Track */
.ms-table .dx-scrollable-scroll {
  background: transparent !important;
  border-radius: 8px !important;
  transition: none !important;
  width: 4px !important;
  height: 4px !important;
}

/* Thumb */
.ms-table .dx-scrollable-scroll-content {
  width: 4px !important;
  height: 4px !important;
  min-width: 4px !important;
  min-height: 4px !important;
  max-width: 4px !important;
  max-height: 4px !important;
  border-radius: 8px !important;
  background: #9e9e9e !important;
  transition: background-color 0.12s ease !important;
}

.ms-table .dx-scrollable-scrollbar-horizontal .dx-scrollable-scroll-content {
  height: 4px !important;
}

.ms-table .dx-scrollable-scrollbar-vertical .dx-scrollable-scroll-content {
  width: 4px !important;
}

.ms-table .dx-scrollable-scrollbar:hover .dx-scrollable-scroll-content,
.ms-table .dx-scrollable-scrollbar.dx-state-hover .dx-scrollable-scroll-content {
  background: #757575 !important;
}

.ms-table .dx-scrollable-scrollbar.dx-state-active .dx-scrollable-scroll-content,
.ms-table .dx-scrollable-scrollbar.dx-scrollable-scrollbar-active .dx-scrollable-scroll-content {
  width: 4px !important;
  height: 4px !important;
  background: #666666 !important;
}

/* Chừa khoảng cho horizontal scrollbar để dòng cuối/checkbox không chạm scrollbar */
.ms-table .dx-datagrid-rowsview {
  padding-bottom: 8px !important;
  box-sizing: border-box;
}

.ms-table .dx-datagrid-rowsview .dx-scrollable-wrapper,
.ms-table .dx-datagrid-rowsview .dx-scrollable-container {
  height: calc(100% - 8px) !important;
}

.ms-table .dx-scrollable-container::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.ms-table .dx-scrollable-container::-webkit-scrollbar-track {
  background: transparent;
}

.ms-table .dx-scrollable-container::-webkit-scrollbar-thumb {
  background: #9e9e9e;
  border-radius: 4px;
}

.ms-table .dx-scrollable-container::-webkit-scrollbar-thumb:hover {
  background: #757575;
}

.ms-table .dx-scrollable-container::-webkit-scrollbar-thumb:active {
  background: #666666;
}

.ms-table .dx-datagrid-content .dx-datagrid-table .dx-row > td,
.ms-table .dx-datagrid-content .dx-datagrid-table .dx-row > tr > td {
  vertical-align: middle !important;
  text-align: left !important;
}

.ms-table .dx-datagrid-header-panel {
  display: none;
}

.ms-table .dx-datagrid-headers {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #f5f5f5;
  border: none !important;
  border-bottom: 1px solid #d5d7da !important;
  box-shadow: none !important;
}

.ms-table .dx-datagrid-headers .dx-datagrid-table,
.ms-table .dx-datagrid-headers .dx-row,
.ms-table .dx-datagrid-headers .dx-row > td {
  border-collapse: separate !important;
  border-spacing: 0 !important;
  border-top: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
}

.ms-table .dx-header-row {
  height: 36px !important;
}

.ms-table .dx-header-row > td {
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 8px !important;
  background: #f5f5f5;
  color: #101828;
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  border-top: none !important;
  border-bottom: none !important;
  border-right: none !important;
  border-left: none !important;
  box-shadow: none !important;
  box-sizing: border-box;
  vertical-align: middle;
  text-align: left !important;
  position: relative;
  overflow: visible;
}

.ms-table .dx-header-row > td::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  width: 1px;
  height: 60%;
  background: #d5d7da;
  border-radius: 1px;
  cursor: ew-resize;
  pointer-events: none;
}

.ms-table .dx-header-row > td:last-child::after,
.ms-table .dx-header-row > td:first-child::after {
  display: none !important;
}

.ms-table .dx-header-row > td:first-child {
  position: sticky !important;
  left: 0 !important;
  z-index: 30 !important;
  width: 50px !important;
  min-width: 50px !important;
  max-width: 50px !important;
  padding: 0 !important;
  text-align: center !important;
  background: #f5f5f5 !important;
}

.ms-table .dx-header-row > td:hover {
  cursor: pointer;
}

.ms-table .dx-datagrid-columns-separator,
.ms-table .dx-datagrid-columns-separator-transparent,
.ms-table .dx-datagrid-tracker {
  cursor: col-resize !important;
}

.ms-table .dx-data-row > td {
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 12px !important;
  border-top: none !important;
  border-bottom: 1px solid #d5d7da;
  border-left: none !important;
  border-right: none !important;
  box-shadow: none !important;
  background: #fff;
  vertical-align: middle;
  text-align: left !important;
}

.ms-table .dx-data-row {
  height: 36px !important;
  position: relative;
}

.ms-table .dx-datagrid-content .dx-datagrid-table .dx-row > td:first-child,
.ms-table .dx-datagrid-content .dx-datagrid-table .dx-row > tr > td:first-child {
  padding: 0 !important;
  text-align: center !important;
  vertical-align: middle !important;
  border-bottom: 1px solid #d5d7da !important;
  background: inherit !important;
  overflow: visible !important;
}

.ms-table .dx-datagrid-headers .dx-header-row > td:first-child {
  border-bottom: none !important;
}

.ms-table .dx-data-row:hover > td,
.ms-table .dx-data-row.is-selected > td,
.ms-table .dx-data-row.is-action-hover > td {
  background: #cdeadf !important;
}

.ms-table .dx-datagrid-content .dx-datagrid-table .dx-row > td:first-child {
  display: table-cell;
  text-align: center !important;
}

.ms-table .dx-datagrid-sticky-column-left,
.ms-table .dx-datagrid-sticky-column-right,
.ms-table .dx-datagrid-sticky-column-border-left,
.ms-table .dx-datagrid-sticky-column-border-right,
.ms-table .dx-datagrid-sticky-column-left::before,
.ms-table .dx-datagrid-sticky-column-right::before,
.ms-table .dx-datagrid-sticky-column-border-left::before,
.ms-table .dx-datagrid-sticky-column-border-right::before,
.ms-table .dx-datagrid-sticky-column-left::after,
.ms-table .dx-datagrid-sticky-column-right::after,
.ms-table .dx-datagrid-sticky-column-border-left::after,
.ms-table .dx-datagrid-sticky-column-border-right::after {
  border-top: none !important;
  border-right: none !important;
  border-left: none !important;
  box-shadow: none !important;
}

.ms-table .dx-datagrid-content .dx-datagrid-table {
  min-width: 100% !important;
}

.ms-table .dx-header-row > td.dx-datagrid-sticky-column-left,
.ms-table .dx-header-row > td.dx-datagrid-sticky-column-right,
.ms-table .dx-header-row > td.dx-datagrid-sticky-column-border-left,
.ms-table .dx-header-row > td.dx-datagrid-sticky-column-border-right {
  position: sticky !important;
  background: #f5f5f5 !important;
  z-index: 35 !important;
  overflow: hidden !important;
}

.ms-table .dx-header-row > td:first-child.dx-datagrid-sticky-column-left,
.ms-table .dx-header-row > td:first-child.dx-datagrid-sticky-column-border-right {
  position: sticky !important;
  left: 0 !important;
  z-index: 35 !important;
  width: 50px !important;
  min-width: 50px !important;
  max-width: 50px !important;
  background: #f5f5f5 !important;
}

.ms-table .dx-data-row:hover > td:first-child,
.ms-table .dx-data-row.is-selected > td:first-child,
.ms-table .dx-data-row.is-action-hover > td:first-child {
  background: #cdeadf !important;
}

.ms-table .dx-data-row:not(:hover):not(.is-selected) > td.dx-datagrid-sticky-column-left,
.ms-table .dx-data-row:not(:hover):not(.is-selected) > td.dx-datagrid-sticky-column-right,
.ms-table .dx-data-row:not(:hover):not(.is-selected) > td.dx-datagrid-sticky-column-border-left,
.ms-table .dx-data-row:not(:hover):not(.is-selected) > td.dx-datagrid-sticky-column-border-right {
  background: #fff !important;
}

.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-left,
.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-right,
.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-border-left,
.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-border-right,
.ms-table .dx-datagrid-headers .dx-datagrid-content-fixed .dx-header-row > td {
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 8px !important;
  background: #f5f5f5 !important;
  border-bottom: none !important;
  box-sizing: border-box !important;
  vertical-align: middle !important;
}

.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-left .ms-table__header-content,
.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-right .ms-table__header-content,
.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-border-left .ms-table__header-content,
.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-border-right .ms-table__header-content,
.ms-table .dx-datagrid-headers .dx-datagrid-content-fixed .ms-table__header-content {
  height: 36px !important;
  min-width: 0;
  overflow: hidden;
}

.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-left .ms-table__header-button,
.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-right .ms-table__header-button,
.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-border-left .ms-table__header-button,
.ms-table .dx-datagrid-headers .dx-datagrid-sticky-column-border-right .ms-table__header-button,
.ms-table .dx-datagrid-headers .dx-datagrid-content-fixed .ms-table__header-button {
  height: 36px !important;
  min-width: 0;
  width: 100%;
}

.ms-table__header-content {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  position: relative;
}

.ms-table__header-button {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  height: 36px;
  padding: 0;
  display: inline-flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.ms-table__header-button:focus,
.ms-table__header-button:active {
  outline: none;
  background: transparent;
}

.ms-table__cell-truncate {
  min-width: 0;
  flex: 1;
  display: block;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #101828;
  text-align: left;
}

.ms-table__cell-truncate--value-formula {
  color: #1570ef;
}

.ms-table__formula-token--parameter {
  color: #1570ef;
}

.ms-table__formula-token--function {
  color: #000;
}

.ms-table__formula-token--operator {
  color: #f04438;
}

.ms-table__action-cell {
  position: absolute;
  top: 50%;
  right: 16px;
  z-index: 25;
  width: 160px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  transform: translateY(-50%);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.ms-table .dx-data-row .ms-table__action-cell {
  display: none !important;
}

.ms-table__floating-actions {
  position: absolute;
  right: 28px;
  z-index: 50;
  width: 160px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  transform: translateY(4px);
  pointer-events: auto;
}

.ms-table .dx-data-row:hover .ms-table__action-cell,
.ms-table .dx-data-row.is-action-hover .ms-table__action-cell {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.ms-table__action-space {
  width: 100%;
  height: 36px;
}

.ms-table__fill-space {
  width: 100%;
  height: 36px;
}

.ms-table__checkbox {
  width: 16px;
  height: 16px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 2px solid #d5d7da;
  border-radius: 4px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
}

.ms-table__checkbox:focus,
.ms-table__checkbox:focus-visible,
.ms-table__checkbox:active {
  outline: none;
  box-shadow: none;
}

.ms-table__checkbox.is-checked,
.ms-table__checkbox.is-indeterminate {
  border-color: #0e9a62;
  background: #0e9a62;
}

.ms-table__check-mark,
.ms-table__minus-mark {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

/* Checkbox column: header fixed và cell không đè scrollbar */
.ms-table .dx-header-row > td:first-child .ms-table__checkbox,
.ms-table .dx-data-row > td:first-child .ms-table__checkbox {
  position: relative;
  z-index: 1;
}

.ms-table .dx-state-focused,
.ms-table .dx-cell-focus-disabled,
.ms-table .dx-focused,
.ms-table .dx-focused > td,
.ms-table .dx-focused > td:first-child {
  outline: none !important;
  box-shadow: none !important;
}

.ms-table .dx-datagrid-focus-overlay {
  display: none !important;
}

.ms-table .dx-row > td.dx-focused,
.ms-table .dx-row > td:focus,
.ms-table .dx-row > td:focus-visible,
.ms-table .dx-cell-focus-disabled:focus,
.ms-table .dx-cell-focus-disabled:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  border-color: #d5d7da !important;
}

/* Toàn bộ text data/header căn trái, riêng checkbox vẫn center */
.ms-table .dx-data-row > td:not(:first-child),
.ms-table .dx-header-row > td:not(:first-child) {
  text-align: left !important;
}

/* Checkbox column ăn màu giống cả dòng khi hover/checked */
.ms-table .dx-data-row > td:first-child,
.ms-table .dx-data-row > td:first-child.dx-datagrid-sticky-column-left,
.ms-table .dx-data-row > td:first-child.dx-datagrid-sticky-column-border-right {
  background: #fff !important;
}

.ms-table .dx-data-row:hover > td:first-child,
.ms-table .dx-data-row.is-selected > td:first-child,
.ms-table .dx-data-row.is-action-hover > td:first-child,
.ms-table .dx-data-row:hover > td:first-child.dx-datagrid-sticky-column-left,
.ms-table .dx-data-row.is-selected > td:first-child.dx-datagrid-sticky-column-left,
.ms-table .dx-data-row.is-action-hover > td:first-child.dx-datagrid-sticky-column-left,
.ms-table .dx-data-row:hover > td:first-child.dx-datagrid-sticky-column-border-right,
.ms-table .dx-data-row.is-selected > td:first-child.dx-datagrid-sticky-column-border-right,
.ms-table .dx-data-row.is-action-hover > td:first-child.dx-datagrid-sticky-column-border-right {
  background: #cdeadf !important;
}

/* Đảm bảo scrollbar nằm trên bảng, checkbox/cell không phủ lên scrollbar */
.ms-table .dx-scrollable-scrollbar-horizontal {
  z-index: 90 !important;
}

.ms-table .dx-datagrid-rowsview .dx-datagrid-content {
  padding-bottom: 0;
}

/* Native scrollbar: tắt hoàn toàn scrollbar custom của DevExtreme. */
.ms-table .dx-scrollable-scrollbar,
.ms-table .dx-scrollable-scroll,
.ms-table .dx-scrollable-scroll-content {
  display: none !important;
}

.ms-table .dx-scrollable-container {
  overflow: auto !important;
}

.ms-table .dx-scrollable-container::-webkit-scrollbar {
  width: initial;
  height: initial;
}

.ms-table .dx-scrollable-container::-webkit-scrollbar-track,
.ms-table .dx-scrollable-container::-webkit-scrollbar-thumb {
  background: initial;
  border-radius: initial;
}

.ms-table .dx-datagrid-rowsview {
  padding-bottom: 0 !important;
}

.ms-table .dx-datagrid-rowsview .dx-scrollable-wrapper,
.ms-table .dx-datagrid-rowsview .dx-scrollable-container {
  height: 100% !important;
}

.ms-table .dx-datagrid-rowsview .dx-scrollable-content {
  padding-bottom: 0 !important;
}

.ms-table .dx-datagrid-headers .dx-header-row > td:first-child,
.ms-table .dx-datagrid-headers .dx-header-row > td:first-child.dx-datagrid-sticky-column-left,
.ms-table
  .dx-datagrid-headers
  .dx-header-row
  > td:first-child.dx-datagrid-sticky-column-border-right {
  background: #f5f5f5 !important;
}

.ms-table .dx-datagrid-headers .dx-header-row > td:first-child,
.ms-table .dx-datagrid-headers .dx-header-row > td:first-child.dx-datagrid-sticky-column-left,
.ms-table
  .dx-datagrid-headers
  .dx-header-row
  > td:first-child.dx-datagrid-sticky-column-border-right {
  border-bottom: none !important;
  box-shadow: none !important;
}

.ms-table .dx-datagrid-content-fixed .dx-header-row > td,
.ms-table .dx-datagrid-content-fixed .dx-data-row > td,
.ms-table .dx-datagrid-content-fixed .dx-row > td {
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  box-shadow: none !important;
}

.ms-table .dx-datagrid-content-fixed .dx-header-row > td {
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 8px !important;
  background: #f5f5f5 !important;
  color: #101828 !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  line-height: 18px !important;
  border-bottom: none !important;
  box-sizing: border-box !important;
}

.ms-table .dx-datagrid-content-fixed .dx-data-row > td {
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 12px !important;
  background: #fff !important;
  color: #001b3d !important;
  vertical-align: middle !important;
  border-bottom: 1px solid #d5d7da !important;
  box-sizing: border-box !important;
}

.ms-table .dx-datagrid-content-fixed .dx-data-row:hover > td,
.ms-table .dx-datagrid-content-fixed .dx-data-row.is-selected > td,
.ms-table .dx-datagrid-content-fixed .dx-data-row.is-action-hover > td {
  background: #cdeadf !important;
}

.ms-table .dx-datagrid-headers .dx-datagrid-content-fixed,
.ms-table .dx-datagrid-headers .dx-datagrid-content-fixed .dx-datagrid-table {
  background: #f5f5f5 !important;
}

.ms-table .dx-datagrid-headers .dx-datagrid-content-fixed {
  position: sticky !important;
  top: 0 !important;
  z-index: 40 !important;
}

.ms-table .dx-freespace-row,
.ms-table .dx-freespace-row > td {
  display: none !important;
}

.button-command-wrap {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.button-command-wrap:hover {
  background: #e9eaeb;
}

.ms-table__menu {
  position: fixed;
  z-index: 100;
  width: 200px;
  padding: 8px 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px #0000001f;
}

.ms-menu-item {
  width: 100%;
  height: 32px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  background: #fff;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
  text-align: left;
  cursor: pointer;
}

.ms-menu-item:hover {
  background: #e9eaeb;
}

.ms-menu-item .ms-icon-check1 {
  margin-left: auto;
}

.ms-status-badge {
  min-height: 24px;
  padding: 2px 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  border: 1px solid currentColor;
  font-size: 13px;
  line-height: 18px;
  box-sizing: border-box;
  max-width: 100%;
}

.ms-status-badge--success {
  color: #0e9a62;
  background: #edfcf4;
  border-color: #75e0ac;
}

.ms-status-badge--warning {
  color: #dc6803;
  background: #fff8eb;
  border-color: #fedf89;
}

.ms-status-badge__dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.ms-table__pagination {
  flex-shrink: 0;
}

.ms-table__empty-state {
  position: absolute;
  top: 36px;
  right: 0;
  bottom: 48px;
  left: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.ms-table__empty-text {
  margin-top: 16px;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
}

.ms-table .dx-datagrid-nodata {
  display: none !important;
}

.ms-table-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #00000066;
}

.ms-table-dialog {
  position: relative;
  width: 540px;
  padding: 28px 30px 26px;
  border-radius: 12px;
  background: #fff;
  color: #101828;
  box-shadow: 0 16px 40px #0000002e;
}

.ms-table-dialog h3 {
  margin: 0 0 16px;
  font-size: 20px;
  line-height: 28px;
}

.ms-table-dialog p {
  margin: 0 0 16px;
  font-size: 16px;
  line-height: 24px;
}

.ms-table-dialog__close {
  position: absolute;
  top: 24px;
  right: 24px;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 18px;
  cursor: pointer;
}

.ms-table-dialog__button {
  min-width: 104px;
  height: 40px;
  float: right;
  border: 1px solid #0e9a62;
  border-radius: 10px;
  background: #0e9a62;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.dx-datagrid-drag-header:not(.dx-sortable-dragging):not(.dx-sortable-clone) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

.dx-sortable-dragging.dx-sortable-clone,
.dx-datagrid-drag-header.dx-sortable-dragging {
  height: 36px !important;
  padding: 0 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  border: none !important;
  background: #fff !important;
  color: #101828 !important;
  font-size: 13px !important;
  line-height: 18px !important;
  font-weight: 600 !important;
  opacity: 0.75 !important;
  box-shadow: 0 2px 8px #0000001f !important;
}

.dx-datagrid-columns-separator,
.dx-datagrid-columns-separator-transparent,
.dx-datagrid-tracker {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.dx-context-menu.dx-datagrid,
.dx-datagrid .dx-context-menu {
  display: none !important;
}

.ms-icon-circle-off {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background-image: url('../assets/images/CircleOff.svg');
  background-size: contain;
}

.ms-icon-arrow-up {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background-image: url('../assets/images/ArrowUp.svg');
  background-size: contain;
}

.ms-icon-arrow-down {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background-image: url('../assets/images/ArrowDown.svg');
  background-size: contain;
}

.ms-icon-sort-asc,
.ms-icon-sort-desc {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  background-color: #6e737a;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.ms-icon-sort-asc {
  -webkit-mask-image: url('../assets/images/ArrowUp.svg');
  mask-image: url('../assets/images/ArrowUp.svg');
}

.ms-icon-sort-desc {
  -webkit-mask-image: url('../assets/images/ArrowDown.svg');
  mask-image: url('../assets/images/ArrowDown.svg');
}

.ms-icon-pinned {
  width: 16px;
  height: 16px;
  background-image: url('../assets/images/Pinned.svg');
  background-size: contain;
  flex-shrink: 0;
}

.ms-icon-unpinned {
  width: 16px;
  height: 16px;
  background-image: url('../assets/images/UnPhinned.svg');
  background-size: contain;
  flex-shrink: 0;
}

.ms-icon-check1 {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: #717680;
  -webkit-mask-image: url('../assets/images/ICON_5.svg');
  -webkit-mask-position: -576px -144px;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 1128px 744px;
  flex-shrink: 0;
  background-image: none;
}

.ms-circle-check-green {
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -141px -41px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: #25b973 !important;
}

.ms-circle-orange {
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -180px -40px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: #f90 !important;
}

.ms-pencil {
  width: 15px;
  height: 15px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -82px -3px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: #6e737a;
}

.ms-copy {
  width: 22px;
  height: 18px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -100px 0;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: #6e737a;
}

.ms-trash-red {
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -100px -21px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: #ff6161;
}

.ms-empty {
  display: inline-block;
  background-image: url('../assets/images/Empty.svg');
  background-repeat: no-repeat;
  width: 195px;
  height: 133px;
  background-position: -152px -3046px;
}

.mi-plus-primary {
  width: 20px;
  height: 20px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -240px 0px;
  -webkit-mask-repeat: no-repeat;
  background-color: #0e9a62;
}

.ms-table__loading-overlay {
  position: absolute;
  inset: 36px 0 48px;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.55);
  pointer-events: none;
}

.ms-loading {
  width: 26px;
  height: 26px;
  animation: spin 1s linear infinite;
  background-image: url('../assets/images/Loading.svg');
  background-size: contain;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
