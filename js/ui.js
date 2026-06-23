'use strict';

const UI = (function () {
    const POSITIONS = [
        { x: 50, y: 50 },
        { x: 150, y: 50 },
        { x: 250, y: 50 },
        { x: 50, y: 150 },
        { x: 150, y: 150 },
        { x: 250, y: 150 },
        { x: 50, y: 250 },
        { x: 150, y: 250 },
        { x: 250, y: 250 }
    ];

    const LINES = [
        [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8],
        [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8],
        [0, 4], [4, 8], [2, 4], [4, 6]
    ];

    let boardSvg, piecesLayer, statusEl, perfTimeEl, perfNodesEl;
    let onIntersectionClick = null;
    let onPieceClick = null;

    function init(callbacks) {
        boardSvg = document.getElementById('board-svg');
        piecesLayer = document.getElementById('pieces-layer');
        statusEl = document.getElementById('status');
        perfTimeEl = document.getElementById('perf-time');
        perfNodesEl = document.getElementById('perf-nodes');
        onIntersectionClick = callbacks.onIntersectionClick;
        onPieceClick = callbacks.onPieceClick;
        drawBoard();
    }

    function drawBoard() {
        boardSvg.innerHTML = '';

        for (let i = 0; i < LINES.length; i++) {
            const [a, b] = LINES[i];
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', POSITIONS[a].x);
            line.setAttribute('y1', POSITIONS[a].y);
            line.setAttribute('x2', POSITIONS[b].x);
            line.setAttribute('y2', POSITIONS[b].y);
            boardSvg.appendChild(line);
        }

        for (let i = 0; i < 9; i++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', POSITIONS[i].x);
            circle.setAttribute('cy', POSITIONS[i].y);
            circle.setAttribute('r', '15');
            circle.classList.add('intersection');
            circle.dataset.index = i;
            circle.addEventListener('click', () => {
                if (onIntersectionClick) onIntersectionClick(i);
            });
            boardSvg.appendChild(circle);
        }
    }

    function render(state) {
        piecesLayer.innerHTML = '';
        const wrapperRect = piecesLayer.getBoundingClientRect();
        const scaleX = wrapperRect.width / 300;
        const scaleY = wrapperRect.height / 300;

        for (let i = 0; i < 9; i++) {
            if (state.board[i] !== null) {
                const piece = document.createElement('div');
                piece.classList.add('piece', 'player' + state.board[i]);
                piece.dataset.index = i;
                piece.style.left = (POSITIONS[i].x * scaleX) + 'px';
                piece.style.top = (POSITIONS[i].y * scaleY) + 'px';

                if (state.selectedPiece === i) {
                    piece.classList.add('selected');
                }

                piece.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (onPieceClick) onPieceClick(i);
                });

                piecesLayer.appendChild(piece);
            }
        }
    }

    function renderWithPlaceAnimation(state, placedIndex) {
        render(state);
        const piece = piecesLayer.querySelector(`[data-index="${placedIndex}"]`);
        if (piece) {
            piece.classList.add('placing');
        }
    }

    function renderWithMoveAnimation(state, fromIndex, toIndex, callback) {
        const wrapperRect = piecesLayer.getBoundingClientRect();
        const scaleX = wrapperRect.width / 300;
        const scaleY = wrapperRect.height / 300;

        const movingPiece = piecesLayer.querySelector(`[data-index="${fromIndex}"]`);
        if (!movingPiece) {
            render(state);
            if (callback) callback();
            return;
        }

        const deltaX = (POSITIONS[toIndex].x - POSITIONS[fromIndex].x) * scaleX;
        const deltaY = (POSITIONS[toIndex].y - POSITIONS[fromIndex].y) * scaleY;

        movingPiece.style.transition = 'transform 300ms ease-in-out';
        movingPiece.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(1)`;

        setTimeout(() => {
            render(state);
            if (callback) callback();
        }, 320);
    }

    function highlightValidTargets(targets) {
        const circles = boardSvg.querySelectorAll('.intersection');
        circles.forEach(c => c.classList.remove('valid-target'));
        targets.forEach(idx => {
            const circle = boardSvg.querySelector(`[data-index="${idx}"]`);
            if (circle) circle.classList.add('valid-target');
        });
    }

    function clearHighlights() {
        boardSvg.querySelectorAll('.intersection').forEach(c => c.classList.remove('valid-target'));
    }

    function showWin(winLine, state) {
        render(state);
        winLine.forEach(idx => {
            const piece = piecesLayer.querySelector(`[data-index="${idx}"]`);
            if (piece) piece.classList.add('winning');
        });
    }

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function updatePerf(timeMs, nodes) {
        perfTimeEl.textContent = timeMs.toFixed(2) + ' ms';
        perfNodesEl.textContent = nodes.toLocaleString();
    }

    function resetPerf() {
        perfTimeEl.textContent = '- ms';
        perfNodesEl.textContent = '-';
    }

    function getPositions() {
        return POSITIONS;
    }

    return {
        init,
        render,
        renderWithPlaceAnimation,
        renderWithMoveAnimation,
        highlightValidTargets,
        clearHighlights,
        showWin,
        setStatus,
        updatePerf,
        resetPerf,
        getPositions
    };
})();