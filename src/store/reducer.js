import { createSlice } from "@reduxjs/toolkit";
let initialState = {
    currentUser: null,
    login: false ,
    chatId :null
}
export const Slice = createSlice({
    name: 'authentication',
    initialState,
    reducers: {
        userState: (state, action) => {
            console.log("Before Update:", state.currentUser);
            state.currentUser = action.payload; // ✅ Correctly updates the state
            console.log("After Update:", state.currentUser);
        },
        userLogout: (state,action) => {
            state.currentUser = null;
            state.login = false;
            state.chatId=null;
            // return initialState;
        },
        userId:(state,action)=>{
           state.chatId =action.payload;
        },
        userLogin: (state,action) => {
            state.login = true
        }
    }

})
export const { userState, userLogout, userLogin,userId } = Slice.actions;
export default Slice.reducer