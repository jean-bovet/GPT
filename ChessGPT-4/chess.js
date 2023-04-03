const submitApiKeyButton = document.getElementById('submit-api-key');
submitApiKeyButton.addEventListener('click', () => {
    const apiKey = document.getElementById('api-key').value;
    if (apiKey) {
        const apikeyContainer = document.getElementById('api-key-overlay');
        apikeyContainer.classList.add('hidden')
    } else {
        alert('Please enter a valid API key.');
    }
});
