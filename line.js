import Line from "@line/bot-sdk";
import { replyText } from "./openAI.js";

let waitingList = [];

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const lineClient = new Line.Client(config);
const lineMiddleware = Line.middleware(config);

async function eventHandle(event) {
  console.info("new event", event);

  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  if (waitingList.includes(event.source.userId)) {
    return Promise.resolve(null);
  }

  waitingList = [...waitingList, event.source.userId];

  let responseMessage = "";

  try {
    responseMessage = await replyText(event.message.text, event.source.userId, event.replyToken);
  } catch (error) {
    throw error;
  } finally {
    waitingList = waitingList.filter((item) => item !== event.source.userId);
  }

  return lineClient.replyMessage(event.replyToken, responseMessage);
}

export { lineMiddleware, eventHandle, lineClient };
