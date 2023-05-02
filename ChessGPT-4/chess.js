document.getElementById("gpt3").checked = true;

const chess = new Chess();
const board = ChessBoard('board', {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd,
});

function onDragStart(source, piece, position, orientation) {
    if (chess.in_checkmate() === true || chess.in_draw() === true || piece.search(/^b/) !== -1) {
        return false;
    }
}

function onDrop(source, target) {
    const move = chess.move({
        from: source,
        to: target,
        promotion: 'q',
    });

    if (move === null) {
        return 'snapback';
    }

    updateBoardWithMoveByChatGPT();
}

function onMouseoverSquare(square, piece) { }

function onMouseoutSquare(square, piece) { }

function onSnapEnd() {
    board.position(chess.fen());
}

const undoButton = document.getElementById('undo');
undoButton.addEventListener('click', undoMove);

const resetBoardButton = document.getElementById('reset-board');
resetBoardButton.addEventListener('click', () => {
    // Reset the board
    chess.reset();
    board.start();

    updateHistory();

    // Hide the error overlay
    const errorOverlay = document.getElementById('error-overlay');
    errorOverlay.style.visibility = 'hidden';
});

const retryBoardButton = document.getElementById('retry-board');
retryBoardButton.addEventListener('click', () => {
    updateBoardWithMoveByChatGPT();

    // Hide the error overlay
    const errorOverlay = document.getElementById('error-overlay');
    errorOverlay.style.visibility = 'hidden';
});

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

function updateHistory() {
    const moveHistoryElement = document.getElementById('move-history');
    const moveHistory = chess.history();

    // Clear the existing move history
    moveHistoryElement.innerHTML = '';

    // Add the new move history
    let lineIndex = 1;
    for (let i = 0; i < moveHistory.length; i += 2) {
        const listItem = document.createElement('li');

        // Add the user's move
        listItem.textContent = `${lineIndex}. ${moveHistory[i]}`;

        // Add the AI's move, if available
        if (i + 1 < moveHistory.length) {
            listItem.textContent += ` ${moveHistory[i + 1]}`;
        }

        moveHistoryElement.appendChild(listItem);
        lineIndex++;
    }
}

async function playAgainstGPT4() {
    const apiKey = document.getElementById('api-key').value;
    const moveHistory = chess.history();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a chess player." },
                { role: "user", content: "Make a chess move in response to the move history "+moveHistory+". Just return the move." },
            ],
            max_tokens: 10,
            n: 1,
            stop: null,
            temperature: 0.5,
        }),
    });

    const data = await response.json();
    const chatGPTMove = data.choices[0].message.content.trim();

    return chatGPTMove
}

async function playAgainstGPT3() {
    const lastMove = chess.history().pop();
    const prompt = `Make a chess move in response to the move "${lastMove}".`;
    const apiKey = document.getElementById('api-key').value;

    const response = await fetch('https://api.openai.com/v1/engines/text-davinci-002/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 10,
            n: 1,
            stop: null,
            temperature: 0.5,
        }),
    });

    const data = await response.json();
    const chatGPTMove = data.choices[0].text.trim();

    return chatGPTMove
}

async function updateBoardWithMoveByChatGPT() {
    const chatGPTMove = document.getElementById("gpt3").checked ? await playAgainstGPT3() : await playAgainstGPT4();

    console.log('Moves: ' + chess.history())
    console.log('ChatGPT responded: ' + chatGPTMove)

    // Validate and apply the move
    const move = chess.move(chatGPTMove);

    if (move === null) {
        const message = `Invalid move by ChatGPT: ${chatGPTMove}`;
        console.log(message);
        showErrorOverlay(message);
        return;
    }

    board.position(chess.fen());

    updateHistory();
}

function showErrorOverlay(message) {
    const errorOverlay = document.getElementById('error-overlay');
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = message;
    errorOverlay.style.visibility = 'visible';
}

function undoMove() {
    chess.undo();
    board.position(chess.fen());
    updateHistory();
}
