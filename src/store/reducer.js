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
            console.log(state,"state");
            state.user.currentUser = action.payload;
            console.log(state,"state");
        },
        userLogout: (state,action) => {
            // state.currentUser = null;
            // state.login = false;
            // state.chatId=null;
            return initialState;
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