const { Server } = require("socket.io");

const PORT = 8900;

const io = new Server(PORT, {
    cors: {
        origin: "http://localhost:5173", // Allow connection from your frontend
    },
});

let activeUsers = [];

const addUser = (userId, socketId) => {
    // Add user to activeUsers if they are not already there
    if (!activeUsers.some((user) => user.userId === userId)) {
        activeUsers.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return activeUsers.find((user) => user.userId === userId);
};

// This block runs every time a user connects to this server
io.on("connection", (socket) => {
    
    // 1. A user connects
    console.log(`A user connected. Socket ID: ${socket.id}`);

    // 2. Client sends "addUser" event with their userId
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", activeUsers); // Send updated list of online users to all clients
        console.log("Active users:", activeUsers);
    });

    // 3. Client sends "sendMessage" event
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const receiver = getUser(receiverId);
        if (receiver) {
            // Send "getMessage" event only to the specific receiver
            io.to(receiver.socketId).emit("getMessage", {
                senderId,
                text,
            });
            console.log(`Message sent from ${senderId} to ${receiverId}`);
        }
    });

    // 4. A user disconnects
    socket.on("disconnect", () => {
        console.log(`A user disconnected. Socket ID: ${socket.id}`);
        removeUser(socket.id);
        io.emit("getUsers", activeUsers); // Update online users list for everyone
    });
});

console.log(`Socket.IO server is running on port ${PORT}`);