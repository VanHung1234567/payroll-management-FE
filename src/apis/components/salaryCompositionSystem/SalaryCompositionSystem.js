import BaseAPI from '@/apis/base/BaseAPI.js'

class SalaryCompositionSystemAPI extends BaseAPI {
  constructor() {
    super()
    this.controller = 'SalaryCompositionSystem'
  }
}

export default new SalaryCompositionSystemAPI()
