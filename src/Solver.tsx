import "./Solver.css"
import {board} from "./Sudoku"
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
    for(let i = 0; i < board.length; i++)
    {
        for(let j = 0; j < board[i].length; j++)
        {
            if(board[i][j].value != -1)
                result[i][j] = board[i][j].value; 
        }
    }
    return result;
}

/**
 * Updates the current board with new values.
 * @param newBoard Board to replace the current one
 */
function setBoard(newBoard : number[][]) {
    for(let i = 0; i < board.length; i++)
    {
        for(let j = 0; j < board[i].length; j++)
        {
            board[i][j].setValue(newBoard[i][j]); 
        }
    }
}

/**
 * Sets a single cell on the board
 * @param row
 * @param col 
 * @param value 
 */
function setCell(row: number, col: number, value: Number)
{
    board[row][col].setValue(value);
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

/**
 * 
 */
function solveSudoku() {
    console.log(getBoard());
    console.log(board);
    setBoard([[1,2,3,1,1,1,1,1,1],
        [4,5,6,1,1,1,1,1,1],
        [7,8,9,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],])
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