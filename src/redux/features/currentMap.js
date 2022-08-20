import {createSlice} from '@reduxjs/toolkit'

export const mapSlice = createSlice({
  name: 'map',
  initialState: {
    foundCountries: null,
    countries: null,
    score: 0,
  },
  reducers: {
    clearFoundCountries: state => {
      state.foundCountries = null
    },
    removeCountry: (state, action) => {
      const countryToRemove = state.countries.find(c => c.name.toLowerCase() === action.payload.toLowerCase())

      state.countries = state.countries.filter(c =>
        c.name !== countryToRemove.name
      )
      state.foundCountries = state.foundCountries
        ? [...state.foundCountries, countryToRemove.name]
        : [countryToRemove.name]
    },
    setCountries: (state, action) => {
      state.countries = action.payload
    }
  },
})

export const {clearFoundCountries, removeCountry, setCountries} = mapSlice.actions
export default mapSlice.reducer
