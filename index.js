import express from "express";
import { lineMiddleware, eventHandle, lineClient } from "./line.js";
import { redisRouter } from "./redis.js";

const app = express();

app.post("/callback", lineMiddleware, (req, res) => {
  Promise.all(req.body.events.map(eventHandle))
    .then((result) => res.json(result))
    .catch((err) => errorHandle(err, res));
});

function errorHandle(error, res) {
  console.error("error", error);
  if (error.name === "chatGPT") {
    let responseMessage = "GPT異常，請報修工程師。";
    if (error.status === 429) {
      responseMessage = "GPT暫時無法使用，請稍後再試。";
    }
    res.json(
      lineClient.replyMessage(error.replyToken, {
        type: "text",
        text: responseMessage,
      })
    );
  } else {
    res.status(500).end();
  }
}

app.use("/redis", redisRouter);

// ポート番号は Render が提供する process.env.PORT を使う
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.info(`✅ listening on ${port}`);
});

