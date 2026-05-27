/**
 * SalaryComposition Model
 * Định nghĩa cấu trúc dữ liệu cho thành phần lương
 */
export class SalaryCompositionModel {
  constructor(data = {}) {
    this.salaryCompositionID = data.salaryCompositionID || null

    this.salaryCompositionCode = data.salaryCompositionCode || ''

    this.salaryCompositionName = data.salaryCompositionName || ''

    this.organizationID = data.organizationID || null

    this.organizationName = data.organizationName || ''

    this.salaryCompositionTypeID = data.salaryCompositionTypeID || null

    this.typeName = data.typeName || ''

    this.nature = data.nature || null

    this.taxType = data.taxType || null

    this.isTaxReduction = data.isTaxReduction || false

    this.normFormula = data.normFormula || ''

    this.allowOverNorm = data.allowOverNorm || false

    this.valueType = data.valueType || null

    this.valueFormula = data.valueFormula || ''

    this.description = data.description || ''

    this.payslipDisplayType = data.payslipDisplayType || null

    this.createdSource = data.createdSource || null

    this.status = data.status || 1

    this.createdDate = data.createdDate || null
  }
}
