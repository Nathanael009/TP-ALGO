'use strict';

const AI = (function () {
    let nodesExplored = 0;

    function getNodesExplored() {
        return nodesExplored;
    }

    // Niveau Facile : coup aléatoire
    function getRandomMove(state) {
        const moves = Game.getLegalMoves(state.board, state.currentPlayer, state.phase, state.piecesPlaced);
        if (moves.length === 0) return null;
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // Niveau Moyen : Glouton (Victoire immédiate > Bloquer l'adversaire > Prendre le centre > Aléatoire)
    function getMediumMove(state) {
        const player = state.currentPlayer;
        const opponent = player === 1 ? 2 : 1;
        const moves = Game.getLegalMoves(state.board, player, state.phase, state.piecesPlaced);
        if (moves.length === 0) return null;

        // 1. Chercher une victoire immédiate
        for (let i = 0; i < moves.length; i++) {
            const newBoard = Game.simulateMove(state.board, moves[i], player);
            if (Game.checkWin(newBoard, player)) {
                return moves[i];
            }
        }

        // 2. Bloquer l'adversaire s'il peut gagner au prochain tour
        const opponentMoves = Game.getLegalMoves(state.board, opponent, state.phase, state.piecesPlaced);
        for (let i = 0; i < opponentMoves.length; i++) {
            const newBoard = Game.simulateMove(state.board, opponentMoves[i], opponent);
            if (Game.checkWin(newBoard, opponent)) {
                for (let j = 0; j < moves.length; j++) {
                    if (moves[j].to === opponentMoves[i].to) {
                        return moves[j];
                    }
                }
            }
        }

        // 3. Prendre le centre (index 4) s'il est libre
        const centerMoves = moves.filter(m => m.to === 4);
        if (centerMoves.length > 0) return centerMoves[0];

        // 4. Sinon, coup aléatoire
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // Heuristique pour évaluer les états non terminaux (utilisée par Minimax)
    function evaluate(board, aiPlayer) {
        const humanPlayer = aiPlayer === 1 ? 2 : 1;

        if (Game.checkWin(board, aiPlayer)) return 100;
        if (Game.checkWin(board, humanPlayer)) return -100;

        let score = 0;

        // Contrôle du centre (+3 pour l'IA, -3 si l'humain l'a)
        if (board[4] === aiPlayer) score += 3;
        else if (board[4] === humanPlayer) score -= 3;

        // Évaluation des menaces (2 pions alignés avec 1 case vide)
        for (let i = 0; i < Game.WIN_LINES.length; i++) {
            const [a, b, c] = Game.WIN_LINES[i];
            const line = [board[a], board[b], board[c]];
            const aiCount = line.filter(x => x === aiPlayer).length;
            const humanCount = line.filter(x => x === humanPlayer).length;
            const emptyCount = line.filter(x => x === null).length;

            if (aiCount === 2 && emptyCount === 1) score += 5;
            if (humanCount === 2 && emptyCount === 1) score -= 5;
        }

        // Mobilité
        const aiMobility = Game.getLegalMoves(board, aiPlayer, 2, { 1: 3, 2: 3 }).length;
        const humanMobility = Game.getLegalMoves(board, humanPlayer, 2, { 1: 3, 2: 3 }).length;
        score += (aiMobility - humanMobility);

        return score;
    }

    // Minimax avec élagage Alpha-Beta
    function minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, phase, piecesPlaced) {
        nodesExplored++;
        const humanPlayer = aiPlayer === 1 ? 2 : 1;

        // On préfère les victoires rapides (on soustrait la profondeur)
        if (Game.checkWin(board, aiPlayer)) return 100 - (6 - depth);
        if (Game.checkWin(board, humanPlayer)) return -100 + (6 - depth);

        if (depth === 0) return evaluate(board, aiPlayer);

        const currentPlayer = isMaximizing ? aiPlayer : humanPlayer;
        const currentPhase = (piecesPlaced[1] >= 3 && piecesPlaced[2] >= 3) ? 2 : phase;
        const moves = Game.getLegalMoves(board, currentPlayer, currentPhase, piecesPlaced);

        if (moves.length === 0) return evaluate(board, aiPlayer);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                const newBoard = Game.simulateMove(board, moves[i], currentPlayer);
                const newPiecesPlaced = { ...piecesPlaced };
                if (moves[i].type === 'place') {
                    newPiecesPlaced[currentPlayer]++;
                }
                const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer, phase, newPiecesPlaced);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break; // Élagage Beta
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < moves.length; i++) {
                const newBoard = Game.simulateMove(board, moves[i], currentPlayer);
                const newPiecesPlaced = { ...piecesPlaced };
                if (moves[i].type === 'place') {
                    newPiecesPlaced[currentPlayer]++;
                }
                const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer, phase, newPiecesPlaced);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break; // Élagage Alpha
            }
            return minEval;
        }
    }

    // Niveau Difficile : lance le Minimax
    function getHardMove(state) {
        nodesExplored = 0;
        const aiPlayer = state.currentPlayer;
        const moves = Game.getLegalMoves(state.board, aiPlayer, state.phase, state.piecesPlaced);
        if (moves.length === 0) return null;

        // Profondeur de recherche : plus grande en phase de placement
        const maxDepth = state.phase === 1 ? 8 : 6;
        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (let i = 0; i < moves.length; i++) {
            const newBoard = Game.simulateMove(state.board, moves[i], aiPlayer);
            const newPiecesPlaced = { ...state.piecesPlaced };
            if (moves[i].type === 'place') {
                newPiecesPlaced[aiPlayer]++;
            }
            const score = minimax(newBoard, maxDepth - 1, -Infinity, Infinity, false, aiPlayer, state.phase, newPiecesPlaced);
            if (score > bestScore) {
                bestScore = score;
                bestMove = moves[i];
            }
        }

        return bestMove;
    }

    // Fonction publique appelée par main.js
    function getMove(state, difficulty) {
        nodesExplored = 0;
        switch (difficulty) {
            case 'easy': return getRandomMove(state);
            case 'medium': return getMediumMove(state);
            case 'hard': return getHardMove(state);
            default: return getRandomMove(state);
        }
    }

    return {
        getMove,
        getNodesExplored
    };
})();