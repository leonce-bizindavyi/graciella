import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast,ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { io } from "socket.io-client";
import { useRef } from 'react';
import Link from 'next/link';
import Modal from 'react-modal';
import { useRouter } from 'next/router';
import { v4 as uuiddv4} from 'uuid'

Modal.setAppElement('#__next');

const Chat = () => {
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("")
  const [usernameR,setUsernameR]=useState("");
  const [passwordR,setPasswordR]=useState("")
  const [isLoggedIn,setIsLoggedIn]=useState(false)
  const [clients, setClients] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const [activeLink,setActiveLink]=useState('broadcast');
  const [user,setUser] =useState("")
  const [id,setId] =useState("")
  const [newUser,setNewUser] =useState("")
  const [socket, setSocket] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [privateMessages, setPrivateMessages] = useState({});
  const [newprivateMessages, setNewPrivateMessages] = useState({});
  const [publicMessages, setPublicMessages] = useState([]); 
  const [unreadMessages, setUnreadMessages] = useState({});
  const [newunreadMessages, setNewUnreadMessages] = useState({});
  const router  =useRouter()
  const [userSocket,setUserSocket]=useState({});
  const [newuserSocket,setNewUserSocket]=useState({});
  const [usesocket,setUseSocket] =useState(null)
  const [newusesocket,setNewUseSocket] =useState(null)
  const [activeSocket,setActiveSocket] =useState('')

  const[isModalOpen,setIsModalOpen]=useState(false)
  const[isModalOpen1,setIsModalOpen1]=useState(false)
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [newgroupData, setNewGroupData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupMessages, setGroupMessages] = useState({});
  const [newgroupMessages, setNewGroupMessages] = useState({});
  const [unreadMessagesG, setUnreadMessagesG] = useState({});
  const [newunreadMessagesG, setNewUnreadMessagesG] = useState({});

  const [nonGroupMembers,setNonGroupMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const CreateGroup = (e)=>{
    e.preventDefault();
    if(socket){
      selectedMembers.push(newUser);
      socket.emit('newGroup',{groupName,selectedMembers,activeSocket});
    }
    setGroupName('');
    setSelectedMembers([]);
  }

  const deletePublicMessage = (message) =>{
    const updatedPublicMessages = publicMessages.filter((msg) => msg !== message);
    setPublicMessages(updatedPublicMessages);
 }

  const deletePrivateMessage = (messageToDelete) =>{
  const updatedPrivateMessages = { ...privateMessages };
  const userId = messageToDelete.fromPrivate;
  if (updatedPrivateMessages[userId]) {
    updatedPrivateMessages[userId] = updatedPrivateMessages[userId].filter(
      (message) => message !== messageToDelete
    );
    setPrivateMessages(updatedPrivateMessages);
  }
}

const deleteGroupMessage = (messageToDelete) => {
  const updatedGroupMessages = { ...groupMessages };
  const updatedNewGroupMessages = { ...newgroupMessages };
  const groupId = messageToDelete.groupId;
  if (updatedGroupMessages[groupId]) {
    updatedGroupMessages[groupId] = updatedGroupMessages[groupId].filter(
      (message) => message.uniqueId !== messageToDelete.uniqueId
    );
    updatedNewGroupMessages[groupId] = updatedNewGroupMessages[groupId].filter(
      (message) => message.uniqueId !== messageToDelete.uniqueId
    );
    setGroupMessages(updatedGroupMessages);
    setNewGroupMessages(updatedNewGroupMessages);
  }
};

  const handleGroupClick = (group) => {
    setActiveLink('group');
    setSelectedGroup(group);
    setUnreadMessagesG((prevUnreadMessagesG)=>({
      ...prevUnreadMessagesG,
      [group.groupId]:0,
    })); 

    setNewUnreadMessagesG((prevUnreadMessagesG)=>({
      ...prevUnreadMessagesG,
      [group.groupId]:0,
    }))

  const usersNotInGroup = clients.filter(
      (client) => 
      !group.selectedMembers.includes(client.username) && client.username != newUser
    );
    setNonGroupMembers(usersNotInGroup);
  }

  const addUsersToGroup = (group,users)=>{
      const updatedGroupData = groupData.map((row) => {
        if (row.groupId === group) {
          const updatedMembers = [...row.selectedMembers, ...users];
          setSelectedGroup(row);
          return { ...row, selectedMembers: updatedMembers };
        }
        return row;
      })
      setNewGroupData(updatedGroupData)
      if(socket){
        socket.emit('updateGroupData',{group,users});
      }
      setSelectedGroup(null)
      setIsModalOpen1(false)
  }
  useEffect(() => {
    if (newgroupData) {
      setGroupData(newgroupData)
    }
  }, [newgroupData]);
  
  const handleUserClick = (user) => {
    setActiveLink('private');
    setSelectedUser(user);  
    setUnreadMessages((prevUnreadMessages) => ({
      ...prevUnreadMessages,
      [userSocket[user.userId]]: 0,
    }));

    setNewUnreadMessages((prevUnreadMessages)=>({
      ...prevUnreadMessages,
      [userSocket[user.userId]]:0
    }))
  };
    
    const broadcastMessage = ()=>{
      setActiveLink('broadcast');
      setSelectedUser(null);
      setSelectedGroup(null)
    }
    const groupMessage = ()=>{
      setActiveLink('group');
      setSelectedUser(null);
    }

    const privateMessage = ()=>{
      setActiveLink('broadcast')
      setSelectedUser(null);
      setSelectedGroup(null)
    }
    const showAll= useRef(null);
    const showMenu = ()=>{
      showAll.current.classList.remove('hidden')
    }
    const couper = ()=>{
      showAll.current.classList.add('hidden')
    }
    const showAllSalon= useRef(null);
    const showMenuSalon = ()=>{
         showAllSalon.current.classList.remove('hidden')
    }
    const couperSalon = ()=>{
      showAllSalon.current.classList.add('hidden')
 }
  const [login,setLogin] = useState(true);
  const [register,setRegister] = useState(false);
  const handleChangeLogin = ()=>{
      if(!login)
      {
          setLogin(!login)
          setRegister(!register)
      }
  }
  const handleChangeRegister = ()=>{
      if(!register)
      {
          setLogin(!login)
          setRegister(!register)
      }
  }
  const sendPrivateMessage = (content, to, from) => {
    if (socket) {
      socket.emit('private message', { content, to, from});
    }
  };
  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);
   
    return () => {
      newSocket.close();
    };
  }, [setSocket]);
  
  const sendMessage = (e) => {
    e.preventDefault();
    if (!selectedUser) {
      if (!selectedGroup) {
        if (socket && messageInput.trim() !== '') {

          const currentTime = new Date();
          const year = currentTime.getFullYear();
          const month = String(currentTime.getMonth() + 1).padStart(2, '0');
          const day = String(currentTime.getDate()).padStart(2, '0');
          const hours = String(currentTime.getHours()).padStart(2, '0');
          const minutes = String(currentTime.getMinutes()).padStart(2, '0');
          const seconds = String(currentTime.getSeconds()).padStart(2, '0');

          const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          socket.emit('public message', messageInput, activeSocket, formattedTime);
          setMessageInput('');
        }
      } else {
        if (socket && messageInput.trim() !== '') {
          const groupMessageData = {
            uniqueId:uuiddv4(),
            content: messageInput,
            type: 'sent',
            fromUser:activeSocket,
            fromGroup:selectedGroup.groupId,
            groupNames: selectedGroup.groupName,
            groupMembers: selectedGroup.selectedMembers,
          };
          socket.emit('group message', groupMessageData);
          setGroupMessages((prevGroupMessages) => ({
            ...prevGroupMessages,
            [selectedGroup.groupId]: [
              ...(prevGroupMessages[selectedGroup.groupId] || []),
              { content: messageInput, type: 'sent' ,groupId:selectedGroup.groupId},
            ],
          }));
          
          setMessageInput('');
        }
      }
    } else {
      if (socket && messageInput.trim() !== '') {
        sendPrivateMessage(messageInput, selectedUser.userId, activeSocket);
        setPrivateMessages((prevPrivateMessages) => ({
          ...prevPrivateMessages,
          [selectedUser.userId]: [
            ...(prevPrivateMessages[selectedUser.userId] || []),
            { content: messageInput, type: 'sent', fromPrivate:selectedUser.userId},
          ],
        }));
        setMessageInput('');
      }
    }
  };
  
