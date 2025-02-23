
import { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import { Avatar } from '@mui/material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { userId } from '../store/reducer.js';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../socket.jsx';



function GroupsCreater() {
  let [friends, setFriends] = useState([]);
  let dispatch = useDispatch();
  let navigate = useNavigate();
  const socket = useSocket();


  useEffect(() => {
    let fetcher = async () => {
      try {
        const response = await axios.get('https://whisperia-backened-production.up.railway.app/chat/get-group', {
          withCredentials: true,
        });
        setFriends(response.data);
        console.log(response.data, " my chats groups");
      } catch (error) {
        console.error("Error fetching data: ", error);
        console.log("Error in data fetching");
      }
    };
    fetcher();
    let handleRefetch=async()=>{
      fetcher();
    }
    socket.on("Group_Refetch",handleRefetch())
    return () => {
      socket.off("Group_Refetch",handleRefetch);
    }
  }, [socket]);


  return (
    <div className='mt-20'>
      {friends.map((user) => (
        <div
          key={user._id}
          onClick={() => {
            console.log("Clicked");
            dispatch(userId(user._id));
            navigate(`/group-chat/${user._id}`);
          }}
          tabIndex="0"
          className="w-5/6 focus:bg-purple-300 bg-purple-100 h-16 rounded-xl m-auto mb-2 px-3"
        >
          <div className="flex items-center h-16 gap-3">
        
              <Stack direction="row" spacing={0} sx={{ position: 'relative' }}>
                <Avatar src={user.members[0].avatar} sx={{ marginLeft: '0', marginRight: '-10px' }} />
                <Avatar src={user.members[1].avatar} sx={{ marginLeft: '-10px', marginRight: '-10px' }} />
                <Avatar src={user.members[2].avatar} sx={{ marginLeft: '-10px' }} />
              </Stack>
           
            <div>
              <p className="font-semibold text-pink-600">{user.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GroupsCreater;
