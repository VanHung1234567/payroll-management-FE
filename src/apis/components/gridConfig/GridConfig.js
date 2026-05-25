import BaseAPI from '@/apis/base/BaseAPI.js'

class GRIDCONFIGAPI extends BaseAPI {
  constructor() {
    super()
    this.controller = 'GridConfig'
  }
}

export default new GRIDCONFIGAPI()
