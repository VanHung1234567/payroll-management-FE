import BaseAPI from '@/apis/base/BaseAPI.js'

class SalaryCompositionAPI extends BaseAPI {
  constructor() {
    super()
    this.controller = 'SalaryComposition'
  }
}

export default new SalaryCompositionAPI()
