import { configureStore } from '@reduxjs/toolkit'
import mapReducer from "../redux/features/currentMap"

export default configureStore({
  reducer: {
    map: mapReducer
  },
})
