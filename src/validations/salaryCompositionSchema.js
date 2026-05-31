import * as yup from 'yup'

export const candidateSchema = (candidates = [], currentId = null) =>
  yup.object({
    name: yup.string().required('Nhập họ tên'),

    phoneNumber: yup
      .string()
      .matches(/^(03|09)[0-9]{8}$/, 'SĐT không hợp lệ')
      .required('Nhập số điện thoại')
      .test('duplicate-phone', 'SĐT đã tồn tại', function (value) {
        if (!value) return true

        if (!value.startsWith('03')) {
          return true
        }

        return !candidates.some((item) => item.phoneNumber === value && item.id !== currentId)
      }),

    email: yup.string().email('Email sai định dạng').required('Nhập email'),

    dateOfBirth: yup.string().required('Chọn ngày sinh'),

    gender: yup.string().required('Chọn giới tính'),
  })

export const candidateDefaultValues = {
  name: '',
  phoneNumber: '',
  email: '',
  gender: '',
  dateOfBirth: '',
}
