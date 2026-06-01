/**
 * SalaryComposition Model
 * Định nghĩa cấu trúc dữ liệu cho thành phần lương
 */
export class SalaryCompositionModel {
  constructor(data = {}) {
    this.salaryCompositionID = data.salaryCompositionID || null

    this.salaryCompositionCode = data.salaryCompositionCode || ''

    this.salaryCompositionName = data.salaryCompositionName || ''

    this.organizationIDs = data.organizationIDs || ''

    this.organizationNames = data.organizationNames || ''

    this.salaryCompositionTypeID = data.salaryCompositionTypeID || null

    this.typeName = data.typeName || ''

    /**
     * Tính chất thành phần
     * Giá trị:
     * 1 - Thu nhập
     * 2 - Khấu trừ
     * 3 - Khác
     */
    this.nature = data.nature || null

    /**
     * Loại thuế
     * Giá trị:
     * 1 - Chịu thuế
     * 2 - Miễn thuế toàn phần
     * 3 - Miễn thuế một phần
     */
    this.taxType = data.taxType || null

    /**
     * Có được giảm trừ thuế không
     * Giá trị:
     * true  - Có giảm trừ
     * false - Không giảm trừ
     */
    this.isTaxReduction = data.isTaxReduction || null

    /**
     * Công thức định mức
     * Ví dụ:
     * - LUONG_CO_BAN * 0.1
     * - KPI > 100
     */
    this.normFormula = data.normFormula || ''

    /**
     * Có cho phép vượt định mức không
     * Giá trị:
     * true  - Cho phép
     * false - Không cho phép
     */
    this.allowOverNorm = data.allowOverNorm || false

    /**
     * Kiểu giá trị
     * Giá trị:
     * 1 - Số
     * 2 - Tiền tệ
     * 3 - Phần trăm
     * 4 - Chữ
     * 5 - Ngày
     */
    this.valueType = data.valueType || 2

    /**
     * Giá trị hoặc công thức
     * Ví dụ:
     * - 5000000
     * - 10%
     * - =LUONG_CB*0.08
     */
    this.valueFormula = data.valueFormula || ''

    this.description = data.description || ''

    /**
     * Kiểu hiển thị trên phiếu lương
     * Giá trị:
     * 1 - Có hiển thị
     * 2 - Không hiển thị
     * 3 - Chỉ hiển thị nếu giá trị khác 0
     */
    this.payslipDisplayType = data.payslipDisplayType || 1

    /**
     * Nguồn tạo dữ liệu
     * Ví dụ:
     * 1 - Tự thêm
     * 2 - Mặc định
     */
    this.createdSource = data.createdSource || 1

    /**
     * Trạng thái
     * Giá trị:
     * 1 - Đang theo dõi
     * 0 - Ngừng theo dõi
     */
    this.status = data.status || 1
  }
}
