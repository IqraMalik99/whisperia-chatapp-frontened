import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Avatar } from '@mui/material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { userId } from '../store/reducer.js';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../socket.jsx';

function GroupsCreater() {
  const [friends, setFriends] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSocket();
  const apiUrl = import.meta.env.VITE_API_URL;
  // Fetch group data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/chat/get-group`, {
          withCredentials: true,
        });
        setFriends(response.data);
        console.log(response.data, "my chat groups");
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetcher();

    // Socket event listener for refetching data
    const handleRefetch = () => {
      fetcher();
    };

    socket.on("Group_Refetch", handleRefetch);

    // Cleanup socket event listener
    return () => {
      socket.off("Group_Refetch", handleRefetch);
    };
  }, [socket]);

  return (
    <div className="mt-20 w-screen lg:w-1/4 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r">
      <div className="lg:p-4">
        {friends.map((user) => (
          <div
            key={user._id}
            onClick={() => {
              console.log("Clicked");
              dispatch(userId(user._id));
              navigate(`/group-chat/${user._id}`);
            }}
            tabIndex="0"
            className="w-11/12 lg:w-10/12 mx-auto focus:bg-purple-300 bg-purple-100 h-16 rounded-xl mb-2 px-3 cursor-pointer  transition-colors duration-200"
          >
            <div className="flex items-center h-16 gap-3">
              {/* Stacked Avatars for Group Members */}
              <Stack direction="row" spacing={0} sx={{ position: 'relative' }}>
                {user.members.slice(0, 3).map((member, index) => (
                  <Avatar
                    key={member._id}
                    src={member.avatar}
                    sx={{
                      marginLeft: index === 0 ? '0' : '-10px',
                      marginRight: index < 2 ? '-10px' : '0',
                    }}
                  />
                ))}
              </Stack>

              {/* Group Name */}
              <div>
                <p className="font-semibold text-pink-600">{user.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupsCreater;