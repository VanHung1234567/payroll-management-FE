import BaseAPI from '@/apis/base/BaseAPI.js'

class OrganizationAPI extends BaseAPI {
  constructor() {
    super()
    this.controller = 'Organization'
  }
}

export default new OrganizationAPI()
