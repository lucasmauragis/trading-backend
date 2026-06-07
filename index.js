const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors({ origin: "*", methods: ["POST", "GET", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.options("/grade", cors());
app.use(express.json({ limit: "10mb" }));

app.post("/grade", async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    const parsed = JSON.parse(text);
    const content = parsed.content?.[0]?.text || "{}";
    const match = content.match(/\{[\s\S]*\}/);
    const result = match ? match[0] : '{"correct":false,"correctAnswer":"no trade","correctOrder":"null","explanation":"Could not parse response","patternFound":"null"}';
    res.setHeader("Content-Type", "application/json");
    res.send(result);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Running"));
