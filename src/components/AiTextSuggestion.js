import { useState } from "react";
import axios from "axios";

export default function AiTextSuggestion({ prompt, handlePopulateDesc }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(null);

  const handleGetSuggestion = async () => {
    try {
      if (prompt?.length < 10) {
        throw new Error("prompt must be at least 10 characters");
      }
      setSuggestions([]);
      setIsSubmitting(true);
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "Serve as a text suggestion tool, generating alternative phrases or sentences for the given text prompt. Offer a variety of suggestions to enhance the original text and generate a response that does not exceed 200 characters.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 50,
          n: 3,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      setSuggestions(
        response.data.choices.map((choice) => choice.message.content)
      );
    } catch (error) {
      setIsError(error?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="generateSuggestion">
      <div className="heading">
        Consider other suggestions generated by OpenAI?
        <span>
          <button
            className="generateButton"
            type="button"
            onClick={handleGetSuggestion}
          >
            {isSubmitting ? "Generating ..." : "Click here"}
          </button>
          <button
            className="clearButton"
            type="button"
            onClick={() => {
              setSuggestions([]);
              setIsError(null);
            }}
          >
            Clear
          </button>
        </span>
      </div>
      {isError && <span className="error">{isError}</span>}
      {suggestions?.length ? (
        <ul className="list">
          {suggestions?.map((item, index) => (
            <li
              key={index}
              className="item"
              onClick={() => handlePopulateDesc(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
