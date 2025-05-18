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
    let gameMode = null;
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
        
        makeMove(index);
        
        if (gameMode === 'pvc' && gameActive && currentPlayer === 'O') {
            aiThinking = true;
            setTimeout(makeAIMove, 800);
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
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
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

    // Update scores display
    function updateScores() {
        playerXScoreElement.textContent = `X: ${scores.X}`;
        playerOScoreElement.textContent = `O: ${scores.O}`;
        tiesScoreElement.textContent = `Ties: ${scores.ties}`;
    }

    // AI move logic
    function makeAIMove() {
        if (!gameActive) return;
        
        let move = findBestMove();
        makeMove(move);
        aiThinking = false;
    }

    // Simple AI to find the best move
    function findBestMove() {
        // Check for immediate win
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = currentPlayer;
                if (checkWinner()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        
        // Check for immediate block
        const opponent = currentPlayer === 'X' ? 'O' : 'X';
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = opponent;
                if (checkWinner()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        
        // Try to take center
        if (board[4] === '') return 4;
        
        // Take a random corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available spot
        const availableSpots = board.map((spot, index) => spot === '' ? index : null).filter(val => val !== null);
        return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }

    // Show confetti effect
    function showConfetti() {
        confettiContainer.classList.remove('hidden');
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confettiContainer.appendChild(confetti);
        }
        
        setTimeout(() => {
            confettiContainer.innerHTML = '';
            confettiContainer.classList.add('hidden');
        }, 5000);
    }

    // Generate random color for confetti
    function getRandomColor() {
        const colors = ['#ff7e5f', '#4a6fa5', '#ffbe0b', '#fb5607', '#8338ec', '#3a86ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Event listeners
    pvpBtn.addEventListener('click', () => {
        gameMode = 'pvp';
        startGame();
    });

    pvcBtn.addEventListener('click', () => {
        gameMode = 'pvc';
        startGame();
    });

    restartBtn.addEventListener('click', initGame);
    
    newGameBtn.addEventListener('click', () => {
        gameContainer.classList.add('hidden');
        modeSelection.classList.remove('hidden');
        winnerModal.classList.add('hidden');
    });

    playAgainBtn.addEventListener('click', () => {
        winnerModal.classList.add('hidden');
        initGame();
    });

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeBtn.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
    });

    // Start the game with selected mode
    function startGame() {
        modeSelection.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        scores = { X: 0, O: 0, ties: 0 };
        updateScores();
        createBoard();
        initGame();
    }

    // Add confetti styles
    const style = document.createElement('style');
    style.textContent = `
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            opacity: 0.8;
            animation: fall linear forwards;
        }
        
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
