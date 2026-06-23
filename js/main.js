'use strict';

const App = (function () {
    let gameMode = 'hva';
    let aiDifficulty = 'hard';
    let isProcessing = false;
    let demoInterval = null;
    let selectedPieceIndex = null;
    let isReplaying = false; // Variable pour la "Secret Mission"

    const modeSelect = document.getElementById('game-mode');
    const difficultySelect = document.getElementById('ai-difficulty');
    const btnNew = document.getElementById('btn-new');
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    const btnStop = document.getElementById('btn-stop');

    function init() {
        Game.init();
        UI.init({
            onIntersectionClick: handleIntersectionClick,
            onPieceClick: handlePieceClick
        });

        modeSelect.addEventListener('change', (e) => {
            gameMode = e.target.value;
            newGame();
        });
        difficultySelect.addEventListener('change', (e) => {
            aiDifficulty = e.target.value;
        });
        btnNew.addEventListener('click', newGame);
        btnUndo.addEventListener('click', handleUndo);
        btnRedo.addEventListener('click', handleRedo);
        btnStop.addEventListener('click', stopDemo);

        newGame();
    }

    function newGame() {
        stopDemo();
        isReplaying = false;
        Game.init();
        selectedPieceIndex = null;
        isProcessing = false;
        UI.clearHighlights();
        UI.resetPerf();
        hideReplayButton();
        updateUI();

        if (gameMode === 'ava') {
            startDemo();
        }
    }

    function updateUI() {
        const state = Game.getState();
        // Permet au SVG de savoir quelle pièce est sélectionnée
        state.selectedPiece = selectedPieceIndex; 
        UI.render(state);
        updateStatus();
        btnUndo.disabled = !Game.canUndo() || isReplaying;
        btnRedo.disabled = !Game.canRedo() || isReplaying;
        btnStop.classList.toggle('hidden', gameMode !== 'ava');
    }

    function updateStatus() {
        const state = Game.getState();
        if (isReplaying) {
            UI.setStatus('Replay en cours...');
            return;
        }
        if (state.winner) {
            const winnerName = getPlayerName(state.winner);
            UI.setStatus(winnerName + ' gagne ! 🏆');
            return;
        }
        const playerName = getPlayerName(state.currentPlayer);
        const phaseText = state.phase === 1 ? 'Phase de placement' : 'Phase de déplacement';
        UI.setStatus(playerName + ' - ' + phaseText);
    }

    function getPlayerName(player) {
        if (gameMode === 'hvh') {
            return 'Joueur ' + player;
        }
        if (gameMode === 'hva') {
            return player === 1 ? 'Humain' : 'IA';
        }
        return 'IA ' + player;
    }

    function handleIntersectionClick(index) {
        // Guard pour le mode Replay
        if (isProcessing || Game.isGameOver() || isReplaying) return;
        const state = Game.getState();

        if (gameMode === 'hva' && state.currentPlayer === 2) return;

        if (state.phase === 1) {
            if (state.board[index] !== null) return;
            const move = { type: 'place', to: index };
            executeHumanMove(move);
        } else if (state.phase === 2 && selectedPieceIndex !== null) {
            if (state.board[index] !== null) return;
            const adj = Game.ADJACENCY[selectedPieceIndex];
            if (!adj.includes(index)) return;
            const move = { type: 'move', from: selectedPieceIndex, to: index };
            selectedPieceIndex = null;
            UI.clearHighlights();
            executeMoveWithAnimation(move);
        }
    }

    function handlePieceClick(index) {
        if (isProcessing || Game.isGameOver() || isReplaying) return;
        const state = Game.getState();

        if (gameMode === 'hva' && state.currentPlayer === 2) return;
        if (state.phase !== 2) return;
        if (state.board[index] !== state.currentPlayer) return;

        selectedPieceIndex = index;
        updateUI(); // Rafraichit pour montrer la pièce sélectionnée

        const adj = Game.ADJACENCY[index];
        const validTargets = adj.filter(i => state.board[i] === null);
        UI.highlightValidTargets(validTargets);
    }

    function executeHumanMove(move) {
        const result = Game.applyMove(move);
        if (!result.success) return;

        if (move.type === 'place') {
            const state = Game.getState();
            UI.renderWithPlaceAnimation(state, move.to);
        }

        afterMove(result);
    }

    function executeMoveWithAnimation(move) {
        isProcessing = true;
        const result = Game.applyMove(move);
        if (!result.success) {
            isProcessing = false;
            return;
        }

        const state = Game.getState();
        UI.renderWithMoveAnimation(state, move.from, move.to, () => {
            isProcessing = false;
            afterMove(result);
        });
    }

    function afterMove(result) {
        updateUI();

        if (result.win) {
            const state = Game.getState();
            UI.showWin(result.winLine, state);
            showReplayButton(); // Affiche le bouton à la fin de la partie
            return;
        }

        if (gameMode === 'hva' && !Game.isGameOver()) {
            const state = Game.getState();
            if (state.currentPlayer === 2) {
                isProcessing = true;
                setTimeout(() => playAI(), 300);
            }
        }
    }

    function playAI() {
        const state = Game.getState();
        const startTime = performance.now();
        const move = AI.getMove(state, aiDifficulty);
        const endTime = performance.now();
        const elapsed = endTime - startTime;

        UI.updatePerf(elapsed, AI.getNodesExplored());

        if (!move) {
            isProcessing = false;
            return;
        }

        const result = Game.applyMove(move);
        if (!result.success) {
            isProcessing = false;
            return;
        }

        const newState = Game.getState();
        if (move.type === 'place') {
            UI.renderWithPlaceAnimation(newState, move.to);
            isProcessing = false;
            afterMove(result);
        } else {
            UI.renderWithMoveAnimation(newState, move.from, move.to, () => {
                isProcessing = false;
                afterMove(result);
            });
        }
    }

    function startDemo() {
        btnStop.classList.remove('hidden');
        isProcessing = true;
        playDemoTurn();
    }

    function playDemoTurn() {
        if (Game.isGameOver()) {
            isProcessing = false;
            showReplayButton();
            return;
        }

        const state = Game.getState();
        const startTime = performance.now();
        const move = AI.getMove(state, aiDifficulty);
        const endTime = performance.now();

        UI.updatePerf(endTime - startTime, AI.getNodesExplored());

        if (!move) {
            isProcessing = false;
            return;
        }

        const result = Game.applyMove(move);
        if (!result.success) {
            isProcessing = false;
            return;
        }

        const newState = Game.getState();
        if (move.type === 'place') {
            UI.renderWithPlaceAnimation(newState, move.to);
            updateUI();

            if (result.win) {
                UI.showWin(result.winLine, newState);
                isProcessing = false;
                showReplayButton();
                return;
            }

            demoInterval = setTimeout(playDemoTurn, 800);
        } else {
            UI.renderWithMoveAnimation(newState, move.from, move.to, () => {
                updateUI();

                if (result.win) {
                    UI.showWin(result.winLine, newState);
                    isProcessing = false;
                    showReplayButton();
                    return;
                }

                demoInterval = setTimeout(playDemoTurn, 800);
            });
        }
    }

    function stopDemo() {
        if (demoInterval) {
            clearTimeout(demoInterval);
            demoInterval = null;
        }
        isProcessing = false;
        btnStop.classList.add('hidden');
    }

    function handleUndo() {
        if (isProcessing || gameMode === 'ava' || isReplaying) return;
        if (Game.undo()) {
            selectedPieceIndex = null;
            UI.clearHighlights();
            updateUI();
            if (gameMode === 'hva' && Game.getState().currentPlayer === 2) {
                Game.undo();
                updateUI();
            }
        }
    }

    function handleRedo() {
        if (isProcessing || gameMode === 'ava' || isReplaying) return;
        if (Game.redo()) {
            selectedPieceIndex = null;
            UI.clearHighlights();
            updateUI();
        }
    }

    // --- SECRET MISSION: FONCTIONS DE REPLAY --- //

    function showReplayButton() {
        let btn = document.getElementById('btn-replay');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'btn-replay';
            btn.className = 'btn';
            btn.textContent = 'Rejouer';
            btn.addEventListener('click', startReplay);
            document.querySelector('.controls').appendChild(btn);
        }
        btn.classList.remove('hidden');
    }

    function hideReplayButton() {
        const btn = document.getElementById('btn-replay');
        if (btn) btn.classList.add('hidden');
    }

    function startReplay() {
        const movesLog = Game.getMovesLog();
        if (movesLog.length === 0) return;

        isReplaying = true;
        isProcessing = true;
        hideReplayButton();

        Game.init();
        UI.clearHighlights();
        updateUI(); // Affiche "Replay en cours..."

        replayStep(movesLog, 0);
    }

    function replayStep(moves, index) {
        if (index >= moves.length) {
            isReplaying = false;
            isProcessing = false;
            const state = Game.getState();
            if (state.winner) {
                const winLine = Game.checkWin(state.board, state.winner);
                if (winLine) UI.showWin(winLine, state);
            }
            updateUI();
            showReplayButton();
            return;
        }

        const move = moves[index];
        const result = Game.applyMove(move);
        const state = Game.getState();

        if (move.type === 'place') {
            UI.renderWithPlaceAnimation(state, move.to);
            setTimeout(() => replayStep(moves, index + 1), 600);
        } else {
            UI.renderWithMoveAnimation(state, move.from, move.to, () => {
                setTimeout(() => replayStep(moves, index + 1), 600);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', init);

    return { init, newGame };
})();