import "./Solver.css"

/**
 * Gets the board and returns it as a 9 x 9 matrix. -1 means nothing in the cell
 * @returns a 2D array representing the board
 */
function getBoard() {
    let result = [
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, ],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, ],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, ],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, ],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, ],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, ],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, ],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, ],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, ],
    ];
    const board = document.getElementById("Sudoku_board");
    if(board == undefined) return null;
    const bigCells = board.getElementsByClassName("Sudoku_bigcell");
    if(bigCells.length != 9)    return null;
    for(let i = 0; i < bigCells.length; i++)
    {
        //  Row and col of the upperleft most cell of the bigcell.
        const row = (i - i % 3);
        const col = (i % 3) * 3;

        const cells = bigCells[i].children;
        for(let j = 0; j < cells.length; j++)
        {
            const myRow = row + (j - j % 3) / 3;
            const myCol = col + (j % 3);
            if((cells[j] as HTMLElement).dataset.value != undefined)
                result[myRow][myCol] = Number((cells[j] as HTMLElement).dataset.value);
            else
                result[myRow][myCol] = -1;
        }
    }
    return result;
}

/**
 * Checks if a sudoku board is valid at the current state.
 * @returns 
 */
function isValid() {
    const board = getBoard();
    if(board == undefined) return;

    //  Row Square Check    check if sum == 45 (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9)
    for(let i = 0; i < 9; i++)
    {
        let sum = 0;
        for(let j = 0; j < 9; j++)
            sum += board[i][j];
        if(sum != 45)   return false;
    }

    //  Column Square Check    check if sum == 45
    for(let j = 0; j < 9; j++)
    {
        let sum = 0;
        for(let i = 0; i < 9; i++)
            sum += board[i][j];
        if(sum != 45)   return false;
    }

    //  Big Cell check  check if sum == 45
    for(let i = 0; i < 9; i++)
    {
        const row = (i - i % 3);
        const col = (i % 3) * 3;
        let sum = board[row + 0][col + 0]
        + board[row + 0][col + 1]
        + board[row + 0][col + 2]
        + board[row + 1][col + 0]
        + board[row + 1][col + 1]
        + board[row + 1][col + 2]
        + board[row + 2][col + 0]
        + board[row + 2][col + 1]
        + board[row + 2][col + 2];
        if(sum != 45)   return false;
    }
    return true;
}

function solveSudoku() {
    console.log(isValid())
}

function Solver() {
    return (
        <>
        <div onClick={solveSudoku} className="Solver_button">
            Solve
        </div>
        </>
    );
}

export default Solver;