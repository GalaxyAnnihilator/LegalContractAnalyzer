const converter = new showdown.Converter({ simpleLineBreaks: true });
const chatContainer = document.getElementById("chatContainer");
let chatHistory = [];

function enableChat() {
  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.placeholder = "Type your question here...";
}

function disableChat() {
  userInput.disabled = true;
  sendBtn.disabled = true;
  userInput.placeholder = "Upload documents to enable chat";
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  // Show user message
  addMessageToChat("user", message);
  userInput.value = "";

  // Get real bot response
  const botResponse = await generateBotResponse(message);

  // // Replace content of placeholder
  // botMessageElement.querySelector(".chat-message").innerHTML = botResponse;
}

function addMessageToChat(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `flex ${
    sender === "user" ? "justify-end" : "justify-start"
  }`;

  const messageContent = document.createElement("div");
  messageContent.className = `chat-message px-4 py-2 ${
    sender === "user" ? "user-message" : "bot-message"
  } slide-in`;

  messageContent.innerHTML = message;

  if (sender === "bot") {
    const botIcon = document.createElement("div");
    botIcon.className = "flex-shrink-0 mr-2";
    botIcon.innerHTML = '<i class="fas fa-robot text-gray-500"></i>';
    messageDiv.appendChild(botIcon);
  }

  messageDiv.appendChild(messageContent);

  if (sender === "user") {
    const userIcon = document.createElement("div");
    userIcon.className = "flex flex-shrink-0 ml-2 items-center";
    userIcon.innerHTML = '<i class="fas fa-user text-indigo-200"></i>';
    messageDiv.appendChild(userIcon);
  }

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  chatHistory.push({ sender, message });

  return messageDiv;
}

async function generateBotResponse(userMessage) {
  const payload = {
    model: "Qwen3-0.6B",
    messages: [{ role: "user", content: userMessage }],
    stream: true,
  };

  const response = await fetch(
    "https://glowing-workable-arachnid.ngrok-free.app/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer TRANMINHDUONGDEPTRAI",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok || !response.body) {
    throw new Error("Streaming failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullReply = "";
  let messageDiv;

  // Create and insert the message bubble early
  messageDiv = addMessageToChat("bot", ""); // Empty at first

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    // FastChat/OpenAI sends chunks as lines of JSON
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const dataStr = line.replace("data: ", "").trim();

        if (dataStr === "[DONE]") return;

        try {
          const json = JSON.parse(dataStr);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullReply += delta;
            const thinkMatch = fullReply.match(/<think>([\s\S]*?)<\/think>/);
            let thinkHtml = "";
            if (thinkMatch) {
              const thinkText = thinkMatch[1].trim();
              thinkHtml = `<div class="thinking-block bg-gray-100 border-l-4 border-blue-500 italic text-gray-600 p-3 my-2 rounded">${thinkText
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>")}</div>`;
            }

            // Remove the thinking tags from the markdown body
            const withoutThink = fullReply
              .replace(/<think>[\s\S]*?<\/think>/g, "")
              .trim();

            // Convert the rest via Showdown and update display
            const restHtml = converter.makeHtml(withoutThink);
            const finalHtml = thinkHtml + (restHtml || "");
            messageDiv.querySelector(".chat-message").innerHTML =
              finalHtml || " ";
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        } catch (err) {
          console.warn("Could not parse stream chunk:", err);
        }
      }
    }
  }
}

enableChat()