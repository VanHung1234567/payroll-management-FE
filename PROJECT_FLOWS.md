# Project flows

Tài liệu này tóm tắt các luồng chính trong project FresherMisaFe để dễ đọc code và sửa tiếp.

## 1. Entry point

- `src/main.js` tạo Vue app.
- Cài plugin theo thứ tự:
  - `VueQueryPlugin` dùng chung `QueryClient` cho toàn bộ API query/mutation.
  - `Pinia` dùng store local.
  - `router` từ `src/router/RouterConfig.js`.
- `src/App.vue` chỉ render `<router-view />`.

## 2. Router và layout

- Router chính nằm ở `src/router/RouterConfig.js`.
- Route `/` dùng `MainLayout` rồi redirect sang `/salarycomposition`.
- Các route con:
  - `/salarycomposition`: màn hình danh sách thành phần lương.
  - `/system-category`: danh mục thành phần lương hệ thống.
  - `/dashboard`: tổng quan.
  - `/salarytemplate`: mẫu bảng lương.
- `MainLayout.vue` dựng `MsHeader`, `MsSidebar`, sau đó render page con trong `.main-content`.

## 3. API layer

- `src/apis/config/APIConfig.js` tạo axios instance với base URL `https://localhost:7291/api/`.
- `BaseAPI.js` định nghĩa CRUD cơ bản:
  - `getAll()`
  - `paging(payload)`
  - `filter(payload)`
  - `post(body)`
  - `put(id, body)`
  - `delete(id)`
- API theo module kế thừa `BaseAPI` và set `controller`.
- `SalaryCompositionAPI.js` có thêm:
  - `enum()`
  - `detail(id)`
  - `updateBulkStatus(payload)`
  - `bulkDelete(payload)`
  - `copyFromSystem(payload)`

## 4. GridTable flow

`GridTable.vue` là component trung tâm cho bảng dữ liệu.

- Nhận `gridKey` để lưu state paging/search trong Pinia/localStorage.
- Nhận `configGridKey` để lấy config cột từ API grid config. Nếu không truyền thì dùng `gridKey`.
- Nhận `dataApi` để gọi API dữ liệu. API cần có `paging(payload)` và có thể có `filter(payload)`.
- Query config cột bằng `GridConfigAPI.getGridKey(...)`.
- Query dữ liệu bằng Vue Query:
  - Nếu có filter active và API có `filter`, gọi `filter(payload)`.
  - Ngược lại gọi `paging(payload)`.
- `pageIndex`, `pageSize`, `search` được giữ trong `gridTableStore`.
- Selection:
  - Checkbox row lưu trong `selectedKeys` và `selectedRowMap`.
  - Emit `selection-change` và `update:selectedRows`.
  - Parent clear selection bằng cách tăng `clearSelectionSignal`.
- Row actions:
  - `row-active`: đổi trạng thái.
  - `row-add`: đưa item system vào danh sách sử dụng.
  - `row-copy`: nhân bản.
  - `row-edit`: sửa.
  - `row-delete`: xóa.
- Ghim cột:
  - Header menu của cột có action `Ghim cột` / `Bỏ ghim cột`.
  - `pinnedIconFields` giữ cột mốc đang ghim.
  - `syncFixedColumns()` fixed toàn bộ cột từ đầu tới cột mốc ghim.
  - `GridConfigAPI.put(...)` lưu lại `IsFixed`, `FixedPosition`, `SortOrder`, `Width`.

## 5. Trang SalaryComposition

File: `src/views/salaryComposition/SalaryComposition.vue`.

Luồng chính:

- Hiển thị `GridOptions` gồm search, filter trạng thái, filter đơn vị.
- Hiển thị `GridTable` dữ liệu thành phần lương.
- Khi search, debounce 300ms rồi truyền `debouncedSearchKeyword` vào grid.
- Khi filter trạng thái/đơn vị, build `salaryCompositionFilters` và truyền vào grid.
- Khi chọn checkbox:
  - `selectedRows` nhận từ `GridTable`.
  - Toolbar chuyển sang bulk mode.
  - Hiện `Đã chọn`, `Bỏ chọn`, action theo trạng thái item.
- Action từng dòng:
  - Edit: mở `FormSalaryComposition` mode edit.
  - Copy: mở `FormSalaryComposition` mode duplicate.
  - Active: mở modal xác nhận đổi trạng thái.
  - Delete: nếu là dữ liệu mặc định thì chặn, nếu không thì mở modal xóa.
