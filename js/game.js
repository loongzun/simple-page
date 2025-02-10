$(document).ready(function() {
    const $grid = $('#grid');
    const $minesCountDisplay = $('#mines-count');
    const $messageDisplay = $('#message');
    const $restartButton = $('#restart');
    const $difficulty = $('#difficulty');
    const $customSettings = $('#custom-settings');
    const $customWidth = $('#custom-width');
    const $customHeight = $('#custom-height');
    const $customMines = $('#custom-mines');
    let width = 10;
    let height = 10;
    let minesCount = 10;
    let flags = 0;
    let squares = [];
    let isGameOver = false;

    // Create Board
    function createBoard() {
        $grid.empty();
        $grid.css('grid-template-columns', `repeat(${width}, 1fr)`);
        $minesCountDisplay.text(minesCount);
        const minesArray = Array(minesCount).fill('mine');
        const emptyArray = Array(width * height - minesCount).fill('empty');
        const gameArray = emptyArray.concat(minesArray);
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

        for (let i = 0; i < width * height; i++) {
            const $square = $('<div></div>');
            $square.attr('id', i);
            $square.addClass('cell');
            $square.addClass(shuffledArray[i]);
            $grid.append($square);
            squares.push($square);

            // Normal click
            $square.on('click', function() {
                click($square);
            });

            // Right click
            $square.on('contextmenu', function(e) {
                e.preventDefault();
                addFlag($square);
            });
        }

        // Add numbers
        for (let i = 0; i < squares.length; i++) {
            let total = 0;
            const isLeftEdge = (i % width === 0);
            const isRightEdge = (i % width === width - 1);

            if (squares[i].hasClass('empty')) {
                if (i > 0 && !isLeftEdge && squares[i - 1].hasClass('mine')) total++;
                if (i > 9 && !isRightEdge && squares[i + 1 - width].hasClass('mine')) total++;
                if (i > 10 && squares[i - width].hasClass('mine')) total++;
                if (i > 11 && !isLeftEdge && squares[i - 1 - width].hasClass('mine')) total++;
                if (i < width * height - 2 && !isRightEdge && squares[i + 1].hasClass('mine')) total++;
                if (i < width * (height - 1) && !isLeftEdge && squares[i - 1 + width].hasClass('mine')) total++;
                if (i < width * (height - 1) - 2 && !isRightEdge && squares[i + 1 + width].hasClass('mine')) total++;
                if (i < width * (height - 1) - 1 && squares[i + width].hasClass('mine')) total++;
                squares[i].attr('data', total);
                squares[i].addClass('number-' + total);
            }
        }
    }

    // Add Flag with right click
    function addFlag($square) {
        if (isGameOver) return;
        if (!$square.hasClass('revealed') && (flags < minesCount)) {
            if (!$square.hasClass('flagged')) {
                $square.addClass('flagged');
                flags++;
                $minesCountDisplay.text(minesCount - flags); // 更新剩余雷数
                checkForWin();
            } else {
                $square.removeClass('flagged');
                flags--;
                $minesCountDisplay.text(minesCount - flags); // 更新剩余雷数
            }
        }
    }

    // Click on square actions
    function click($square) {
        let currentId = $square.attr('id');
        if (isGameOver) return;
        if ($square.hasClass('revealed') || $square.hasClass('flagged')) return;
        if ($square.hasClass('mine')) {
            gameOver($square);
        } else {
            let total = $square.attr('data');
            if (total != 0) {
                $square.addClass('revealed');
                $square.text(total);
                return;
            }
            $square.addClass('revealed');
            checkSquare($square, currentId);
        }
    }

    // Check neighboring squares once square is clicked
    function checkSquare($square, currentId) {
        const isLeftEdge = (currentId % width === 0);
        const isRightEdge = (currentId % width === width - 1);

        setTimeout(() => {
            if (currentId > 0 && !isLeftEdge) {
                const newId = squares[parseInt(currentId) - 1].attr('id');
                const newSquare = $('#' + newId);
                click(newSquare);
            }
            if (currentId > width - 1 && !isRightEdge) {
                const newId = squares[parseInt(currentId) + 1 - width].attr('id');
                const newSquare = $('#' + newId);
                click(newSquare);
            }
            if (currentId > width) {
                const newId = squares[parseInt(currentId - width)].attr('id');
                const newSquare = $('#' + newId);
                click(newSquare);
            }
            if (currentId > width + 1 && !isLeftEdge) {
                const newId = squares[parseInt(currentId) - 1 - width].attr('id');
                const newSquare = $('#' + newId);
                click(newSquare);
            }
            if (currentId < width * height - 2 && !isRightEdge) {
                const newId = squares[parseInt(currentId) + 1].attr('id');
                const newSquare = $('#' + newId);
                click(newSquare);
            }
            if (currentId < width * (height - 1) && !isLeftEdge) {
                const newId = squares[parseInt(currentId) - 1 + width].attr('id');
                const newSquare = $('#' + newId);
                click(newSquare);
            }
            if (currentId < width * (height - 1) - 2 && !isRightEdge) {
                const newId = squares[parseInt(currentId) + 1 + width].attr('id');
                const newSquare = $('#' + newId);
                click(newSquare);
            }
            if (currentId < width * (height - 1) - 1) {
                const newId = squares[parseInt(currentId) + width].attr('id');
                const newSquare = $('#' + newId);
                click(newSquare);
            }
        }, 10);
    }

    // Game Over
    function gameOver($square) {
        $messageDisplay.text('游戏结束!');
        isGameOver = true;

        // Show all mines
        squares.forEach($square => {
            if ($square.hasClass('mine')) {
                $square.addClass('revealed');
            }
        });
    }

    // Check for win
    function checkForWin() {
        let matches = 0;
        for (let i = 0; i < squares.length; i++) {
            if (squares[i].hasClass('flagged') && squares[i].hasClass('mine')) {
                matches++;
            }
            if (matches === minesCount) {
                $messageDisplay.text('你赢了!');
                isGameOver = true;

                // Show all squares
                squares.forEach($square => {
                    $square.addClass('revealed');
                    if ($square.hasClass('mine')) {
                        $square.addClass('revealed');
                    } else {
                        let total = $square.attr('data');
                        if (total != 0) {
                            $square.text(total);
                        }
                    }
                });
            }
        }
    }

    // Restart Game
    $restartButton.on('click', function() {
        startGame();
    });

    // Difficulty change
    $difficulty.on('change', function() {
        if ($(this).val() === 'custom') {
            $customSettings.show();
        } else {
            $customSettings.hide();
        }
    });

    // Start Game
    function startGame() {
        const difficulty = $difficulty.val();
        switch (difficulty) {
            case 'easy':
                width = 10;
                height = 10;
                minesCount = 10;
                break;
            case 'medium':
                width = 15;
                height = 15;
                minesCount = 40;
                break;
            case 'hard':
                width = 20;
                height = 20;
                minesCount = 80;
                break;
            case 'custom':
                width = parseInt($customWidth.val());
                height = parseInt($customHeight.val());
                minesCount = parseInt($customMines.val());
                break;
        }
        flags = 0;
        squares = [];
        isGameOver = false;
        $messageDisplay.text('');
        createBoard();
    }

    startGame();
});