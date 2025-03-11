import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { userLogout } from "../store/reducer.js";
import { persistor } from "../store/store.js";
import { useSocket } from "../socket.jsx";
function SignOut() {
  const navigate = useNavigate();
  let dispatch = useDispatch();
  let socket = useSocket();

  // const apiUrl= import.meta.env.VITE_API_URL;
  useEffect(() => {
    let signout = async () => {
      try {
        console.log("clicked");

        const response = await axios.post(
          `https://whisperia-backened-production.up.railway.app/user/sign-out`,
          {},
          {
            withCredentials: true, // Include credentials (cookies) with the request
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Signed out successfully:", response.data);
        persistor.purge();
        dispatch(userLogout());
        if (socket) {
          socket.disconnect(); 
          console.log("Socket disconnected on logout");
        }
       
      } catch (error) {
        console.error("Error submitting form in logout:", error);
        dispatch(userLogout());
        console.log("error");
        if (socket) {
          socket.disconnect(); 
          console.log("Socket disconnected on logout");
        }
      } finally {
        navigate("/sign-in");
       
      }
    };
    signout();
  }, []);
  return <></>;
}

export default SignOut;
