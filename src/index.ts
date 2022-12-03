import { RequestContext, FunctionResponse, RequestEvent } from "./types";
import { Record as Rec, Literal, String as Str } from "runtypes";

import { bot, systemEvents } from "./config";

//#region Messages
import "./messages/_";

import "./messages/menu";
import "./messages/sashamasha";
import "./messages/marks";
import "./messages/draw";
import "./messages/salary";
import "./messages/car";

import "./messages/_sub_reminder";
import "./messages/_default";
//#endregion

const VKRequestBase = Rec({
  group_id: Literal(bot.options.pollingGroupId as number),
  secret: Literal(bot.options.webhookSecret as string)
});

const VKConfirmationRequest = VKRequestBase.And(
  Rec({
    type: Literal("confirmation")
  })
);

const VKEventRequest = VKRequestBase.And(
  Rec({
    type: Str,
    object: Rec({})
  })
);

export async function handler(
  _: RequestEvent,
  context: RequestContext
): Promise<FunctionResponse> {
  const req = context.getPayload();

  const isConfirmation = VKConfirmationRequest.validate(req).success;
  const isNormalEvent = VKEventRequest.validate(req).success;

  setTimeout(
    () => systemEvents.emit("deadline"),
    context.deadlineMs - Date.now() - 2000
  );

  process.on("uncaughtException", e => {
    systemEvents.emit("deadline");
    console.log(e);
  });

  process.on("unhandledRejection", e => {
    systemEvents.emit("deadline");
    console.log(e);
  });

  const confirmationResponse = {
    statusCode: 200,
    body: bot.options.webhookConfirmation || ""
  };

  const okResponse = { statusCode: 200, body: "ok" };

  const defaultResponse = {
    statusCode: 500,
    body: "error"
  };

  if (isConfirmation) {
    return confirmationResponse;
  } else if (isNormalEvent) {
    await bot.updates.handleWebhookUpdate(req);

    return okResponse;
  } else {
    return defaultResponse;
  }
}
