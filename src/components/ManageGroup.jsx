import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Avatar } from '@mui/material';
import AddMember from './AddMember';
function ManageGroup() {
    let { id } = useParams();
    let [users, setUsers] = useState({});
    let [loading, setLoading] = useState(false);

    useEffect(() => {
        let fetcher = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://whisperia-backened-production.up.railway.app/chat/get-info/${id}`, {
                    withCredentials: true,
                });
                console.log(response.data.data, " my chatszz");
                setUsers(response.data.data);
            } catch (error) {
                console.error("Error fetching data: ", error);
                console.log("Error in data fetching");
            } finally {
                setLoading(false);
            }
        };
        if (id !== "1") {
            console.log("entry");
            fetcher();
        }
    }, [id]);
let handleRemove= async(memberid)=>{
    let memberids=memberid
 let removeMember = await axios.get(`https://whisperia-backened-production.up.railway.app/chat/remove/${id}/${memberids}`, {
                    withCredentials: true,
                })
                console.log(removeMember,"removed");
                
}
    return (
        <div className='mt-20'>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
              </div>
              
            ) : (
                <div>
                    {users.members?.map((member) => (
                        <div
                            key={member._id}
                            className="w-5/6 bg-purple-100 h-16 rounded-xl m-auto mb-2 px-3 flex items-center justify-between"
                        >
                            {/* Avatar and Username in the Same Line */}
                            <div className="flex items-center gap-3">
                                <Avatar src={member.avatar} />
                                <span>{member.username}</span>
                            </div>

                            {/* Remove Button on the Right */}
                            <button className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-red-600" onClick={()=>{
                                console.log("doner",member._id);
                                handleRemove(member._id)
                            }}>
                                Remove
                            </button>
                        </div>
                    ))}
                   <div className='mt-5 w-full flex justify-center'>
                   <AddMember />
                   </div>
                </div>
            )}
        </div>
    );
}

export default ManageGroup;