- Bulk action:
  - Đổi trạng thái nhiều item bằng `SalaryCompositionAPI.updateBulkStatus`.
  - Xóa nhiều item bằng `SalaryCompositionAPI.bulkDelete`; item mặc định bị chặn.
- Nút `Thêm` mở form tạo mới.
- Chevron cạnh `Thêm` mở popup chọn từ danh mục hệ thống.
- Popup hệ thống reuse `GridTable` với:
  - `grid-key="salary_composition_system_picker"`
  - `config-grid-key="salary_composition_system"`
  - API `SalaryCompositionSystemAPI`
- Confirm trong popup hiện tại mới đóng popup; logic insert thật nằm ở trang system bằng endpoint `copy-from-system`.

## 6. FormSalaryComposition flow

File: `src/views/salaryComposition/FormSalaryComposition.vue`.

- Nhận props:
  - `mode`: add/edit/duplicate.
  - `salaryCompositionId`: id cần sửa/nhân bản.
  - `initialTitle`: title ban đầu hiển thị khi sửa/xóa.
- Query dữ liệu phụ:
  - organization
  - enum
  - salary composition type
  - salary composition parameters
  - detail nếu có id
- Validate bằng schema trong `src/validations/salaryCompositionSchema.js`.
- Submit:
  - Add gọi `SalaryCompositionAPI.post(payload)`.
  - Edit gọi `SalaryCompositionAPI.put(id, payload)`.
  - Sau success invalidate Vue Query và emit `saved`.
- Form có guard dirty:
  - Nếu bấm back khi form thay đổi thì mở modal xác nhận thoát.
- Các phần điều kiện:
  - Loại thành phần quyết định nature/value type.
  - Nature thu nhập/khấu trừ quyết định hiển thị định mức.
  - Value formula dùng `MsFormula`.

## 7. Trang SalaryCompositionSystem

File: `src/views/salaryCompositionSystem/SalarycompositionSystem.vue`.

- Hiển thị danh mục hệ thống với `GridTable`.
- Search debounce 300ms.
- Filter loại thành phần bằng `salaryCompositionSystemFilters`.
- Grid truyền `show-add-action=true`, các action sửa/xóa/copy/status tắt.
- Khi chọn checkbox:
  - Hiện bulk toolbar `Đã chọn`, `Bỏ chọn`, `Đưa vào danh sách sử dụng`.
- Khi bấm bulk button hoặc icon plus từng dòng:
  - Mở `MsModal` xác nhận.
  - Confirm gọi `SalaryCompositionAPI.copyFromSystem({ salaryCompositionSystemIDs })`.
  - Thành công invalidate queries, clear selection và hiện `MsToast` "Thêm thành công".

## 8. Component reusable

- `MsButton`: button có style truyền bằng props CSS.
- `MsTooltip`: bọc icon/action để có hover circle và tooltip bubble.
- `MsInput`: input có label, prefix/suffix slot, error message.
- `MsSelect`: combobox/dropdown đơn, hỗ trợ searchable, form/filter variant.
- `MsTreeSelect`: tree multi-select cho đơn vị.
- `MsModal`: modal confirm dùng Teleport.
- `MsToast`: toast thông báo dùng Teleport.
- `GridOptions`: toolbar search/filter/bulk action phía trên grid.
- `GridTable`: bảng DevExtreme, fetch data/config, paging, checkbox, row action, pin column.
- `MsPagination`: paging footer của grid.
- `MsFormula`: nhập công thức, gợi ý hàm và tham số.

## 9. Quy ước khi sửa tiếp

- Nếu sửa dữ liệu grid, kiểm tra `GridTable.vue` trước vì nhiều màn hình reuse.
- Nếu thêm filter mới, build filter object ở page rồi truyền vào `GridTable :filters`.
- Nếu thêm action row mới, thêm prop show action trong `GridTable`, emit event ra page, xử lý API ở page.
- Nếu gọi API thay đổi dữ liệu, dùng `useMutation`, sau success gọi `queryClient.invalidateQueries()`.
- Nếu cần reset checkbox từ page, tăng `clearSelectionSignal`.
- Nếu thêm route mới, cập nhật `path.js`, `RouterConfig.js`, và sidebar nếu cần menu.
