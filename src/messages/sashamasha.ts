import { bot } from "../config";
import { getContext } from "./_";
import { emoji } from "node-emoji";

function getRelations(compat: number, genderDiff = Math.random() > 0.5) {
  switch (Math.floor(compat / 10)) {
    case 0:
      return `Злейшие враги ${emoji.imp}`;
    case 1:
      return `Враги ${emoji.rage}`;
    case 2:
      return `Безразличие ${emoji.neutral_face}`;
    case 3:
      return `Знакомые ${emoji.ghost}`;
    case 4:
      return genderDiff
        ? `Нервнодушее ${emoji.love_letter}`
        : `Товарищество ${emoji.smirk_cat}`;
    case 5:
      return genderDiff ? `Френдзона ${emoji.cupid}` : `Друзья ${emoji.muscle}`;
    case 6:
      return genderDiff
        ? `Любовь ${emoji.sparkling_heart}`
        : `Лучшие друзья ${emoji.joy}`;
    case 7:
      return `Уважение ${emoji.sunglasses}`;
    case 8:
      return emoji.heart;
    case 9:
      return `Приятельство ${emoji.upside_down_face}`;
    default:
      return "";
  }
}

export default bot.updates.on("message", async (msg, next) => {
  if (msg.peerId < 1 || msg.peerId > 2e9 || msg.touched) {
    return next();
  }

  const { text, command } = await getContext(msg);

  if (command === "pair-relations-help") {
    msg.touched = true;

    await msg.send(`${emoji.heart} Чтобы проверить совместимость напишите что-то на подобие
Саша + Маша
или
@id1 (Павел) + @id500000000 (Дмитрий)`);

    return next();
  }

  const basicMatch = /^([а-я\s]+)\s+\+\s+([а-яё\s]+)$/.exec(text);
  const mentionMatch = /^(\[id([0-9]+)\|(.*?)\])\s+\+\s+(\[id([0-9]+)\|(.*?)\])$/.exec(
    text
  );

  if (mentionMatch) {
    msg.touched = true;
    msg.jobDone = true;

    const [, , id1, name1, , id2, name2] = mentionMatch;
    const [u1, u2] = await msg.vk.api.users.get({
      user_ids: [id1, id2],
      fields: ["sex"]
    });

    await msg.send(`Идёт проверка совместимости...`);

    const compat = Math.abs(u1.id - u2.id) % 100;
    const genderDiff = u1.sex !== u2.sex;

    const status = getRelations(compat, genderDiff);

    await msg.send(
      `@id${id1} (${name1}) + @id${id2} (${name2}) = ${status}\n\n${emoji.bar_chart} Совместимость: ${compat}%`
    );

    return next();
  }

  if (basicMatch) {
    msg.touched = true;
    msg.jobDone = true;

    const compat = Math.floor(Math.random() * 100);
    const status = getRelations(compat);
    const [, name1, name2] = basicMatch;

    await msg.send(
      `${name1} + ${name2} = ${status}\n\n${emoji.bar_chart} Совместимость: ${compat}%`
    );

    return next();
  }

  return next();
});
