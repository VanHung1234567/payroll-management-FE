import BaseAPI from '@/apis/base/BaseAPI.js'
import api from '@/apis/config/APIConfig'

class GRIDCONFIGAPI extends BaseAPI {
  constructor() {
    super()
    this.controller = 'GridConfig'
  }

  getGridKey(gridKey) {
    return api.get(`${this.controller}/GridKey/${gridKey}`)
  }
}

export default new GRIDCONFIGAPI()
