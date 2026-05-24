import api from '@/apis/config/APIConfig.js';

export default class BaseAPI {
    constructor() {
        this.controler = null;
    }
    /**
     * Phương thức lấy tất cả dữ liệu
     */
    getAll() {
        return api.get(`${this.controler}`);
    }
    /**
     * Hàm lấy dữ liệu phân trang
     * @param {*} payload 
     */
    paging(payload) {
        return api.post(`${this.controler}/paging`, payload);
    }
    /**
     * Hàm cập nhật dữ liệu
     * @param {*} id 
     * @param {*} body 
     */
    update(id, body) {
        return api.update(`${this.controler}/update/${id}`, body);
    }
    /**
     * Hàm xóa bản ghi
     * @param {*} id 
     */
    delete(id) {
        return api.delete(`${this.controler}/delete/${id}`);
    }
}