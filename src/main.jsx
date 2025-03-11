
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { Provider, useSelector } from "react-redux";
import { persistor, store } from "./store/store.js";
import { SocketProvider } from "./socket.jsx";
import GroupChatInfo from "./pages/GroupChatInfo.jsx";

// Lazy loaded components
const Home = lazy(() => import("./pages/Home.jsx"));
const SignIn = lazy(() => import("./pages/SignIn.jsx"));
const SignUp = lazy(() => import("./pages/SignUp.jsx"));
const Chats = lazy(() => import("./pages/Chats.jsx"));
const GroupChat = lazy(() => import("./pages/GroupChat.jsx"));
const SignOut = lazy(() => import("./pages/SignOut.jsx"));
const Friends = lazy(() => import("./components/Friends.jsx"));
const Profile =lazy(() => import("./components/Profile.jsx"))
// Component to handle socket authentication
const AppWrapper = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.login);

  return <SocketProvider isAuthenticated={isAuthenticated}>{children}</SocketProvider>;
};

// Render App
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <HelmetProvider>
        <CssBaseline />
        <BrowserRouter>
          <AppWrapper>
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-screen bg-purple-200">
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 border-4 border-purple-800 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              }
            >
              <Home>
                <Routes>
                  <Route path="/" element={<SignIn />} />
                  <Route path="sign-up" element={<SignUp />} />
                  <Route path="friends" element={<Friends />} />
                  <Route path="sign-in" element={<SignIn />} />
                  <Route path="sign-out" element={<SignOut />} />
                  <Route path="chats/:id" element={<Chats />} />
                  <Route path="group-chat" element={<GroupChat />} />
                  <Route path="group-chat/:id" element={<GroupChatInfo />} />
                  <Route path="profile" element={<Profile/>} />

                </Routes>
              </Home>
            </Suspense>
          </AppWrapper>
        </BrowserRouter>
        <Toaster />
      </HelmetProvider>
    </PersistGate>
  </Provider>
);
