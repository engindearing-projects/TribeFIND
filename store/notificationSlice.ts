import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface NotificationState {
  pushToken: string | null
  tokenRegistered: boolean
  permissionStatus: 'undetermined' | 'granted' | 'denied'
}

const initialState: NotificationState = {
  pushToken: null,
  tokenRegistered: false,
  permissionStatus: 'undetermined',
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setPushToken: (state, action: PayloadAction<string | null>) => {
      state.pushToken = action.payload
    },
    setTokenRegistered: (state, action: PayloadAction<boolean>) => {
      state.tokenRegistered = action.payload
    },
    setPermissionStatus: (state, action: PayloadAction<NotificationState['permissionStatus']>) => {
      state.permissionStatus = action.payload
    },
    clearNotificationState: (state) => {
      state.pushToken = null
      state.tokenRegistered = false
      state.permissionStatus = 'undetermined'
    },
  },
})

export const {
  setPushToken,
  setTokenRegistered,
  setPermissionStatus,
  clearNotificationState,
} = notificationSlice.actions

export default notificationSlice.reducer
