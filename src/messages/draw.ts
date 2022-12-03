import { bot } from "../config";
import { getContext } from "./_";

import sharp from "sharp";
import { resolve } from "path";
// import { promises as fs } from "fs";
import { imreadAsync, imwriteAsync } from "opencv4nodejs-prebuilt";
import { tmpdir } from "os";
import fetch from "node-fetch";

import { emoji } from "node-emoji";

const [maxWidth, maxHeight] = [700, 700];

const SESS_ID = Math.round(Date.now() * Math.random());
const tmp = (() => {
  const prefix = resolve(tmpdir(), `dod-vk-${SESS_ID}-`);

  return (file: string) => prefix + file;
})();

export default bot.updates.on("message", async (msg, next) => {
  if (msg.peerId < 1 || msg.peerId > 2e9 || msg.touched) {
    return next();
  }

  const { text, command } = await getContext(msg);

  if (command === "draw-help") {
    msg.touched = true;

    await msg.send(`
${emoji.pencil2} Чтобы нарисовать картинку на парте напишите "нарисуй" и приложите изображение ${emoji.sunrise_over_mountains}
`);

    return next();
  }
  if (text === "нарисуй") {
    msg.touched = true;

    if (!msg.hasAttachments("photo")) {
      await msg.send(`Пожалуйста повторите попытку прикрепив фотографию`);
      return next();
    }

    const gMaskPath = tmp("grayscale-mask.png");
    const giMaskPath = tmp("inverted-mask.png");

    const cMaskPath = tmp("canny-mask.png");
    const jMaskPath = tmp("joined-mask.png");

    const imageURL = msg.getAttachments("photo")[0].largePhoto;

    if (!imageURL) {
      await msg.send(`Не удалось получить изображение!`);

      return next();
    }

    try {
      const orig = await fetch(imageURL)
        .then(res => res.buffer())
        .then(buf => sharp(buf));

      await msg.send(`Рисую...`);

      const { width: _width, height: _height } = await orig.metadata();

      if (!_width || !_height) {
        await msg.send(`Не удалось получить метаданные изображения`);

        return next();
      }

      const [width, height] =
        _width > _height
          ? [maxWidth, Math.round(maxWidth / (_width / _height))]
          : [Math.round((_width / _height) * maxHeight), maxHeight];

      await Promise.all([
        orig
          .resize(width, height, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .grayscale()
          .png()
          .toFile(gMaskPath),
        orig
          .resize(width, height, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .grayscale()
          .blur(2)
          .linear(0.6)
          .negate()
          .png()
          .toFile(giMaskPath)
      ]);

      const mask = await imreadAsync(gMaskPath);
      const cannyMask = await mask.cannyAsync(30, 30, 3, false);

      await imwriteAsync(cMaskPath, cannyMask);

      const cMask = await sharp(cMaskPath).blur(1).linear(0.6).png().toBuffer();

      await sharp(giMaskPath)
        .composite([
          {
            input: cMask,
            blend: "add"
          }
        ])
        .resize(width, height)
        .png()
        .toFile(jMaskPath);

      const buf = await sharp(jMaskPath)
        .resize(width, height)
        .grayscale()
        .raw()
        .toBuffer();

      const filtered = Array.from(buf)
        .map(pixel => [0, 0, Math.max(pixel, 150), pixel])
        .flat();

      const finalMask = await sharp(Buffer.from(filtered), {
        raw: { channels: 4, width, height }
      })
        .blur(0.5)
        .linear(0.9, -10)
        .median()
        .png()
        .toBuffer();

      const result = await sharp(resolve(__dirname, "desk.jpg"))
        .resize(width, height, { fit: "cover" })
        .composite([
          {
            input: finalMask
          }
        ])
        .png()
        .toBuffer();

      msg.jobDone = true;

      await msg.sendPhotos(result, {
        message: `Вот что получилось ${emoji.heart_eyes}`
      });

      await msg.send(
        "Бот не несёт ответственности за данное изображение, так-как результат полностью зависит от отправленной вами оригинальной картинки."
      );
    } catch {
      await msg.send(`Произошла ошибка при обработке изображения`);
    }
  }

  return next();
});
