'use strict';

const Game = (function () {
    // Adjacency graph: each index lists the positions it connects to
    const ADJACENCY = [
        [1, 3, 4],
        [0, 2, 4],
        [1, 5, 4],
        [0, 6, 4],
        [0, 1, 2, 3, 5, 6, 7, 8],
        [2, 8, 4],
        [3, 7, 4],
        [6, 8, 4],
        [5, 7, 4]
    ];

    // All 8 possible three-in-a-row winning lines
    const WIN_LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // Module-level state variables
    let state;
    let history;
    let redoStack;
    let movesLog;
    // Creates a fresh game state object
    function createState() {
        return {
            board: Array(9).fill(null),
            currentPlayer: 1,
            phase: 1,
            piecesPlaced: { 1: 0, 2: 0 },
            winner: null,
            selectedPiece: null
        };
    }

    // Deep-copies a state to avoid mutation
    function cloneState(s) {
        return {
            board: [...s.board],
            currentPlayer: s.currentPlayer,
            phase: s.phase,
            piecesPlaced: { ...s.piecesPlaced },
            winner: s.winner,
            selectedPiece: s.selectedPiece
        };
    }

    // Resets everything for a new game
    function init() {
        state = createState();
        history = [];
        redoStack = [];
        movesLog = [];
    }

    // Returns a safe copy of the current state
    function getState() {
        return cloneState(state);
    }

    // Returns a copy of all moves played so far
    function getMovesLog() {
        return [...movesLog];
    }
    // Checks if a player has three in a row, returns the winning line or null
    function checkWin(board, player) {
        for (let i = 0; i < WIN_LINES.length; i++) {
            const [a, b, c] = WIN_LINES[i];
            if (board[a] === player && board[b] === player && board[c] === player) {
                return WIN_LINES[i];
            }
        }
        return null;
    }

    // Generates all valid moves for a player in a given phase
    function getLegalMoves(boardState, player, phase, piecesPlaced) {
        const moves = [];
        if (phase === 1) {
            // Placement: any empty intersection is valid
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === null) {
                    moves.push({ type: 'place', to: i });
                }
            }
        } else {
            // Movement: slide own pieces to adjacent empty intersections
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === player) {
                    const neighbors = ADJACENCY[i];
                    for (let j = 0; j < neighbors.length; j++) {
                        if (boardState[neighbors[j]] === null) {
                            moves.push({ type: 'move', from: i, to: neighbors[j] });
                        }
                    }
                }
            }
        }
        return moves;
    }

    // Convenience wrapper using the module's internal state
    function getLegalMovesForCurrent() {
        return getLegalMoves(state.board, state.currentPlayer, state.phase, state.piecesPlaced);
    }
    // Executes a move, updates state, checks for win/phase transition
    function applyMove(move) {
        history.push(cloneState(state));
        redoStack = [];

        if (move.type === 'place') {
            state.board[move.to] = state.currentPlayer;
            state.piecesPlaced[state.currentPlayer]++;
            movesLog.push({ ...move, player: state.currentPlayer });

            const winLine = checkWin(state.board, state.currentPlayer);
            if (winLine) {
                state.winner = state.currentPlayer;
                return { success: true, win: true, winLine: winLine };
            }

            // Transition to Phase 2 after all 6 pieces are placed
            if (state.piecesPlaced[1] === 3 && state.piecesPlaced[2] === 3) {
                state.phase = 2;
            }

            state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
            return { success: true, win: false };
        }

        if (move.type === 'move') {
            state.board[move.to] = state.board[move.from];
            state.board[move.from] = null;
            movesLog.push({ ...move, player: state.currentPlayer });

            const winLine = checkWin(state.board, state.currentPlayer);
            if (winLine) {
                state.winner = state.currentPlayer;
                return { success: true, win: true, winLine: winLine };
            }

            state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
            return { success: true, win: false };
        }

        return { success: false };
    }
    // Reverts the last move
    function undo() {
        if (history.length === 0) return false;
        redoStack.push(cloneState(state));
        state = history.pop();
        movesLog.pop();
        return true;
    }

    // Re-applies a previously undone move
    function redo() {
        if (redoStack.length === 0) return false;
        history.push(cloneState(state));
        state = redoStack.pop();
        return true;
    }

    function canUndo() {
        return history.length > 0;
    }

    function canRedo() {
        return redoStack.length > 0;
    }

    function isGameOver() {
        return state.winner !== null;
    }

    // Creates a hypothetical board without mutating state (used by AI)
    function simulateMove(board, move, player) {
        const newBoard = [...board];
        if (move.type === 'place') {
            newBoard[move.to] = player;
        } else {
            newBoard[move.to] = newBoard[move.from];
            newBoard[move.from] = null;
        }
        return newBoard;
    }

    return {
        ADJACENCY,
        WIN_LINES,
        init,
        getState,
        getMovesLog,
        checkWin,
        getLegalMoves,
        getLegalMovesForCurrent,
        applyMove,
        undo,
        redo,
        canUndo,
        canRedo,
        isGameOver,
        simulateMove,
        cloneState
    };
})();
