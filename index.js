require("dotenv").config();

async function queryModelWithFetch(inputText) {
  const MODEL_NAME = "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B"; // Change this to the model you want to use IMPORTANT

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: inputText,
        }),
      }
    );

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`); // Log the error status
      const errorText = await response.text(); // Get the error text
      console.error("Error response text:", errorText); // Log the error text
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Fetch response:", result); // Log the response for debugging
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function main() {
  try {
    // Using Fetch
    const response = await queryModelWithFetch(
      "Tell me a joke pleases"
    );
    console.log("Response:", response);
  } catch (error) {
    console.error("Main Error:", error);
  }
}

main();