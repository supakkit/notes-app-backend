import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    // console.log("OpenAI Embedding Response:", response.data);
    return response.data[0].embedding;
  } catch (err) {
    throw new Error("Failed to generate embedding");
  }
};

export default generateEmbedding;
