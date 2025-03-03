import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar } from '@mui/material';
import AddMember from './AddMember';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ManageGroup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState({});
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://whisperia-backened-production.up.railway.app/chat/get-info/${id}`, {
          withCredentials: true,
        });
        console.log(response.data.data, " my chatszzttt");
        setGroup(response.data.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      console.log("entry");
      fetcher();
    }
  }, [id]);

  const handleRemove = async (memberId) => {
    try {
      const removeMember = await axios.get(`https://whisperia-backened-production.up.railway.app/chat/remove/${id}/${memberId}`, {
        withCredentials: true,
      });
      console.log(removeMember, "removed");
      // Update UI after removal by filtering out the removed member
      setGroup((prev) => ({
        ...prev,
        members: prev.members?.filter((member) => member._id !== memberId),
      }));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  return (
    <div className="relative mt-32 md:mt-20 w-screen md:w-3/4 m-auto">
      {/* Back arrow at top left */}
      <div
        className="cursor-pointer mb-2 block lg:hidden"
        onClick={() => navigate("/group-chat")}
      >
        <ArrowBackIcon fontSize="large" />
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
        </div>
      ) : (
        <div>
          {group.members?.map((member) => (
            <div
              key={member._id}
              className="w-11/12 bg-purple-100 h-16 rounded-xl m-auto mb-2 px-3 flex items-center justify-between"
            >
              {/* Avatar and Username */}
              <div className="flex items-center gap-3">
                <Avatar src={member.avatar} />
                <span>{member.username}</span>
              </div>

              {/* If the member's ID matches the creator ID in group, show "Creator" */}
              {member._id === group.creator ? (
                <span className="text-purple-700 font-bold">Creator</span>
              ) : (
                <button
                  className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  onClick={() => handleRemove(member._id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <div className="mt-5 w-full flex justify-center">
            <AddMember />
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageGroup;
