import { bot } from "../config";
import { getContext } from "./_";
import { emoji } from "node-emoji";
import { Keyboard } from "vk-io";

enum SchoolSubjects {
  MATH = 0,
  RUSS = 1,
  LIT = 2,
  CHEM = 3,
  PHYS = 4,
  GEO = 5
}

const MATH = `${emoji["1234"]} Математика`,
  RUSS = `${emoji.a} Русский язык`,
  LIT = `${emoji.book} Литература`,
  CHEM = `🧪 Химия`,
  PHYS = `${emoji.atom_symbol} Физика`,
  GEO = `${emoji.earth_africa} География`;

export default bot.updates.on("message", async (msg, next) => {
  if (msg.peerId < 1 || msg.peerId > 2e9 || msg.touched) {
    return next();
  }

  const {
    text,
    command,
    payload,
    supportsInlineKB,
    clientId
  } = await getContext(msg);

  if (
    command === "show-school-marks" &&
    Array.isArray(payload.subject) &&
    payload.subject[0] in SchoolSubjects
  ) {
    msg.touched = true;

    const dof = new Date().getDate();
    const [id, displayName] = payload.subject;
    const mark = (clientId + dof + id) % 4;

    await msg.send(`По предмету ${displayName} ты получишь ${mark + 2}`, {
      keyboard: Keyboard.builder()
        .textButton({
          label: `Другие предметы`,
          payload: { command: "show-school-marks" }
        })
        .row()
        .textButton({
          label: "Меню",
          payload: {
            command: "menu"
          }
        })

        .oneTime(!supportsInlineKB)
        .inline(supportsInlineKB)
    });

    msg.jobDone = true;

    return next();
  }

  if (text === "узнать оценки" || command === "show-school-marks") {
    msg.touched = true;

    await msg.send(
      `${emoji.five} Чтобы узнать свои оценки по предмету выбери его используя кнопки бота
    
${emoji.point_down}${emoji.point_down}${emoji.point_down}`,
      {
        keyboard: Keyboard.builder()
          .textButton({
            color: Keyboard.PRIMARY_COLOR,
            label: MATH,
            payload: {
              command: "show-school-marks",
              subject: [SchoolSubjects.MATH, MATH]
            }
          })
          .row()
          .textButton({
            color: Keyboard.PRIMARY_COLOR,
            label: RUSS,
            payload: {
              command: "show-school-marks",
              subject: [SchoolSubjects.RUSS, RUSS]
            }
          })
          .row()
          .textButton({
            color: Keyboard.PRIMARY_COLOR,
            label: LIT,
            payload: {
              command: "show-school-marks",
              subject: [SchoolSubjects.LIT, LIT]
            }
          })
          .row()
          .textButton({
            color: Keyboard.PRIMARY_COLOR,
            label: PHYS,
            payload: {
              command: "show-school-marks",
              subject: [SchoolSubjects.PHYS, PHYS]
            }
          })
          .row()
          .textButton({
            color: Keyboard.PRIMARY_COLOR,
            label: CHEM,
            payload: {
              command: "show-school-marks",
              subject: [SchoolSubjects.CHEM, CHEM]
            }
          })
          .row()
          .textButton({
            color: Keyboard.PRIMARY_COLOR,
            label: GEO,
            payload: {
              command: "show-school-marks",
              subject: [SchoolSubjects.GEO, GEO]
            }
          })
          .oneTime(!supportsInlineKB)
          .inline(supportsInlineKB)
      }
    );

    return next();
  }

  return next();
});
