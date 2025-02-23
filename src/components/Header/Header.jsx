import{ useEffect } from 'react'
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';
import AddFriend from './AddFriend.jsx';
import GroupDialouge from './GroupDialouge.jsx';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginIcon from '@mui/icons-material/Login';
import Search from './Search.jsx';
import Notification from './Notification.jsx';
import { useSocket } from '../../socket.jsx';
import toast from 'react-hot-toast';

function Header() {
  const navigate = useNavigate();
  const logged = useSelector((state) => state.user.login);
  const socket = useSocket();
  useEffect(() => {
    let handleNotify = async ({message}) => {
      console.log(message);
      
      toast.success(message);
    };
    socket.on('RemoveMember', handleNotify);
    return () => {
      socket.off('RemoveMember', handleNotify);
    };
  }, [socket]);
  return (
    <nav className="w-screen h-16 flex justify-between items-center bg-purple-300 px-4 sticky top-0 z-10">
      <div className="font-extrabold text-xl text-yellow-50 text-outline-purple">
        Whisperia
      </div>
      <div className="lg:w-1/4 sm:w-1/2 w-3/4 flex sm:gap-4 justify-around items-center pl-7 gap-1">
        <Search />
        <AddFriend />
        <GroupDialouge />
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
    </nav>
  );
}

export default Header;