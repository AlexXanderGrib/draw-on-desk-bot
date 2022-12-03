import { bot } from "../config";

export default bot.updates.on("message", async (_msg, next) => {
  // if (msg.peerId < 1 || msg.peerId > 2e9 || msg.touched) {
  return next();
  // }
});