const handleLogin=(e)=>{
  e.preventDefault();
  if(socket && username.trim() !== '' && password.trim() !==''){
    socket.emit('login',{username, password});
  }
};
const handleRegister=(e)=>{
  e.preventDefault();
  if(socket && usernameR.trim() !== '' && passwordR.trim() !==''){
    socket.emit('register',{usernameR, passwordR});
  }
};

  useEffect(() => {
    if (socket) {
      socket.on("login_successful", (data) => {
        setIsLoggedIn(true)
        setUsername("")
        setPassword("")
        setUser(data.username);
        setUseSocket(data.id);
      });
      socket.on("login_failed", (data) => {
        toast.error('error login',
        { position: toast.POSITION.TOP_CENTER}
        );
      });
      
      socket.on("newConnect",(data)=>{
        if(data.username !== newUser){
        toast.success(
          data.username + " is connected now \n" ,{
            position: toast.POSITION.TOP_CENTER
          });
        }
      })

      socket.on("disconnectUser",(data)=>{
        if(data.username !== newUser){
        toast.success(
          data.username + " is disconnected now \n" ,{
            position: toast.POSITION.TOP_CENTER
          });
        }
      })

      socket.on("registration_successful", (data) => {
        setUsernameR("")
        setPasswordR("")
        toast.success(
          data.usernameR + " is registrated \n" + "With ID :" + data.id,{
            position: toast.POSITION.TOP_CENTER
          });
 
      });
      socket.on("registration_failed", (message) => {
         toast.error(
          "Error while registration !",
         { position: toast.POSITION.TOP_CENTER}
          );
      });
    
      socket.emit('updated connectedUsers')
      socket.emit('updated connectedGroup')

      socket.on('reponse',(client)=>{
        setClients(client);
      })
      socket.on('allGroup',(group)=>{
        setGroupData(group);
      });

      socket.on('your id', (id) => {
        setId(id);
      })
      socket.on('userSock',(userSocket)=>{
        setUserSocket(userSocket);
      })
      socket.on('new private message', (message) => {
        setPrivateMessages((prevPrivateMessages) => {
          const userId = message.fromPrivate;
          const newMessage = message;
          const existingMessages = prevPrivateMessages[userId] || [];
        
          return {
            ...prevPrivateMessages,
            [userId]: [...existingMessages, newMessage],
          };
        });
        
        setNewUnreadMessages((prevUnreadMessages) => {
          const fromUserId = message.from;
          const existingUnreadCount = prevUnreadMessages[fromUserId] || 0;
          return {
            ...prevUnreadMessages,
            [fromUserId]: existingUnreadCount + 1,
          };
        });
        
      });
    
      socket.on('new group message',(message)=>{
        console.log("Message : ",message.content," from: ",message.fromName);
        setNewGroupMessages((prevGroupMessages) => ({
          ...prevGroupMessages,
          [message.fromGroup]: [
            ...(prevGroupMessages[message.fromGroup] || []),
            { uniqueId:message.uniqueId, content: message.content, type: message.type ,groupId:message.fromGroup,fromName:message.fromName},
          ],
        }));
        setNewUnreadMessagesG((prevUnreadMessagesG) => ({
          ...prevUnreadMessagesG,
          [message.fromGroup]: (prevUnreadMessagesG[message.fromGroup] || 0) + 1
        }));
      })

      socket.on('public message', (message) => {
        console.log("Message : ",message.content," from: ",message.fromName);
        setPublicMessages((previousSMS)=>[...previousSMS,message])
      });
      socket.on("reconnect_successful", () => {
       alert("Reconnected to the server");
      });

      return () => { 
        socket.disconnect();
        socket.off('allGroup');
      };
    }
  }, [socket]);
  function logout(){
    return router.reload()
  }

 useEffect(() => {
  if (newprivateMessages) {
    setPrivateMessages((prevPrivateMessages) => ({
      ...prevPrivateMessages,
      ...newprivateMessages,
    }));
  }
  if (newunreadMessages) {
    setUnreadMessages((prevUnreadMessages) => ({
      ...prevUnreadMessages,
      ...newunreadMessages,
    }));
  }
}, [newprivateMessages, newunreadMessages]);

