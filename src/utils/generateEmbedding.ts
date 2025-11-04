import { OpenAI } from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OpenAI API key in environment variables");
}

const openai = new OpenAI({ apiKey });

const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    if (!response.data[0]) {
      throw new Error("Failed to generate embedding");
    }

    // console.log("OpenAI Embedding Response:", response.data);
    const embedding = response.data[0].embedding;
    return embedding;
  } catch (err) {
    throw new Error("Failed to generate embedding");
  }
};

export default generateEmbedding;
