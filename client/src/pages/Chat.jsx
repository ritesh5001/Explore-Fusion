import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Navbar from '../components/Navbar';

// Connect to Gateway (Port 5050)
const socket = io.connect("http://localhost:5050");

const Chat = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Room Name (Could be dynamic based on Trip ID)
  const room = "Global Travelers Lounge"; 

  useEffect(() => {
    // 1. Join Room on load
    if (user) {
      socket.emit("join_room", room);
    }

    // 2. Listen for history
    socket.on("load_history", (history) => {
      setMessageList(history);
    });

    // 3. Listen for incoming messages
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Cleanup listener to prevent duplicates
    return () => {
      socket.off("receive_message");
      socket.off("load_history");
    };
  }, [user]);

  const sendMessage = async () => {
    if (currentMessage !== "" && user) {
      const messageData = {
        room: room,
        author: user.name,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await socket.emit("send_message", messageData);
      
      // Add my own message to the list locally
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  if (!user) return <div className="text-center mt-20">Please Login to Chat</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">💬 {room}</h1>

        <div className="bg-white border rounded-lg shadow-md h-[500px] flex flex-col">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messageList.map((msg, index) => {
              const isMe = msg.author === user.name;
              return (
                <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${isMe ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>
                    <p className="text-sm font-bold mb-1">{msg.author}</p>
                    <p>{msg.message}</p>
                    <span className={`text-xs block text-right mt-1 ${isMe ? "text-blue-200" : "text-gray-500"}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              className="flex-1 border p-2 rounded outline-none focus:border-blue-500"
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(event) => setCurrentMessage(event.target.value)}
              onKeyPress={(event) => event.key === "Enter" && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;