useEffect(() => {
  if (newgroupMessages) {
    setGroupMessages((prevGroupMessages) => ({
      ...prevGroupMessages,
      ...newgroupMessages,
    }));
  }
  if (newunreadMessagesG) {
    setUnreadMessagesG((prevUnreadMessagesG) => ({
      ...prevUnreadMessagesG,
      ...newunreadMessagesG,
    }));
  }
}, [newgroupMessages, newunreadMessagesG]);

  useEffect(() => {
    if(user!==null){
      setNewUser(user);
    }
    if (usesocket !== null) {
      setNewUseSocket(usesocket);
    }
    const isEmptyUserSocket = Object.keys(userSocket).length === 0;
    if (!isEmptyUserSocket) {
      setNewUserSocket(userSocket, () => {
      });
    }
    const isEmptyNewUserSocket = Object.keys(newuserSocket).length === 0;
    if (usesocket !== null && !isEmptyNewUserSocket) {
      const newActiveSocket = newuserSocket[newusesocket];
      setActiveSocket(newActiveSocket);
    }
  }, [user,usesocket,newusesocket,userSocket,newuserSocket,activeSocket]);
  
    return (
  <div className='bg-gray-200 min-h-screen'>
    {
      isLoggedIn?(
      <>
        <header className="bg-blue-100 p-2 border-b-2 border-purple-600 shadow-lg">
          <div className='flex justify-between '>
              <div className="">
                  <div className="w-12 h-12 rounded-full shadow-md flex justify-center bg-blue-700 text-lg text-white p-3">
                    {newUser.charAt(0).toUpperCase()}  
                  </div>
                  <h2 className="text-lg font-semibold font-serif text-purple-700">{newUser}</h2>
              </div>
              <div className="flex justify-center m-3">
                  <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold font-serif text-blue-600">Chat App</h1>
              </div>
              <div className='h-[3rem] mt-3'>
                  <button className='bg-red-600 text-white border rounded-md p-2 ' onClick={logout}>Logout</button>
              </div>
          </div>
        </header>
        <div className="flex min-h-screen ">
          <div className=" bg-gray-100 pt-2 min-w-[40%] relative">
            <div className='w-[full] flex justify-end mr-2'>
                <div className=' bg-blue-700 w-10 h-10 flex justify-center visible lg:hidden rounded-lg'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="text-white" ref={showAll} onClick={showMenu}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>
            </div>
            <div className='hidden bg-green-200 lg:grid grid-cols-3 space-y-6 h-auto absolute lg:relative lg:right-0 m-2 p-2 w-[90%] lg:my-3 rounded-lg' ref={showAll}>
                <div className='flex justify-end visible lg:hidden' onClick={couper}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600 ">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className='w-[1/2] h-full pl-0 sm:pl-2'>
                  <Link href="" className={`text-md sm:text-2xl font-bold font-serif ${activeLink === 'private' ? 'text-blue-700' : 'text-gray-700 text-blue-700'}`} onClick={privateMessage}>Private</Link>
                </div>
                <div className='w-[1/2] pl-0 sm:pl-2 border-t-2 lg:border-l-2 lg:border-t-0'>
                  <Link href="" className={`text-md sm:text-2xl  font-bold font-serif ${activeLink === 'group' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'}`} onClick={groupMessage}>Group</Link>
                </div>
                <div className='w-[1/2] pl-0 sm:pl-2 border-t-2 lg:border-l-2 lg:border-t-0'>
                  <Link href="" className={` text-md sm:text-2xl font-bold font-serif ${activeLink === 'broadcast' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'}`} onClick={broadcastMessage}>Broadcast</Link>
                </div>
            </div>

            { 
              (activeLink==='group')?
              (
                <>
                  <ul>
                    {groupData
                      .filter((group) => group.selectedMembers.includes(newUser))
                      .map((group, index) => (
                        <>
                          <li key={index} 
                            className={`flex items-center mb-2 cursor-pointer ${
                              unreadMessagesG[group.groupId] > 0 ? 'font-bold' : ''
                            }`}
                          
                          onClick={() => handleGroupClick(group)}>
                              <div className="w-8 h-8 rounded-full mr-2 p-1 shadow-md flex justify-center bg-blue-700 text-white text-lg">
                                {(group.groupName).charAt(0).toUpperCase()}
                              </div>
                              <span className=" flex-1">{group.groupName}</span>
                              {selectedGroup !=='' ? 
                              <span className="bg-red-500 text-white font-serif px-2 rounded-full">{unreadMessagesG && unreadMessagesG[group.groupId]> 0 && selectedGroup && selectedGroup.groupId !==group.groupId && unreadMessagesG[group.groupId]} </span> 
                              :
                              <span className="bg-red-500 text-white font-serif px-2 rounded-full">{unreadMessagesG && unreadMessagesG[group.groupId]> 0 && unreadMessagesG[group.groupId]} </span> 
                              }
                          </li>
                        </>
                      ))}
                  </ul>

                  <div className='flex justify-center items-center bg-blue-700  rounded-full fixed bottom-10 ml-[11%] shadow-md cursor-pointer' onClick={() => setIsModalOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-white font-bold p-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                    </svg>
                  </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)} 
          style={{
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
            content: {
              maxWidth: '400px',
              maxHeight:'500px',
              margin: 'auto',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <div className='flex justify-center'>
            <div>
                <h2  className='text-xl lg:text-2xl font-bold font-serif text-purple-600 mb-10'>Create Group</h2>
                <form>
                  <label className='text-xl lg:text-lg  text-purple-600 '>Group Name:</label>
                  <input value={groupName} onChange={(e)=>setGroupName(e.target.value)} type="text" className="appearance-none block rounded-bl-3xl rounded-tl-3xl rounded-tr-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm px-4 py-2 "/>
                  <label className='text-xl lg:text-lg  text-purple-600 '>Members:</label>
                  <select
                      value={selectedMembers}
                      onChange={(e)=>setSelectedMembers(Array.from(e.target.selectedOptions,(option)=>option.value)) }
                      multiple 
                      className="appearance-none block rounded-bl-3xl rounded-tl-3xl rounded-tr-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm px-4 py-2"
                    >
                  {clients.map((client) => (
                    client.username !== newUser && (
                      <option key={client.id} value={client.username}>
                        {client.username}
                      </option>
                    )
                  ))}

                  </select>
                  <button onClick={CreateGroup} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-10 hover:bg-blue-800" >Create</button>
                </form>
            </div>
          </div>
        </Modal>
                </>
              ):(
                <>
                  <ul className="mt-4">
                      {clients.map((client, index) => (
                        (user!==client.username)?(
                          <>
                          <li
                          key={index}
                          className={`flex items-center mb-2 cursor-pointer ${
                            unreadMessages[userSocket[client.userId] ]> 0 ? 'font-bold' : ''
                          }`}
                          onClick={() => handleUserClick(client)}
                        >
                          <div className="w-8 h-8 rounded-full mr-2 shadow-md flex justify-center bg-blue-700 text-lg text-white">
                            {(client.username).charAt(0).toUpperCase()}
                          </div>
                          <span className=" flex-1">{client.username}</span>
                          {activeLink==='private'?     
                          <span className="bg-red-500 text-white font-serif px-2 rounded-full">{unreadMessages[userSocket[client.userId] ]> 0 && selectedUser.userId !== client.userId && unreadMessages[userSocket[client.userId]]} </span> 
                          :
                          <span className="bg-red-500 text-white font-serif px-2 rounded-full">{unreadMessages[userSocket[client.userId] ]> 0 && unreadMessages[userSocket[client.userId]]} </span> }
                        </li>
                        </>
                        ):('')
                      ))}
                  </ul>
                </>
              )
            }
            
          </div>
          <div className="flex-1 p-3 bg-gray-300 relative h-screen">
          <div className='-mt-[2rem] flex-col space-y-[2rem]'>
            <div className=' bg-blue-100 flex justify-end mb-4 mt-2 visible lg:hidden rounded-lg '>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-purple-900" ref = {showAllSalon} onClick={showMenuSalon}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </div>
            <div className='hidden bg-green-200 lg:grid grid-cols-3 h-[3rem] absolute lg:relative right-3 lg:right-0 top-[3.75rem] lg:top-0 lg:my-3 rounded-lg pb-3 lg:pb-0' ref={showAllSalon}>
            <div className='flex justify-end visible lg:hidden' onClick={couperSalon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-8 text-red-500 font-bold font-serif">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className='w-[1/2] h-full pl-0 sm:pl-2'>
              <Link href="" className={`text-xl lg:text-2xl font-bold font-serif ${activeLink === 'broadcast' ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'}`} onClick={broadcastMessage}>Broadcast</Link>
            </div>
            <div className='w-[1/2] pl-0 sm:pl-2 border-t-2 lg:border-l-2 lg:border-t-0'>
              <Link href="" className={`text-xl lg:text-2xl font-bold font-serif ${activeLink === 'private' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'}`}  onClick={privateMessage}>Private</Link>
            </div>
            <div className='w-[1/2] pl-0 sm:pl-2 border-t-2 lg:border-l-2 lg:border-t-0'>
              <Link href="" className={`text-xl lg:text-2xl font-bold font-serif ${activeLink === 'group' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'}` } onClick={groupMessage }>Group</Link>
            </div>
            </div>

            {selectedUser ? (
            <div className="bg-white h-[28.5rem] rounded-lg py-2 sm:p-4 ">
              <div className='flex pb-2 border-b-2 border-blue-400 shadow-lg w-full '>
                  <div className="w-12 h-12 rounded-full mr-4 shadow-md flex justify-center bg-blue-700 text-lg text-white">
                    {(selectedUser.username).charAt(0).toUpperCase()}
                  </div>
                  <div><h2 className="text-lg font-semibold mb-2">
                    {selectedUser.username}
                  </h2></div>
              </div>
              <div className="overflow-y-scroll h-[20rem] ">
                {privateMessages[selectedUser.userId] && privateMessages[selectedUser.userId].map((mess, index) => (
                  <>
                    <div className='flex-col ' key={index} >
                      {mess.type==='sent'  ?
                      (
                        <div className='flex justify-start mt-8 group'> 
                        <div className='grid grid-cols-2 '>
                            <div
                              key={index}
                              className='bg-purple-600 text-white text-lg rounded-br-md rounded-tl-md rounded-tr-md  p-2 ' 
                              >
                                <h1 className='text-gray-400'>{newUser}</h1>
                                    {mess.content}
                            </div>                     
                            <button onClick={() => deletePrivateMessage(mess)} className="group-hover:block hidden">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500 ml-4 ">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>                             
                        </div>
                      ):
                      (
                        <div className='flex justify-end mt-8 group'>
                        <div
                          key={index}
                          className='bg-gray-300 text-black p-2 rounded-bl-md rounded-tl-md rounded-tr-md  '
                          >
                            <h1 className='text-purple-400'>{selectedUser.username}</h1>
                              {mess.content}
                          </div>
                            
                        <button onClick={() => deletePrivateMessage(mess)} className="group-hover:block hidden">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500 ml-4 mb-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                        </div>
                      )
                    }

                    </div>
                  </>
                    
                ))}
              </div>
            </div>
          ): selectedGroup  ? (
            <div className="bg-white h-[28.5rem] rounded-lg py-2 sm:p-4 ">
                <div className='flex justify-between mb-4'>
                  <div className='flex border-b-2 border-blue-400 shadow-lg w-full'>
                    <div className="w-12 h-12 rounded-full shadow-md flex justify-center bg-blue-700 text-lg text-white p-3">
                      {(selectedGroup.groupName).charAt(0).toUpperCase()}
                    </div>
                    <div className='ml-2'>
                        <h2 className='className="text-lg font-bold'> {selectedGroup.groupName}</h2>
                        <h2 className="text-md  mb-2"> {selectedGroup.selectedMembers.join(', ')} </h2>
                    </div>
                  </div>
                  {selectedGroup.admin === newUser && nonGroupMembers.length > 0 ? (
                    <div className='bg-blue-700  rounded-full shadow-md cursor-pointer  w-12 h-12 ' onClick={() => setIsModalOpen1(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className=" text-white font-bold ">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                        </svg>
                    </div>
                  ):('')}
                <Modal
                isOpen={isModalOpen1}
                onRequestClose={() => setIsModalOpen1(false)} 
                style={{
                  overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  },
                  content: {
                    maxWidth: '400px',
                    maxHeight:'500px',
                    margin: 'auto',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  },
                }}
                >
                <div className='flex justify-center'>
                  <div>
                      <h2  className='text-xl lg:text-2xl font-bold font-serif text-purple-600 mb-10'>Add Client</h2>
                      {nonGroupMembers.map((user) => (
                      <div key={user.id}>
                        <input
                        type="checkbox" 
                        value={user.username} 
                        onChange={(e) => {
                          if(e.target.checked){
                            setSelectedUsers([...selectedUsers, e.target.value]);
                          }else{
                            setSelectedUsers(selectedUsers.filter((username)=>username !== e.target.value));
                          }
                        }}
                        /> {user.username}
                      </div>
                    ))}
                    <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-10 hover:bg-blue-800"
                    onClick={()=>addUsersToGroup(selectedGroup.groupId,selectedUsers)}
                    >
                      Add
                    </button>
                  </div>
                </div>
                </Modal>
                </div>
                <div className="overflow-y-scroll h-[20rem] ">
                    {groupMessages[selectedGroup.groupId] && groupMessages[selectedGroup.groupId].map((mess, index) => (
                        <>
                          <div className='flex group' key={index}>
                                <div
                                key={index}
                              
                                className='bg-purple-600 text-white  text-lg  w-[1/2] p-2 rounded-br-md rounded-tl-md rounded-tr-md  mb-2 '
                                >
                                  <h1 className='text-gray-400 text-center'>{mess.fromName}</h1>
                                  {mess.content}
                                </div>
                                <button onClick={() => deleteGroupMessage(mess)} className="group-hover:block hidden">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500 ml-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                          </div>
                        </>
                      ))} 
                </div>
            </div>
          ) : activeLink=='broadcast' ? (
            <div className="overflow-y-scroll h-[28.5rem] bg-white p-3 ">
              { publicMessages.map((message, index) => (
                <>
                  <div className='flex-col ' key={index}>
                      <div className='flex mt-4 group'>
                          <div
                            key={index}
                            className=
                            //   `${
                            //   message.type === 'received'
                            //     ? 'bg-blue-500 text-white'
                            //     : 'bg-blue-100 text-black'
                            // }
                            //group hover:none
                            //group-hover:block
                              
                            " bg-purple-600 text-white text-lg p-2 rounded-br-md rounded-tl-md rounded-tr-md px-2 group-hover:visible"
                          >
                          <h1 className='text-gray-400 text-center'>{message.fromName}</h1> 
                          {message.content}
                          </div>
                            <button onClick={() => deletePublicMessage(message)} className="hidden group-hover:block ">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500 ml-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                      </div>
                  </div>
                </>
                ))}
            </div>
          ): ('') 
          }
           {/* <div className='w-[full] flex justify-end mr-2 mt-6'>
              <div className=' bg-blue-700 w-10 h-10 flex justify-center  mb-4 mt-2 visible lg:hidden rounded-lg '>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-white" ref = {showAllSalon} onClick={showMenuSalon}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
              </div>
            </div> */}
            <div className='w-full'>
                <form className="bg-white rounded-lg  sm:p-4" onSubmit={sendMessage}>
                  <div className='flex '>
                    <input
                      type="text"
                      className="appearance-none block rounded-bl-2xl rounded-tl-2xl rounded-tr-xl border w-full border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm px-4 py-2  mr-2 "
                      placeholder="Entrez votre message"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg  hover:bg-blue-800"   onClick={sendMessage} type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-7">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    </button>
                  </div>
                </form>
            </div>
          </div>
          </div>
        </div>
      </>

      ):(
      <div className=''>
        <div className="flex justify-center bg-blue-100 py-4 border-b-2 border-purple-600 shadow-lg" >
            <h1 className="text-4xl font-extrabold font-serif text-blue-600  ">Chat App</h1>
        </div>
         <div className='flex justify-center mt-4 border-2'>
            <div className='border-2 border-purple-600  rounded-2xl shadow-lg mb-2  '>
                <div className='flex justify-center p-1 sm:p-4 bg-gray-50 rounded-t-2xl'>
                    <div className='flex justify-center p-1 sm:p-4 bg-gray-50 rounded-t-2xl'>
                        <button
                          onClick={handleChangeLogin}
                          className={`text-center text-3xl font-bold font-serif border rounded-md p-2 border-purple-800 ${
                            login
                              ? 'text-purple-600 bg-purple-100'
                              : 'text-blue-500 hover:text-purple-300'
                          }`}
                        >
                          Login
                        </button>
                        <button
                          onClick={handleChangeRegister}
                          className={`text-center text-3xl font-bold font-serif border rounded-md p-2 border-purple-800 ml-4 ${
                            register
                              ? 'text-purple-600 bg-purple-100'
                              : 'text-blue-500 hover:text-purple-300'
                          }`}
                        >
                          Register
                        </button>
                    </div>
                </div>
                {
                  login? (
                    <>
                      <div className="flex items-center justify-center bg-gray-50  py-12 px-4 sm:px-6 lg:px-8 rounded-b-2xl ">
                          <div className="space-y-8">
                              <div className=''>
                                  <div className="relative w-[250px] sm:w-[350px] h-[140px] sm:h-[250px] ">
                                    <img src="/photos/login.jpg" alt='' className="absolute inset-0 w-full h-full object-cover">
                                    </img>
                                  </div>
                              </div>
                              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                                  <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-purple-600">
                                      Username
                                    </label>
                                    <input
                                      id="username"
                                      name="username"
                                      type="text"
                                      value={username}
                                      onChange={(e) => setUsername(e.target.value)}
                                      autoComplete="username"
                                      required
                                      className="mt-1 p-2 appearance-none block w-full rounded-md border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-purple-700">
                                      Password
                                    </label>
                                    <input
                                      id="password"
                                      name="password"
                                      type="password"
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      autoComplete="current-password"
                                      required
                                      className="mt-1 p-2 appearance-none block w-full rounded-md border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                  </div>
                                  <div>
                                    <button
                                      type="submit"
                                      onClick={handleLogin}
                                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent font-semibold font-serif rounded-md text-white bg-blue-500 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      Login
                                    </button>
                                  </div>
                              </form>
                          </div>
                      </div>
                    </> 
                  ):('')
                }
                {
                  register? (
                    <>
                      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 rounded-b-2xl ">
                          <div className="max-w-md w-full space-y-8">
                            <div className='w-auto'>
                              <div className="relative w-[250px] sm:w-[350px] h-[140px] sm:h-[250px]">
                                <img src="/photos/register.jpg" alt='' className="absolute inset-0 w-full h-full object-cover">
                                </img>
                              </div>
                            </div>
                            <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                                <div>
                                  <label htmlFor="username" className="block text-sm font-medium text-purple-700">
                                  Username
                                  </label>
                                  <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={usernameR}
                                    onChange={(e) => setUsernameR(e.target.value)}
                                    autoComplete="username"
                                    required
                                    className="mt-1 p-2 appearance-none block w-full rounded-md border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="password" className="block text-sm font-medium text-purple-700">
                                    Password
                                  </label>
                                  <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={passwordR}
                                    onChange={(e) => setPasswordR(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    className="mt-1 p-2 appearance-none block w-full rounded-md border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  />
                                </div>
                                <div>
                                  <button
                                    type="submit"
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent font-semibold font-serif rounded-md text-white bg-blue-500 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    Create account
                                  </button>
                                </div>
                            </form>
                          </div>
                      </div>
                    </>
                  ):('')
                }  
            </div>
        </div> 
      </div>
      )
    }
  </div>
  );
};

export default Chat;





















