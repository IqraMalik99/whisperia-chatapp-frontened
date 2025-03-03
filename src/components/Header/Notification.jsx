
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Tooltip } from '@mui/material';
import { useEffect } from 'react';
import { useSocket } from '../../socket';
import axios from 'axios';
import { useSelector } from 'react-redux';
export default function Notification() {

  const [open, setOpen] = React.useState(false);
  let data = useSelector((state)=> state.user.currentUser);
  const [requests, setRequests] = React.useState([]);
  
  const socket = useSocket();
  let [msg, setmsg] = React.useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    let fetcher = async () => {
      let request = await axios.get(`https://whisperia-backened-production.up.railway.app/user/getreq`, { withCredentials: true });
      console.log("Request", request.data.data);
     
      request.data.data.map((req) => {
        let newreq = {
          sender: req.sender,
          requestId: req._id,
          content: req.content
        }
        if (req.status == "pending") {
          setRequests((prev) => [...prev, newreq]);
        }
      })

      let messagesAcceptReject= await axios.get(`https://whisperia-backened-production.up.railway.app/user/getreqacceptreject`, { withCredentials: true });
      messagesAcceptReject.data.data.map((req) => {
      if(req.status == "accepted" || req.status == "rejected"){
        let newmsg={
          msg:req.content,
          id:req._id
        }
        setmsg((prev) => [...prev, newmsg]);
      }
    })
    }
    fetcher();
  }, [])

  // Listening for friend requests
  useEffect(() => {
    const FRIEND_REQUEST_ALERT = 'FRIEND_REQUEST_ALERT';
    const Accept_FRIEND_Request_ALERT = 'Accept_FRIEND_Request_ALERT';
    const Reject_FRIEND_Request_ALERT = 'Reject_FRIEND_Request_ALERT';

   if(socket){
    socket.on(Accept_FRIEND_Request_ALERT, async ({ message, requestId }) => {
      console.log("its message to sender ", message,requestId);
      let newmsg={
        msg:message,
        id:requestId
      }
      setmsg((prev) => [...prev, newmsg]);
      console.log("its message to sender ", message);
    })


    socket.on(Reject_FRIEND_Request_ALERT, ({ message, requestId }) => {
      console.log("its message to sender ", message,requestId);
      let newmsg={
        msg:message,
        id:requestId
      }
      setmsg((prev) => [...prev, newmsg]);
      console.log("its message to sender ", message);
    })

    socket.on(FRIEND_REQUEST_ALERT, async ({ sender,
      requestId,
      content }) => {

      console.log("Received friend request from hehe:", {
        sender,
        requestId,
        content
      });
      let newreq = {
        sender: sender,
        requestId: requestId,
        content: content
      }
      setRequests((prev) => [...prev, newreq]); // Add new sender to the list

    });
   }
   else{
    console.log("socket not inialtized");
    
   }

    // Cleanup listener on unmount
    return () => {
      socket.off(FRIEND_REQUEST_ALERT);
      socket.off(Accept_FRIEND_Request_ALERT);
      socket.off(Reject_FRIEND_Request_ALERT);
    };
  }, [socket]);

  useEffect(() => {
    let fetcher = async () => {
      let res = await axios.get(`https://whisperia-backened-production.up.railway.app/user/getReq`, { withCredentials: true });
      console.log("reqgetter is :", res.data.data);
      if (res.data.data > 0) {
        res.data.data.map((per) => {
          //
          let newreq = {
            sender: per.sender,
            requestId: per._id,
            content: per.content
          }
          setRequests((prev) => [...prev, newreq]);
          console.log(requests);
          
          //
        }
        )
      }
    };
    fetcher();
  }, [])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle accepting a friend request
  const handleAccept = async (requestId,sender) => {
    console.log(requestId);
    console.log(sender);
   if(socket){
    socket.emit('ACCEPT_FRIEND_REQUEST', {requestId,sender,data});
   }
   else{
    console.log("socket not");
    
   }
    console.log(sender,"sender");
    setRequests((prev) => prev.filter((req) => req.requestId  !== requestId));
  };

  // Handle rejecting a friend request
  const handleReject = (requestId,sender) => {
    console.log(requestId);
  console.log(sender);
  
    
  if(socket){
    socket.emit('REJECT_FRIEND_REQUEST', {requestId,sender,data});
  }
  else{
    console.log("socket not iniltilized");
  }
    setRequests((prev) => prev.filter((req) => req.requestId  !== requestId));
  };

 let sendreject =(id)=>{
  setmsg((prev) =>prev.filter((req) => req.id !== id));
 if(socket){
  socket.emit('Delete_Request', {id});
 }
 else{
  console.log("socket not initialized");
  
 }
}
  return (
    <React.Fragment>
      <Button onClick={handleClickOpen}>
        <Tooltip title="Notification">
          <span>
            <NotificationsIcon sx={{ fontSize: 30 }} className="text-white" />
          </span>
        </Tooltip>
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="notification-dialog-title"
        aria-describedby="notification-dialog-description"
      >
        <DialogTitle id="notification-dialog-title">
          Friend Requests
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="notification-dialog-description">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.requestId} className="flex items-center justify-between my-2">
                  <div>
                   {request.content}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-green-700 border-2 border-green-700 rounded-lg"
                      onClick={() => {
                        console.log("id is : ", request.requestId);
                        handleAccept(request.requestId,request.sender)
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="p-2 text-red-700 border-2 border-red-700 rounded-lg"
                      onClick={() => {
                        console.log("id is : ", request.requestId);
                        handleReject(request.requestId,request.sender);
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              "No new friend requests."
            )}
            {msg.length > 0 ? (
              msg.map((msgs) => (
                <div key={msgs.id} className="flex items-center justify-between my-2">
                  <div>
                    <span className="text-purple-500 ">
                      {msgs.msg}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className=" mx-2 p-2 text-black-700 "
                      onClick={() => sendreject(msgs.id)}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))
            ) : (
              ""
            )}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
