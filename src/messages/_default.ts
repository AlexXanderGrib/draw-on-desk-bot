import { bot } from "../config";
import { getContext } from "./_";
import { emoji } from "node-emoji";
import { Keyboard } from "vk-io";

export default bot.updates.on("message", async (msg, next) => {
  if (msg.peerId < 1 || msg.peerId > 2e9 || msg.touched) {
    return next();
  }
  const { supportsInlineKB } = await getContext(msg);

  await msg.send(
    `${emoji.robot_face} Извини, но я не понял твоей команды! \n\n Чтобы открыть меню пиши "меню"`,
    {
      keyboard: Keyboard.builder()
        .textButton({
          color: Keyboard.POSITIVE_COLOR,
          label: "Меню",
          payload: {
            command: "menu"
          }
        })
        .inline(supportsInlineKB)
        .oneTime(!supportsInlineKB)
    }
  );

  return next();
});
