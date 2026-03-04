const RoomChat = require("../../models/room-chat.model");
const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const chatService = require("../../services/chat.service");
const createLog = require("../../helpers/activityLog");
const systemConfig = require("../../config/system");
const prefixAdmin = systemConfig.prefixAdmin;

// [GET] /admin/chat
module.exports.index = async (req, res) => {
    // Lấy danh sách tất cả các Room Chat đang active để render vào Cột Bên Trái
    const roomChats = await RoomChat.find({ deleted: false }).populate("user_id", "fullName avatar statusOnline");

    res.render("admin/pages/chat/index", {
        pageTitle: "Hỗ trợ khách hàng",
        currentPage: "chat",
        roomChats: roomChats,
        activeRoom: null, // Chưa chọn room nào
        chats: [] // Chưa có tin nhắn
    });
};

// [GET] /admin/chat/:roomChatId
module.exports.detail = async (req, res) => {
    try {
        const roomChatId = req.params.roomChatId;
        
        // Vẫn phải lấy list room cho Cột Bên Trái
        const roomChats = await RoomChat.find({ deleted: false }).populate("user_id", "fullName avatar statusOnline");
        
        // Lấy tin nhắn của room đã chọn cho Cột Bên Phải
        const chats = await Chat.find({ room_chat_id: roomChatId, deleted: false })
            .sort({ createdAt: "asc" })
            .limit(50);
            
        // Tìm thông tin khách hàng sở hữu room này
        const activeRoom = await RoomChat.findOne({ _id: roomChatId, deleted: false }).populate("user_id", "fullName avatar phone statusOnline");

        if(!activeRoom) {
            return res.redirect(`${req.app.locals.prefixAdmin}/chat`);
        }

        res.render("admin/pages/chat/index", {
            pageTitle: `Trò chuyện cùng ${activeRoom.user_id.fullName}`,
            currentPage: "chat",
            roomChats: roomChats,
            activeRoom: activeRoom,
            chats: chats
        });
    } catch (error) {
        console.log(error);
        res.redirect(`${req.app.locals.prefixAdmin}/chat`);
    }
};

// [DELETE] /admin/chat/delete-room/:roomId
module.exports.deleteRoom = async (req, res) => {
    try {
        const { modified } = await chatService.deleteRoom(req.params.roomId);
        if (modified) {
            createLog(req, res, {
                action: "delete",
                module: "chat",
                description: `Xóa phòng chat (ID: ${req.params.roomId})`
            });
            res.json({ code: 200, message: "Xóa phòng chat thành công!" });
        } else {
            res.json({ code: 400, message: "Phòng không tồn tại hoặc đã bị xóa!" });
        }
    } catch (error) {
        console.log("Delete room error:", error);
        res.json({ code: 500, message: "Có lỗi xảy ra!" });
    }
};

// [DELETE] /admin/chat/delete-message/:messageId
module.exports.deleteMessage = async (req, res) => {
    try {
        const { modified } = await chatService.deleteMessage(req.params.messageId);
        if (modified) {
            createLog(req, res, {
                action: "delete",
                module: "chat",
                description: `Xóa tin nhắn (ID: ${req.params.messageId})`
            });
            res.json({ code: 200, message: "Xóa tin nhắn thành công!" });
        } else {
            res.json({ code: 400, message: "Tin nhắn không tồn tại!" });
        }
    } catch (error) {
        console.log("Delete message error:", error);
        res.json({ code: 500, message: "Có lỗi xảy ra!" });
    }
};

