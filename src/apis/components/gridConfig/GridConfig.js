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

  saveConfig(payload) {
    return api.post(`${this.controller}/save-config`, payload)
  }
}

export default new GRIDCONFIGAPI()
