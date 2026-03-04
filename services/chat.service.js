const RoomChat = require("../models/room-chat.model");
const Chat = require("../models/chat.model");

class ChatService {
    // Soft-delete một phòng chat (và tất cả tin nhắn trong đó)
    async deleteRoom(roomId) {
        const result = await RoomChat.updateOne(
            { _id: roomId },
            { deleted: true, deletedAt: new Date() }
        );
        // Xóa luôn tất cả tin nhắn thuộc room này
        await Chat.updateMany(
            { room_chat_id: roomId },
            { deleted: true }
        );
        return { modified: result.modifiedCount > 0 };
    }

    // Soft-delete một tin nhắn
    async deleteMessage(messageId) {
        const result = await Chat.updateOne(
            { _id: messageId },
            { deleted: true }
        );
        return { modified: result.modifiedCount > 0 };
    }
}

module.exports = new ChatService();
