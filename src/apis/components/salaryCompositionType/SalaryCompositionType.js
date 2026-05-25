import BaseAPI from '@/apis/base/BaseAPI.js'

class SalaryCompositionTypeAPI extends BaseAPI {
  constructor() {
    super()
    this.controller = 'SalaryCompositionType'
  }
}

export default new SalaryCompositionTypeAPI()
