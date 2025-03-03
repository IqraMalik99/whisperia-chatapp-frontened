import { useEffect, useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';
import AddFriend from './AddFriend.jsx';
import GroupDialouge from './GroupDialouge.jsx';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Search from './Search.jsx';
import Notification from './Notification.jsx';
import ChatIcon from '@mui/icons-material/Chat'; // Added Chats icon
import { useSocket } from '../../socket.jsx';
import toast from 'react-hot-toast';
import axios from 'axios';
import { userLogout } from '../../store/reducer.js';
import { persistor } from "../../store/store.js";
import { useDispatch } from 'react-redux';
import { userLogin } from '../../store/reducer.js';
import { userState } from '../../store/reducer.js';
import { Drawer, IconButton } from '@mui/material';

function Header() {
  const navigate = useNavigate();
  const logged = useSelector((state) => state.user.login);
  const socket = useSocket();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const automatedLogin = async () => {
    try {
      const res = await axios.get(`https://whisperia-backened-production.up.railway.app/user/automatedLogin`, { withCredentials: true });
      console.log(res.data.data, res.data, "res from automated");

      if (!res.data.data) {
        persistor.purge();
        dispatch(userLogout());
      } else {
        const data = res.data.data;
        const userInfo = {
          username: data.username,
          email: data.email,
          avatar: data.avatar,
          time: data.createdAt,
          id: data._id,
        };
        dispatch(userLogin());
        dispatch(userState(userInfo));
        navigate('/chats/1');
      }
    } catch (error) {
      console.error("Error in automatedLogin:", error);
      persistor.purge();
      dispatch(userLogout());
    }
  };

  useEffect(() => {
    automatedLogin();
  }, []);

  useEffect(() => {
   if(socket){
    const handleNotify = async ({ message }) => {
      console.log(message);
      toast.success(message);
    };
    socket.on('RemoveMember', handleNotify);
   }
   else{
    console.log("socket is not initialized");
    
   }
    return () => {
      socket.off('RemoveMember', handleNotify);
    };
  }, [socket]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-screen h-16 flex justify-between items-center bg-purple-300 px-4 sticky top-0 z-10">
      {/* Logo */}
      <div className="font-extrabold text-xl text-yellow-50 text-outline-purple">
        Whisperia
      </div>

      {/* Desktop Icons */}
      <div className="hidden sm:flex sm:gap-14 items-center">
        {/* Left-aligned icons */}
        <div className="flex gap-14">
          <Search />
          <AddFriend />
          <GroupDialouge />
          <ChatIcon sx={{ fontSize: 30, color: 'white' }} onClick={() => navigate('/friends')} />
        </div>

        {/* Right-aligned icons */}
        <div className="flex gap-14 ml-auto">
          <Notification />
          {logged ? (
            <Tooltip title="Logout">
              <span onClick={() => navigate('/sign-out')}>
                <LogoutIcon sx={{ fontSize: 30 }} className="text-white" />
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Log In">
              <span onClick={() => navigate('/sign-in')}>
                <LoginIcon sx={{ fontSize: 30 }} className="text-white" />
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Mobile Menu Icon */}
      <div className="sm:hidden">
        <IconButton onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? (
            <CloseIcon sx={{ fontSize: 30, color: 'white' }} />
          ) : (
            <MenuIcon sx={{ fontSize: 30, color: 'white' }} />
          )}
        </IconButton>
      </div>

      {/* Mobile Sidebar */}
      <Drawer
  anchor="right" // Opens from the right
  open={isMobileMenuOpen}
  onClose={toggleMobileMenu}
>
  <div className="w-64 p-4 bg-purple-300 h-full flex items-center flex-col gap-10">
    {/* Search Component */}
    <Search className="hover:scale-110 transition-transform duration-300" />

    {/* AddFriend Component */}
    <AddFriend className="hover:scale-110 transition-transform duration-300" />

    {/* GroupDialouge Component */}
    <GroupDialouge className="hover:scale-110 transition-transform duration-300" />

    {/* Chat Icon */}
    <ChatIcon
      sx={{ fontSize: 30, color: 'white' }}
      className="hover:scale-110 transition-transform duration-300 cursor-pointer"
      onClick={() => navigate('/friends')}
    />

    {/* Notification Component */}
    <Notification className="hover:scale-110 transition-transform duration-300" />

    {/* Logout/Login Icons */}
    {logged ? (
      <Tooltip title="Logout">
        <span
          onClick={() => navigate('/sign-out')}
          className="hover:scale-110 transition-transform duration-300 cursor-pointer"
        >
          <LogoutIcon sx={{ fontSize: 30 }} className="text-white" />
        </span>
      </Tooltip>
    ) : (
      <Tooltip title="Log In">
        <span
          onClick={() => navigate('/sign-in')}
          className="hover:scale-110 transition-transform duration-300 cursor-pointer"
        >
          <LoginIcon sx={{ fontSize: 30 }} className="text-white" />
        </span>
      </Tooltip>
    )}
  </div>
</Drawer>
    </nav>
  );
}

export default Header;