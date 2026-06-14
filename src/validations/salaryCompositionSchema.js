import * as yup from 'yup'

const REQUIRED_MESSAGE = 'Không được để trống.'
const MAX_LENGTH_MESSAGE = 'Không được vượt quá 255 ký tự.'

const normalizeCode = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

export const salaryCompositionSchema = (salaryCompositions = [], currentId = null) =>
  yup.object({
    salaryCompositionName: yup
      .string()
      .trim()
      .required(REQUIRED_MESSAGE)
      .max(255, MAX_LENGTH_MESSAGE),

    salaryCompositionCode: yup
      .string()
      .trim()
      .required(REQUIRED_MESSAGE)
      .max(255, MAX_LENGTH_MESSAGE)
      .test('not-number', 'Mã thành phần phải khác một số thực', (value) => {
        if (!value) return true
        return !/^[+-]?(?:\d+|\d+\.\d+|\.\d+)$/.test(String(value).trim())
      })
      .test('unique-code', 'Mã thành phần đã tồn tại.', (value) => {
        if (!value) return true
        const normalizedValue = normalizeCode(value)

        return !salaryCompositions.some((item) => {
          const itemId = item?.salaryCompositionID
          if (currentId !== null && currentId !== undefined && itemId === currentId) return false
          return normalizeCode(item?.salaryCompositionCode) === normalizedValue
        })
      }),

    salaryCompositionType: yup.mixed().required(REQUIRED_MESSAGE),

    nature: yup.mixed().required(REQUIRED_MESSAGE),

    organizationIDs: yup.array().min(1, REQUIRED_MESSAGE).required(REQUIRED_MESSAGE),
  })

export const salaryCompositionDefaultValues = {
  salaryCompositionName: '',
  salaryCompositionCode: '',
  salaryCompositionType: null,
  nature: null,
  organizationIDs: [],
}
