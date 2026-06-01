import BaseAPI from '@/apis/base/BaseAPI.js'
import api from '@/apis/config/APIConfig.js'

class SalaryCompositionAPI extends BaseAPI {
  constructor() {
    super()
    this.controller = 'SalaryComposition'
  }

  enum() {
    return api.get(`${this.controller}/enum`)
  }

  detail(id) {
    return api.get(`${this.controller}/detail/${id}`)
  }

  updateBulkStatus(payload) {
    return api.patch(`${this.controller}/update-bulk-status`, payload)
  }

  bulkDelete(payload) {
    return api.post(`${this.controller}/bulk-delete`, payload)
  }
}

export default new SalaryCompositionAPI()
