import VK from "vk-io";
// import API from "@vk-dk/api";
import { EventEmitter } from "events";

export const bot = new VK({
  token: process.env.VK_BOT_TOKEN,
  webhookSecret: process.env.VK_WEBHOOK_SECRET,
  webhookConfirmation: process.env.VK_WEBHOOK_CONFIRMATION,
  pollingGroupId: parseInt(process.env.VK_GROUP_ID || ""),
  apiMode: "parallel"
});

// export const admin = new API(process.env.USER_TOKEN || "");

export const systemEvents = new EventEmitter();
