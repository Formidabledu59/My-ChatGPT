// backend/controllers/conversationController.mjs
import fetch from 'node-fetch';

const addMessage = async (req, res) => {
  const { inputText } = req.body;
  const MODEL_NAME = "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: inputText }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    res.json(result[0].generated_text);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

export { addMessage };

