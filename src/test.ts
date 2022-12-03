import sharp from "sharp";
import { resolve } from "path";
// import { promises as fs } from "fs";
import { imreadAsync, imwriteAsync } from "opencv4nodejs-prebuilt";
import { tmpdir } from "os";

const [width, height] = [512, 512];

// const counter = (() => {
//   let i = 0;

//   return () => ++i;
// })();

const SESS_ID = Math.round(Date.now() * Math.random());
const tmp = (() => {
  const prefix = resolve(tmpdir(), `dod-vk-${SESS_ID}-`);

  return (file: string) => prefix + file;
})();

(async () => {
  const gMaskPath = tmp("grayscale-mask.png");
  const giMaskPath = tmp("inverted-mask.png");

  const cMaskPath = tmp("canny-mask.png");
  const jMaskPath = tmp("joined-mask.png");

  // console.log(cMaskPath, gMaskPath);

  await sharp(resolve(__dirname, "..", "misc", "example.jpg"))
    .resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .grayscale()
    .png()
    .toFile(gMaskPath);

  await sharp(resolve(__dirname, "..", "misc", "example.jpg"))
    .resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .grayscale()
    .blur(2)
    .linear(0.6)
    .negate()
    .png()
    .toFile(giMaskPath);

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

  await sharp(resolve(__dirname, "..", "misc", "desk.jpg"))
    .resize(width, height, { fit: "cover" })
    .composite([
      {
        input: finalMask
      }
    ])
    .png()
    .toFile("result.png");
})();
