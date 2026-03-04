const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/chat.controller");

router.get("/", controller.index);
router.get("/:roomChatId", controller.detail);
router.delete("/delete-room/:roomId", controller.deleteRoom);
router.delete("/delete-message/:messageId", controller.deleteMessage);

module.exports = router;

