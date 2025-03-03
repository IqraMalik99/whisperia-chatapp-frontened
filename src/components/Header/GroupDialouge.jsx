import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogContent, DialogTitle, DialogContentText, Autocomplete, Tooltip, DialogActions } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function GroupDialouge() {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState(false);
  let [friendRequest, setFriendRequest] = useState([]); // Here I have selected users to send friend requests
  let [groupName, setGroupName] = useState("");
  let navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  React.useEffect(() => {
    const fetcher = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/chat/getFriends`, { withCredentials: true });
        let friends = response.data.message.map((user) => ({ id: user._id, name: user.username, add: false }));
        setUsers(friends); // Corrected setUser to setUsers
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetcher();
  }, [trigger]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleButtonClick = async (e, user) => {
    e.preventDefault(); // Prevent default action

    setUsers((prev) =>
      prev.map((obj) => {
        if (obj.id === user.id) {
          const updatedUser = { ...obj, add: !obj.add }; // Toggle the add state
          // Manage friend requests based on the updated state
          if (!obj.add) {
            setFriendRequest((prevRequests) => [...prevRequests, updatedUser]); // Add user to friend requests
          } else {
            setFriendRequest((prevRequests) =>
              prevRequests.filter((req) => req.id !== user.id) // Remove user from friend requests
            );
          }
          return updatedUser; // Return the updated user
        }
        return obj; // Return unchanged user
      })
    );
  };

  return (
    <>
      <Tooltip title="Make Group">
        <span onClick={handleClickOpen}><GroupIcon sx={{ fontSize: 30 }} className='text-white' /></span>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            height: '70vh',
            maxWidth: '400px',
            width: '100%',
            backgroundColor: '#f3e5f5', // Light purple background
            borderRadius: '12px', // Rounded corners for the card
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
          },
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            console.log(friendRequest);
            console.log(groupName);
            let friendRequestids = friendRequest.map((user) => user.id);
            console.log(friendRequestids);

            setFriendRequest([]);
            setTrigger(prev => !prev);
            let fetcher = async () => {
              let res = await axios.post(`http://localhost:3000/chat/new`, { name: groupName, members: friendRequestids }, { withCredentials: true });
              console.log('Response from server:', res.data.message);
            };
            fetcher();
            handleClose();
          },
        }}
      >
        <DialogTitle sx={{ color: '#6a1b9a', fontWeight: 'bold' }}>Make Group</DialogTitle> {/* Dark purple title */}
        <DialogContentText className='p-2'>
          <div>
            {friendRequest.length > 0 && friendRequest.map((obj) => (
              <span key={obj.id} id={obj.id} className='px-2' style={{ color: '#6a1b9a' }}> {/* Dark purple text */}
                {obj.name}
              </span>
            ))}
          </div>
        </DialogContentText>
        <DialogContent>
          {/* Group Name TextField */}
          <TextField
            id="standard-basic"
            sx={{
              margin: 2,
              width: '80%', // Adjusted width to 80%
              '& .MuiInputLabel-root': { color: '#6a1b9a' },
              '& .MuiInputBase-root': { color: '#6a1b9a' },
            }} // Purple text and label
            label="Group Name"
            variant="standard"
            onChange={(e) => { setGroupName(e.currentTarget.value); }}
          />
          {/* User Autocomplete */}
          <Autocomplete
            disablePortal
            options={users}
            getOptionLabel={(option) => option.name}
            sx={{ width: '80%', margin: 2 }} // Adjusted width to 80%
            renderInput={(params) => (
              <TextField
                {...params}
                label="User"
                sx={{
                  '& .MuiInputLabel-root': { color: '#6a1b9a' },
                  '& .MuiInputBase-root': { color: '#6a1b9a' },
                }} // Purple text and label
              />
            )}
            renderOption={(props, user) => (
              <li {...props} id={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6a1b9a' }}> {/* Dark purple text */}
                <span>{user.name}</span>
                <Button onClick={(e) => handleButtonClick(e, user)}>
                  {user.add ? <RemoveCircleOutlineIcon sx={{ color: '#d32f2f' }} /> : <AddCircleOutlineIcon sx={{ color: '#6a1b9a' }} />} {/* Purple and red icons */}
                </Button>
              </li>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();
              navigate('/group-chat');
              console.log('Manage Group clicked');
            }}
            sx={{
              px: 3,
              py: 1.5,
              backgroundColor: '#ab47bc', // Light purple background
              color: '#fff',
              borderRadius: '20px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: '#8e24aa', // Darker light purple on hover
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
              },
              '&:active': {
                backgroundColor: '#6a1b9a', // Even darker light purple when clicked
                boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.2s ease-in-out',
              ml: 2, // Add some margin to separate the buttons
            }}
          >
            Manage Group
          </Button>
          <Button
            type='submit'
            sx={{
              px: 3,
              py: 1.5,
              backgroundColor: '#6a1b9a', // Dark purple background
              color: '#fff',
              borderRadius: '20px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: '#4a148c', // Darker purple on hover
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
              },
              '&:active': {
                backgroundColor: '#38006b', // Even darker purple when clicked
                boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}