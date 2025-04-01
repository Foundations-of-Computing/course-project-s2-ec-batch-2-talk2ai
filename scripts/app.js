src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
const GROQ_API_KEY = "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"; // Replace with your actual Groq API key
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function sendMessage() {
  const inputField = document.querySelector(".search-bar input");
  const userMessage = inputField.value.trim();

  if (!userMessage) return;

  displayMessage(userMessage, "user");
  inputField.value = ""; // Clear input field after sending
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL, // Groq's AI model (use the latest available model)
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 100,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    const botReply =
      response.data.choices?.[0]?.message?.content ||
      "That sounds fun! Tell me more. 😃";

    displayMessage(botReply, "bot");
    // speak(botReply);
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = "Oops! Something went wrong. Try again later.";
    displayMessage(errorMessage, "bot");
    // speak(errorMessage);
  }
}

function displayMessage(rawMessage, sender) {
  const message = marked.parse(rawMessage);
  const chatContainer = document.querySelector(".responses-div");
  const messageElement = document.createElement("div");

  chatContainer.style.opacity = 1;
  messageElement.classList.add("message");
  messageElement.classList.add(sender);

  messageElement.innerHTML = message;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Check if the SpeechRecognition API is available
if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
  // Use SpeechRecognition if available, otherwise fall back to webkitSpeechRecognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  // Create a new instance of the SpeechRecognition API
  const recognition = new SpeechRecognition();

  // Set the language for recognition
  recognition.lang = "en-US"; // You can change this to your preferred language

  // Set the recognition to continuous (i.e., it keeps listening)
  recognition.continuous = true;

  // Set interim results to true to get partial transcriptions
  recognition.interimResults = true;

  // Handle the recognition result event
  recognition.onresult = function (event) {
    let transcript = "";
    let interim = true;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        transcript += result[0].transcript;
        interim = false;
      } else {
        transcript += result[0].transcript + " (listening)";
      }
    }
    // Update the transcript text
    const inputField = document.querySelector(".search-bar input");
    inputField.focus();
    inputField.value = transcript;
    if (!interim) {
      const event = new KeyboardEvent("keypress", { key: "Enter" });
      inputField.dispatchEvent(event);
    }
  };

  // Handle the start button click event
  document.querySelector(".microphone-button").addEventListener("click", () => {
    recognition.start();
    console.log("Speech recognition started");
  });

  // Handle the error event
  recognition.onerror = function (event) {
    console.error("Speech recognition error", event.error);
  };

  // Handle the end event (recognition stops)
  recognition.onend = function () {
    console.log("Speech recognition ended");
  };
} else {
  alert("SpeechRecognition API is not supported by this browser.");
}

// Attach event listener to the input field
document
  .querySelector(".search-bar input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
