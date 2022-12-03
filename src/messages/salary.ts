import { bot } from "../config";
import { getContext } from "./_";
import { emoji } from "node-emoji";

const min = 1e4;
const max = 1e5;
const step = 1e3;

export default bot.updates.on("message", async (msg, next) => {
  if (msg.peerId < 1 || msg.peerId > 2e9 || msg.touched) {
    return next();
  }
  const { command, clientId, text } = await getContext(msg);

  if (command === "salary" || text === "зарплата") {
    msg.touched = true;

    const random = Math.floor(Math.random() * step) - Math.round(step / 2);
    const base = (clientId % Math.round((max - min) / step)) * step;

    const salary = base + random;

    await msg.send(`${
      emoji.money_with_wings
    } Твоя зарплата будет ${salary}₽/мес.
${emoji.moneybag} С учётом НДФЛ: ${salary - Math.ceil(salary * 0.13)}₽`);

    msg.jobDone = true;
  }

  return next();
});
