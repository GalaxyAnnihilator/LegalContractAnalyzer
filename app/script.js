const converter = new showdown.Converter({ simpleLineBreaks: true });
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const selectFilesBtn = document.getElementById("selectFilesBtn");
  const fileList = document.getElementById("fileList");
  const systemPrompt = document.getElementById("systemPrompt");
  const savePromptBtn = document.getElementById("savePromptBtn");
  const statusIndicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");
  const statusMessage = document.getElementById("statusMessage");
  const docCount = document.getElementById("docCount");
  const embeddingStatus = document.getElementById("embeddingStatus");
  const chatContainer = document.getElementById("chatContainer");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  // State
  let uploadedFiles = [];
  let currentSystemPrompt = systemPrompt.value;
  let chatHistory = [];

  // Event Listeners
  dropzone.addEventListener("click", () => fileInput.click());
  selectFilesBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", handleFileSelect);

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("active");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("active");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("active");
    fileInput.files = e.dataTransfer.files;
    handleFileSelect({ target: fileInput });
  });

  savePromptBtn.addEventListener("click", saveSystemPrompt);

  userInput.addEventListener("keypress", (e) => {
    if (
      e.key === "Enter" &&
      userInput.value.trim() !== "" &&
      !userInput.disabled
    ) {
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  // Functions
  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter only PDFs
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length < files.length) {
      updateStatus("Some files were not PDFs and were ignored", "warning");
    }

    if (pdfFiles.length > 0) {
      uploadedFiles = [...uploadedFiles, ...pdfFiles];
      renderFileList();
      updateStatus(`${pdfFiles.length} PDF(s) selected`, "success");
      updateDocumentCount();
      enableChat();

      // Simulate processing
      setTimeout(() => {
        updateStatus("Processing documents...", "processing");
        setTimeout(() => {
          updateStatus("Documents processed and ready for queries", "success");
          embeddingStatus.textContent = "Ready";
        }, 2000);
      }, 500);
    }
  }

  function renderFileList() {
    fileList.innerHTML = "";
    uploadedFiles.forEach((file, index) => {
      const fileItem = document.createElement("div");
      fileItem.className =
        "flex items-center justify-between p-2 bg-gray-50 rounded-lg";
      fileItem.innerHTML = `
                        <div class="flex items-center">
                            <i class="fas fa-file-pdf text-red-500 mr-2"></i>
                            <span class="text-sm truncate max-w-xs">${file.name}</span>
                        </div>
                        <button class="text-red-500 hover:text-red-700" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
      fileList.appendChild(fileItem);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll("#fileList button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.getAttribute("data-index"));
        uploadedFiles.splice(index, 1);
        renderFileList();
        updateDocumentCount();
        if (uploadedFiles.length === 0) {
          disableChat();
          embeddingStatus.textContent = "None";
        }
      });
    });
  }

  function updateDocumentCount() {
    docCount.textContent = uploadedFiles.length;
  }

  function saveSystemPrompt() {
    currentSystemPrompt = systemPrompt.value;
    updateStatus("System prompt saved successfully", "success");

    // Add system message to chat
    addMessageToChat(
      "system",
      "System prompt updated: " + currentSystemPrompt.substring(0, 50) + "..."
    );
  }

  function updateStatus(message, type) {
    statusText.textContent = message;

    // Reset classes
    statusIndicator.className = "w-3 h-3 rounded-full mr-2";
    statusMessage.className = "flex items-center p-3 rounded-lg";

    switch (type) {
      case "success":
        statusIndicator.classList.add("bg-green-500");
        statusMessage.classList.add("bg-green-50");
        break;
      case "warning":
        statusIndicator.classList.add("bg-yellow-500");
        statusMessage.classList.add("bg-yellow-50");
        break;
      case "error":
        statusIndicator.classList.add("bg-red-500");
        statusMessage.classList.add("bg-red-50");
        break;
      case "processing":
        statusIndicator.classList.add("bg-indigo-500", "status-pulse");
        statusMessage.classList.add("bg-indigo-50");
        break;
      default:
        statusIndicator.classList.add("bg-gray-400");
        statusMessage.classList.add("bg-gray-100");
    }
  }

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

    // Add placeholder bot message and keep reference
    const botMessageElement = addMessageToChat("bot", "Thinking...");

    // Get real bot response
    const botResponse = await generateBotResponse(message);

    // Replace content of placeholder
    botMessageElement.querySelector(".chat-message").innerHTML = botResponse;
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
      botIcon.innerHTML = '<i class="fas fa-robot text-gray-500 mt-1"></i>';
      messageDiv.appendChild(botIcon);
    }

    messageDiv.appendChild(messageContent);

    if (sender === "user") {
      const userIcon = document.createElement("div");
      userIcon.className = "flex-shrink-0 ml-2";
      userIcon.innerHTML = '<i class="fas fa-user text-indigo-200 mt-1"></i>';
      messageDiv.appendChild(userIcon);
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    chatHistory.push({ sender, message });

    return messageDiv;
  }

  async function generateBotResponse(userMessage) {
    if (uploadedFiles.length === 0) {
      return "Please upload documents first so I can provide accurate answers based on their content.";
    }

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
                // wrap in your styled block
                thinkHtml = `<div class="thinking-block">${thinkText
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\n/g, "<br>")}</div>\n\n`;
              }

              // 2) Remove the original <think>…</think> from the markdown body
              const withoutThink = fullReply
                .replace(/<think>[\s\S]*?<\/think>/, "")
                .trim();

              // 3) Convert the rest via Showdown
              const restHtml = converter.makeHtml(withoutThink);

              // 4) Combine
              messageDiv.querySelector(".chat-message").innerHTML =
                thinkHtml + restHtml;
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          } catch (err) {
            console.warn("Could not parse stream chunk:", err);
          }
        }
      }
    }
  }

  // Initialize
  disableChat();
});
