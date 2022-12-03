import { bot } from "../config";
import { getContext } from "./_";
import { emoji } from "node-emoji";
import { Keyboard } from "vk-io";

export default bot.updates.on("message", async (msg, next) => {
  if (msg.peerId < 1 || msg.peerId > 2e9 || msg.touched) return next();
  const { text, command } = await getContext(msg);

  if (
    command === "star" ||
    command === "menu" ||
    text === "меню" ||
    text === "привет" ||
    text === "начать" ||
    text === "обновить"
  ) {
    msg.touched = true;

    await msg.send(
      `${emoji.robot_face} Для управления используй кнопки бота ${emoji.point_down}`,
      {
        keyboard: Keyboard.builder()
          .textButton({
            label: `${emoji.pencil} Нарисовать`,
            color: Keyboard.PRIMARY_COLOR,
            payload: {
              command: "draw-help"
            }
          })
          .row()
          .textButton({
            label: `${emoji.money_with_wings} Узнать мою з/п`,
            color: Keyboard.POSITIVE_COLOR,
            payload: {
              command: "salary"
            }
          })
          .row()
          .textButton({
            label: `${emoji.heart} Узнать совместимость`,
            color: Keyboard.SECONDARY_COLOR,
            payload: { command: "pair-relations-help" }
          })
          .row()
          .textButton({
            label: `${emoji.five} Оценки`,
            color: Keyboard.SECONDARY_COLOR,
            payload: {
              command: "show-school-marks"
            }
          })
          .row()
          .textButton({
            label: `${emoji.recycle} Обновить меню`,
            color: Keyboard.SECONDARY_COLOR,
            payload: {
              command: "menu"
            }
          })
        // .oneTime(!supportsInlineKB)
        // .inline(supportsInlineKB)
      }
    );
  }

  return next();
});
