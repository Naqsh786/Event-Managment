import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../Features/Userslice.js'
import adminReducer from '../Features/Adminslice.js'
import contactReducer from '../Features/Contactslice.js'
import categoryReducer from '../Features/Categoryslice.js'
import slideReducer from '../Features/Slideslice.js'
import eventReducer from '../Features/EventSlice.js'
import chatReducer from '../Features/Chatslice.js'

export const store = configureStore({
  reducer: {
    user: userReducer,
    admin: adminReducer,
    contact: contactReducer,
    category: categoryReducer,
    slide: slideReducer,
    events: eventReducer,
    chat: chatReducer,
  },
})
