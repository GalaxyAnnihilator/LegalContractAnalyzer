document.addEventListener("DOMContentLoaded", function () {
  waitForSupabaseClient().then(() => {
    fetchExistingSupabasePDFs();
  });

  // Waits for SUPABASE_KEY and SUPABASE_URL to be set
  function waitForSupabaseClient() {
    return new Promise((resolve) => {
      function check() {
        if (typeof supabase_client !== 'undefined' && supabase_client && supabase_client.storage) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      }
      check();
    });
  }
  // ─── Fetch Existing PDFs from Supabase ─────────────────────────────
  async function fetchExistingSupabasePDFs() {
    if (typeof listPDFs !== "function") {
      console.warn("listPDFs() not found. Supabase client not loaded?");
      return;
    }
    try {
      const files = await listPDFs();
      if (Array.isArray(files)) {
        files.forEach(f => {
          if (f.name === '.emptyFolderPlaceholder') return; // Skip placeholder
          if (!uploadedFiles.some(uf => uf.name === f.name)) {
            uploadedFiles.push({ name: f.name, type: "application/pdf", fromSupabase: true });
            embeddedFiles[f.name] = true;
          }
        });
        renderFileList();
        updateDocumentCount();
        if (uploadedFiles.length > 0) {
          enableChat();
          showEmbedButton();
          embeddingStatus.textContent = "Uploaded";
        }
        updateStatus("Succesfully fetched previously uploaded pdfs")
      }
    } catch (err) {
      console.error("Error fetching Supabase PDFs:", err);
    }
  }
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
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  // Embed Documents Button
  let embedBtn = null;

  // State
  let uploadedFiles = [];
  let currentSystemPrompt = systemPrompt.value;
  let chatHistory = [];
  let embeddedFiles = {}; // { filename: true/false }

  // Event Listeners
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
  // ─── Handles File Selection and Validation ─────────────────────────────
  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter only PDFs
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length < files.length) {
      updateStatus("Some files were not PDFs and were ignored", "warning");
    }

    if (pdfFiles.length > 0) {
      // Only add files not already present (by name)
      pdfFiles.forEach(f => {
        if (!uploadedFiles.some(uf => uf.name === f.name)) {
          uploadedFiles.push(f);
        }
      });
      renderFileList();
      updateStatus(`${pdfFiles.length} PDF(s) selected`, "success");
      updateDocumentCount();
      enableChat();

      // Show Embed Documents button if not present
      showEmbedButton();

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

  // ─── Renders Uploaded Files List to Sidebar ────────────────────────────
  function renderFileList() {
    fileList.innerHTML = "";
    uploadedFiles.forEach((file, index) => {
      const fileItem = document.createElement("div");
      fileItem.className =
        "flex items-center justify-between p-2 bg-gray-50 rounded-lg";
      fileItem.innerHTML = `
                        <div class="flex items-center">
                            <i class="fas fa-file-pdf text-red-500 mr-2"></i>
                            <span class="file-link text-sm truncate max-w-xs cursor-pointer hover:underline" data-filename="${file.name}">${file.name}</span>
                            <span class="ml-2 text-xs ${embeddedFiles[file.name] ? 'text-green-600' : 'text-gray-400'}">${embeddedFiles[file.name] ? 'Embedded' : ''}</span>
                        </div>
                        <button class="text-red-500 hover:text-red-700" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
      fileList.appendChild(fileItem);
    });

    // Add event listeners for file name hover/click to open public URL
    document.querySelectorAll('.file-link').forEach((el) => {
      el.addEventListener('mouseenter', async (e) => {
        const filename = e.currentTarget.getAttribute('data-filename');
        if (typeof getPublicPDFUrl === 'function') {
          try {
            const url = await getPublicPDFUrl(filename);
            e.currentTarget.setAttribute('data-url', url);
          } catch (err) {
            // Ignore
          }
        }
      });
      el.addEventListener('click', async (e) => {
        const filename = e.currentTarget.getAttribute('data-filename');
        let url = e.currentTarget.getAttribute('data-url');
        if (!url && typeof getPublicPDFUrl === 'function') {
          url = await getPublicPDFUrl(filename);
        }
        if (url) {
          window.open(url, '_blank');
        }
      });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll("#fileList button").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const index = parseInt(e.currentTarget.getAttribute("data-index"));
        const removed = uploadedFiles.splice(index, 1)[0];
        if (removed && embeddedFiles[removed.name]) {
          // Try to delete from Supabase if it came from there
          if (typeof deletePDF === "function" && removed.fromSupabase) {
            try {
              await deletePDF(removed.name);
              updateStatus(`Deleted ${removed.name} from Supabase.`, "success");
            } catch (err) {
              updateStatus(`Error deleting ${removed.name} from Supabase: ${err.message || err}`, "error");
            }
          }
          delete embeddedFiles[removed.name];
        }
        renderFileList();
        updateDocumentCount();
        if (uploadedFiles.length === 0) {
          disableChat();
          embeddingStatus.textContent = "None";
          hideEmbedButton();
        }
      });
    });
  }
  // ─── Show/Hide Embed Documents Button ─────────────────────────────
  function showEmbedButton() {
    if (!embedBtn) {
      embedBtn = document.createElement("button");
      embedBtn.id = "embedBtn";
      embedBtn.className = "mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition w-full";
      embedBtn.innerHTML = '<i class="fas fa-brain mr-2"></i>Upload to database and Embed documents';
      embedBtn.addEventListener("click", embedDocumentsHandler);
      // Insert after fileList
      fileList.parentNode.insertBefore(embedBtn, fileList.nextSibling);
    }
    embedBtn.style.display = "block";
  }

  function hideEmbedButton() {
    if (embedBtn) embedBtn.style.display = "none";
  }

  // ─── Embedding Handler ────────────────────────────────────────────
  async function embedDocumentsHandler() {
    if (uploadedFiles.length === 0) return;
    updateStatus("Uploading PDFs to Supabase...", "processing");
    embeddingStatus.textContent = "Uploading...";
    embedBtn.disabled = true;
    let uploadedCount = 0;
    for (const file of uploadedFiles) {
      if (embeddedFiles[file.name]) {
        continue; // Skip already uploaded
      }
      try {
        // Upload to Supabase
        if (typeof uploadPDF === "function") {
          await uploadPDF(file);
        } else {
          throw new Error("uploadPDF() not found");
        }
        embeddedFiles[file.name] = true;
        uploadedCount++;
        renderFileList();
        updateStatus(`Uploaded ${file.name} to Supabase!`, "success");
      } catch (err) {
        updateStatus(`Error uploading ${file.name}: ${err.message || err}`, "error");
      }
    }
    if (uploadedCount > 0) {
      updateStatus(`Uploaded ${uploadedCount} file(s) to Supabase!`, "success");
      embeddingStatus.textContent = "Uploaded";
    } else {
      updateStatus("No new files uploaded.", "warning");
      embeddingStatus.textContent = "Ready";
    }
    embedBtn.disabled = false;
  }

  // ─── Updates Number of Uploaded Documents ─────────────────────────────
  function updateDocumentCount() {
    docCount.textContent = uploadedFiles.length;
  }

  // ─── Saves System Prompt for Chat Context ─────────────────────────────
  function saveSystemPrompt() {
    currentSystemPrompt = systemPrompt.value;
    updateStatus("System prompt saved successfully", "success");

    // Add system message to chat
    addMessageToChat(
      "system",
      "System prompt updated: " + currentSystemPrompt.substring(0, 50) + "..."
    );
  }

  // ─── Visually Updates the Status Indicator and Message ────────────────
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
});
