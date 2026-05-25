import BaseAPI from '@/apis/base/BaseAPI.js'

class OrganizationAPI extends BaseAPI {
  constructor() {
    super()
    this.controller = 'Crganization'
  }
}

export default new OrganizationAPI()
