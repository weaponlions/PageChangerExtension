document.addEventListener('DOMContentLoaded', () => {
    // Request current page number from background.js
    chrome.runtime.sendMessage({ action: "getPageNumber" }, (response) => {
        document.getElementById('currentPage').textContent = response.page || 1;      
        document.getElementById('pattenInput').value = response.input;
    });
});

// Event listeners for page navigation via buttons
document.getElementById('nextPage').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "incrementPage" });
});

document.getElementById('prevPage').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "decrementPage" });
});


document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        // Right arrow key pressed, go to next page
        chrome.runtime.sendMessage({ action: "incrementPage" });
    } else if (event.key === 'ArrowLeft') {
        // Left arrow key pressed, go to previous page
        chrome.runtime.sendMessage({ action: "decrementPage" });
    }
});

document.getElementById("submitBtn").addEventListener("click", function() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    const pattenInput = document.getElementById('pattenInput');
    chrome.runtime.sendMessage({ action: 'submitType', message: pattenInput.value, type: selectedOption?.value ?? "both" });
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'response') {
      console.log('Message from Background:', message.message);      
      document.getElementById('currentPage').textContent = message.message || 1;
    }
  });
  

