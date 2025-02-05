
# Page Number Controller Extension

This is a Chrome extension that will help you navigate through pages by controlling the page number in the URL. The user can adjust the page number using both UI buttons and keyboard shortcuts and even customize how page numbers are handled, whether it's via query parameters or path segments.

## Features

- **Page Navigation**: Easily increment or decrement the page number using the "Next" and "Previous" buttons or the left and right arrow keys.
- **Customizable Page Pattern**: Choose between using query parameters or path segments to define page numbers.
- **Persistent State**: The current page and pattern preferences are stored locally in the browser, so the extension remembers your settings even after closing and reopening the browser.
- **User-Friendly Popup Interface**: The extension will provide a popup interface for managing page numbers as well as configuring the type of pattern.
 
## Files
- **`manifest.json`**: Extension's metadata, permissions, background script, and popup settings
- **`background.js`**: Background operations - fetching the current page number, adjusting it, and storing/retrieving settings
- **`popup.js`**: Handles user interaction on the popup interface, sends requests to the background script to perform page navigation as well as for pattern settings.
- `popup.html` The HTML form of the popup, which consists of inputs to enter the pattern, radio buttons to select pattern type, and buttons to move between pages.
.
Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Check the box on the top right labeled "Developer mode".
4. Click the button labeled "Load unpacked" and select the folder with this extension's files.
5. The extension will now be available in your Chrome toolbar.
.
Usage

- Click the icon of the extension in the toolbar to open popup.
- Using the "Next" or "Prev" button, change page number.
You can also switch between pages with the left and right arrow buttons.
In the input field of the pattern, specify the query or path and submit.

## Notes

- Supports both `query` (e.g., `?page=2`) and `path` (e.g., `/page/2/`) URL patterns for page numbers.
- You can switch between these two methods and customize the key used for the page number.

