        const cells = document.querySelectorAll('[data-cell]');
        const board = document.querySelector('.board');
        const statusDisplay = document.getElementById('status');
        const difficultyDiv = document.getElementById('difficulty');
        const twoPlayerBtn = document.getElementById('two-player-btn');
        const playWithBotBtn = document.getElementById('play-with-bot-btn');
        const easyBtn = document.getElementById('easy');
        const mediumBtn = document.getElementById('medium');
        const hardBtn = document.getElementById('hard');
        const resetBtn = document.getElementById('reset-btn');

        let currentPlayer = 'X';
        let boardState = ['', '', '', '', '', '', '', '', ''];
        let playingWithBot = false;
        let botLevel = null;

        twoPlayerBtn.addEventListener('click', startTwoPlayerGame);
        playWithBotBtn.addEventListener('click', showDifficultyOptions);
        easyBtn.addEventListener('click', () => startBotGame('easy'));
        mediumBtn.addEventListener('click', () => startBotGame('medium'));
        hardBtn.addEventListener('click', () => startBotGame('hard'));
        resetBtn.addEventListener('click', resetGame);

        function startTwoPlayerGame() {
            playingWithBot = false;
            board.classList.remove('hide');
            difficultyDiv.classList.add('hide');
            resetBtn.classList.remove('hide');
            startGame();
        }

        function showDifficultyOptions() {
            difficultyDiv.classList.remove('hide');
        }

        function startBotGame(level) {
            botLevel = level;
            playingWithBot = true;
            board.classList.remove('hide');
            difficultyDiv.classList.add('hide');
            resetBtn.classList.remove('hide');
            startGame();
        }

        function startGame() {
            boardState = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('x', 'o');
                cell.addEventListener('click', handleCellClick, { once: true });
            });
            statusDisplay.textContent = `الدور: ${currentPlayer}`;
        }

        function handleCellClick(e) {
            const cell = e.target;
            const index = Array.from(cells).indexOf(cell);

            if (boardState[index] !== '') return;

            boardState[index] = currentPlayer;
            cell.textContent = currentPlayer;
            cell.classList.add(currentPlayer.toLowerCase());

            if (checkWin()) {
                statusDisplay.textContent = `${currentPlayer} فاز!`;
                endGame();
                return;
            } else if (boardState.every(cell => cell !== '')) {
                statusDisplay.textContent = 'تعادل!';
                endGame();
                return;
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusDisplay.textContent = `الدور: ${currentPlayer}`;

            if (playingWithBot && currentPlayer === 'O') {
                setTimeout(botMove, 500); // انتظار قليل قبل حركة البوت
            }
        }

        function botMove() {
            let index;
            if (botLevel === 'easy') {
                index = botEasyMove();
            } else if (botLevel === 'medium') {
                index = botMediumMove();
            } else {
                index = botHardMove();
            }

            boardState[index] = 'O';
            cells[index].textContent = 'O';
            cells[index].classList.add('o');
            cells[index].removeEventListener('click', handleCellClick);

            if (checkWin()) {
                statusDisplay.textContent = `O فاز!`;
                endGame();
            } else if (boardState.every(cell => cell !== '')) {
                statusDisplay.textContent = 'تعادل!';
                endGame();
            } else {
                currentPlayer = 'X';
                statusDisplay.textContent = `الدور: ${currentPlayer}`;
            }
        }

        function botEasyMove() {
            let emptyCells = boardState.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        function botMediumMove() {
            let winOrBlockIndex = findWinOrBlock('O') || findWinOrBlock('X');
            if (winOrBlockIndex !== null) {
                return winOrBlockIndex;
            } else {
                return botEasyMove();
            }
        }

        function findWinOrBlock(player) {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], 
                [0, 3, 6], [1, 4, 7], [2, 5, 8], 
                [0, 4, 8], [2, 4, 6]
            ];

            for (let pattern of winPatterns) {
                const [a, b, c] = pattern;
                if (boardState[a] === player && boardState[b] === player && boardState[c] === '') return c;
                if (boardState[a] === player && boardState[b] === '' && boardState[c] === player) return b;
                if (boardState[a] === '' && boardState[b] === player && boardState[c] === player) return a;
            }
            return null;
        }

        function botHardMove() {
            return minimax(boardState, 'O').index;
        }

        function minimax(newBoard, player) {
            const availSpots = newBoard.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);

            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], 
                [0, 3, 6], [1, 4, 7], [2, 5, 8], 
                [0, 4, 8], [2, 4, 6]
            ];

            if (checkWinner(newBoard, 'X')) {
                return { score: -10 };
            } else if (checkWinner(newBoard, 'O')) {
                return { score: 10 };
            } else if (availSpots.length === 0) {
                return { score: 0 };
            }

            const moves = [];
            for (let i = 0; i < availSpots.length; i++) {
                let move = {};
                move.index = availSpots[i];
                newBoard[availSpots[i]] = player;

                if (player === 'O') {
                    let result = minimax(newBoard, 'X');
                    move.score = result.score;
                } else {
                    let result = minimax(newBoard, 'O');
                    move.score = result.score;
                }

                newBoard[availSpots[i]] = '';
                moves.push(move);
            }

            let bestMove;
            if (player === 'O') {
                let bestScore = -Infinity;
                for (let i = 0; i < moves.length; i++) {
                    if (moves[i].score > bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    }
                }
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < moves.length; i++) {
                    if (moves[i].score < bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    }
                }
            }

            return moves[bestMove];
        }

        function checkWinner(board, player) {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], 
                [0, 3, 6], [1, 4, 7], [2, 5, 8], 
                [0, 4, 8], [2, 4, 6]
            ];

            return winPatterns.some(pattern => pattern.every(index => board[index] === player));
        }

        function checkWin() {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], 
                [0, 3, 6], [1, 4, 7], [2, 5, 8], 
                [0, 4, 8], [2, 4, 6]
            ];

            return winPatterns.some(pattern => pattern.every(index => boardState[index] === currentPlayer));
        }

        function endGame() {
            cells.forEach(cell => cell.removeEventListener('click', handleCellClick));
        }

        function resetGame() {
            boardState = ['', '', '', '', '', '', '', '', ''];
            startGame();
        }
