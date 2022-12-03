import { bot } from "../config";
import { getContext } from "./_";
// import { get } from "node-emoji";

// const photos = [
//   "photo-187119272_457259235",
//   "photo-187119272_457265780",
//   "photo-187119272_457265424",
//   "photo-187119272_457265233",
//   "photo-187119272_457264318",
//   "photo-187119272_457264179",
//   "photo-187119272_457260110",
//   "photo-187119272_457262789",
//   "photo-187119272_457258421",
//   "photo-187119272_457262673",
//   "photo-187119272_457262287",
//   "photo-187119272_457261535",
//   "photo-187119272_457260435"
// ];

export default bot.updates.on("message", async (msg, next) => {
  const { isSub, groupId } = await getContext(msg);

  if (msg.peerId < 1 || msg.peerId > 2e9 || isSub) {
    return next();
  }

  if (msg.jobDone) {
    await msg.send(
      `Я вижу, что ты ещё не подписан 😿
Может зайдёшь, и посмотришь крутые рисунки с парт?
🔥@public${groupId} (рисунки на партах)🔥`
    );
  }

  return next();
});
