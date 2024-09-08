const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Google Generative AI
const apiKey = "AIzaSyBjZnFHYmLNAqgGU-fRwqfJw6UFiS25vKw"; // Use environment variable for API key
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Function to extract JSON from the response text
function extractJsonFromText(text) {
  const jsonRegex = /\[[\s\S]*\]/;
  const match = text.match(jsonRegex);
  return match ? match[0] : null;
}

app.post("/get-glossary-terms", async (req, res) => {
  const { content } = req.body;

  try {
    const result = await model.generateContent(`
      Extract important keywords or phrases from the following text, along with their meanings or definitions. 
      Format the response as a JSON array of objects, where each object has "keyword" and "meaning" properties.
      Provide only the JSON array without any additional text or formatting. Mention nouns, verbs, famous people and places, important dates (Apart from names of people and places, you should keep the keywords one word long). Also mention as many relevent words you can
      Text: ${content}
    `);

    const responseText = result.response.text();
    const jsonString = extractJsonFromText(responseText);

    if (!jsonString) {
      throw new Error("Failed to extract JSON from the API response");
    }

    const glossaryTerms = JSON.parse(jsonString);

    res.json({ glossaryTerms });
    console.log(glossaryTerms);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Failed to retrieve glossary terms");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});