document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const boardElement = document.getElementById('board');
    const currentPlayerElement = document.getElementById('current-player');
    const playerXScoreElement = document.getElementById('player-x');
    const playerOScoreElement = document.getElementById('player-o');
    const tiesScoreElement = document.getElementById('ties');
    const restartBtn = document.getElementById('restart-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const pvpBtn = document.getElementById('pvp-btn');
    const pvcBtn = document.getElementById('pvc-btn');
    const modeSelection = document.querySelector('.mode-selection');
    const gameContainer = document.querySelector('.game-container');
    const winnerModal = document.getElementById('winner-modal');
    const winnerText = document.getElementById('winner-text');
    const playAgainBtn = document.getElementById('play-again-btn');
    const trophy = document.getElementById('trophy');
    const fireworks = document.getElementById('fireworks');
    const confettiContainer = document.getElementById('confetti');
    const themeBtn = document.getElementById('theme-btn');

    // Game state
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let gameMode = null; // 'pvp' or 'pvc'
    let scores = { X: 0, O: 0, ties: 0 };
    let aiThinking = false;

    // Initialize the game
    function initGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        aiThinking = false;
        
        updateBoard();
        updateCurrentPlayerDisplay();
    }

    // Create the board UI
    function createBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', () => handleCellClick(i));
            boardElement.appendChild(cell);
        }
    }

    // Update the board UI
    function updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.classList.remove('x', 'o', 'winning-cell');
            if (board[index] === 'X') cell.classList.add('x');
            if (board[index] === 'O') cell.classList.add('o');
        });
    }

    // Handle cell click
    function handleCellClick(index) {
        if (!gameActive || board[index] !== '' || aiThinking) return;
        
        if (gameMode === 'pvp' || (gameMode === 'pvc' && currentPlayer === 'X')) {
            makeMove(index);
            
            if (gameMode === 'pvc' && gameActive && currentPlayer === 'O') {
                aiThinking = true;
                setTimeout(makeAIMove, 800); // Slight delay for AI move
            }
        }
    }

    // Make a move
    function makeMove(index) {
        board[index] = currentPlayer;
        updateBoard();
        
        if (checkWinner()) {
            handleGameEnd();
            return;
        }
        
        if (checkTie()) {
            handleTie();
            return;
        }
        
        switchPlayer();
    }

    // Switch player
    function switchPlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateCurrentPlayerDisplay();
    }

    // Update current player display
    function updateCurrentPlayerDisplay() {
        if (gameMode === 'pvp') {
            currentPlayerElement.textContent = `Player ${currentPlayer}'s Turn`;
        } else if (gameMode === 'pvc') {
            currentPlayerElement.textContent = currentPlayer === 'X' 
                ? 'Your Turn (X)' 
                : 'Computer Thinking...';
        }
    }

    // Check for winner
    function checkWinner() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                combination.forEach(index => {
                    document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning-cell');
                });
                return true;
            }
        }
        return false;
    }

    // Check for tie
    function checkTie() {
        return !board.includes('') && !checkWinner();
    }

    // Handle game end (win)
    function handleGameEnd() {
        gameActive = false;
        scores[currentPlayer]++;
        updateScores();
        
        if (gameMode === 'pvp') {
            winnerText.textContent = `Player ${currentPlayer} Wins!`;
        } else {
            winnerText.textContent = currentPlayer === 'X' 
                ? 'You Win! 🎉' 
                : 'Computer Wins! 🤖';
        }
        
        trophy.classList.remove('hidden');
        fireworks.classList.remove('hidden');
        showConfetti();
        winnerModal.classList.remove('hidden');
    }

    // Handle tie
    function handleTie() {
        gameActive = false;
        scores.ties++;
        updateScores();
        
        winnerText.textContent = "It's a Tie!";
        trophy.classList.add('hidden');
        fireworks.classList.add('hidden');
        winnerModal.classList.remove('hidden');
    }

    // Update
