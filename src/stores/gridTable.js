import { reactive } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'ms-grid-table-state'

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeStorage(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const useGridTableStore = defineStore('gridTable', () => {
  const gridStates = reactive(readStorage())

  function ensureGridState(gridKey, defaults = {}) {
    if (!gridStates[gridKey]) {
      gridStates[gridKey] = {
        pageIndex: defaults.pageIndex || 1,
        pageSize: defaults.pageSize || 15,
        search: defaults.search || '',
        searchFields: defaults.searchFields || '',
      }
      writeStorage(gridStates)
    }

    return gridStates[gridKey]
  }

  function patchGridState(gridKey, patch) {
    Object.assign(ensureGridState(gridKey), patch)
    writeStorage(gridStates)
  }

  function setPageIndex(gridKey, pageIndex) {
    patchGridState(gridKey, { pageIndex })
  }

  function setPageSize(gridKey, pageSize) {
    patchGridState(gridKey, {
      pageSize,
      pageIndex: 1,
    })
  }

  function setSearch(gridKey, search, searchFields = '') {
    patchGridState(gridKey, {
      search,
      searchFields,
      pageIndex: 1,
    })
  }

  return {
    gridStates,
    ensureGridState,
    patchGridState,
    setPageIndex,
    setPageSize,
    setSearch,
  }
})
