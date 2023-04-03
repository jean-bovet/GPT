// Import the required libraries
const { JSDOM } = require('jsdom');
const fs = require('fs');

// Read the content of the existing HTML page
const html = fs.readFileSync('./index.html', 'utf-8');

// Create a DOM object from the HTML content
const dom = new JSDOM(html);

// Set the global variables for the Jest tests
global.document = dom.window.document;
global.window = dom.window;

// Import the functions you want to test
const { functionName } = require('./chess.js');

// Write the unit tests
describe('Chess functions', () => {
  // You can test each function individually
  test('OpenAPI Key Container Should Be Hidden After Submitting a Value', () => {
    const submitApiKeyButton = global.document.getElementById('submit-api-key');
    expect(submitApiKeyButton).toBeTruthy();

    const apikeyContainer = global.document.getElementById('api-key-overlay');
    expect(apikeyContainer).toBeTruthy();
    expect(apikeyContainer.style.visibility).toBe('');

    const apiKey = global.document.getElementById('api-key');
    expect(apiKey).toBeTruthy();
    apiKey.value = 'abcd';
    
    // Create a click event
    const clickEvent = new window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    // Dispatch the click event on the button
    submitApiKeyButton.dispatchEvent(clickEvent);

    // Check if the API key container is hidden and the chessboard container is visible
    const styles = global.window.getComputedStyle(apikeyContainer);
    expect(styles.visibility).toBe('hidden');
  });

});
