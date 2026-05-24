/**
 * Employee Model
 * Định nghĩa cấu trúc dữ liệu cho nhân viên
 */
export class EmployeeModel {
  constructor(data = {}) {
    this.Id = data.Id || null;
    this.Name = data.Name || '';
    this.BirthDate = data.BirthDate || '';
    this.Amount = data.Amount || 0;
    this.IsUser = data.IsUser || false;
  }
}