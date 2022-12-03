import { MessageContext } from "vk-io";
import { bot } from "../config";

export async function prepareContext(msg: MessageContext) {
  const text = (msg.text || "").toLocaleLowerCase().trim();
  const clientId = msg.isInbox ? msg.senderId : msg.peerId;

  const groupId = msg.$groupId || 0;
  const clientData = await msg.vk.api.users
    .get({ user_ids: String(clientId) })
    .then(res => res[0]);

  const isSub = await msg.vk.api.groups.isMember({
    group_id: String(groupId),
    user_id: clientId
  });

  const payload = msg.messagePayload || {};
  const command = "command" in payload ? payload.command : "";
  const supportsInlineKB = msg.clientInfo.inline_keyboard;

  const personalClientMention = `@id${clientData.id} (${clientData.first_name})`;
  const fullClientMention = `@id${clientData.id} (${clientData.first_name} ${clientData.last_name})`;

  return {
    payload,
    command,
    supportsInlineKB,
    // state,
    personalClientMention,
    fullClientMention,
    text,
    groupId,
    // managersIds,
    clientData,
    clientId,
    isSub
  };
}

export async function getContext(msg: MessageContext) {
  if (msg.context) {
    return msg.context as ReturnType<typeof prepareContext>;
  }

  const context = await prepareContext(msg);

  msg.context = context;

  return context;
}

export default bot.updates.on("message", async (message, next) => {
  message.context = await prepareContext(message);

  await message.setActivity();

  return next();
});
