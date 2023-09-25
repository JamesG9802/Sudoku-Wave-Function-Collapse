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
 * Checks if a sudoku board is solved at the current state.
 * @param board
 * @returns 
 */
function isSolved(board : number[][]) {
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
 * Takes in a board and calculates every possible valid move.
 * @param board - the board to be evaluated
 * @returns the potential moves for each square.
 */
function generatePossibilities(board: number[][]) {
    let possibilities : Set<number>[][] = [];
    for(let i = 0; i < board.length; i++)
    {
        possibilities[i] = [];
        for(let j = 0; j < board[i].length; j++)
        {
            
            if(board[i][j] != -1)   //  already has a collapsed value.
            {
                possibilities[i][j] = new Set<number>();
                continue;
            }
            else
                possibilities[i][j] = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        }
    }

    for(let i = 0; i < board.length; i++)
    {
        for(let j = 0; j < board[i].length; j++)
        {
            if(board[i][j] == -1)   //  can't reduce possibility space
                continue;
            //  remove possibility from the same row
            for(let k = 0; k < board[i].length; k++)
                possibilities[i][k].delete(board[i][j]);
            //  remove possibility from the same col
            for(let k = 0; k < board[i].length; k++)
                possibilities[k][j].delete(board[i][j]);
            //  remove possibility from the same big square
            for(let k = 0; k < 9; k++)
                possibilities[i - i % 3 + (k - k % 3) / 3][j - j % 3 + k % 3].delete(board[i][j]);
        }
    }
    return possibilities;
}

/**
 * 
 */
function solveSudoku() {
    let _board = getBoard();

    //  Stop if the user wants to solve with a solved board
    if(isSolved(_board))    return;

    let possibilities = generatePossibilities(_board);
    /**
     * Stores the best options in an array formatted like:
     * 0 - size
     * 1 - row
     * 2 - column
     */
    let bestOptions : number[][] = [];
    for(let i = 0; i < possibilities.length; i++)
    {
        for(let j = 0; j < possibilities[i].length; j++)
        {
            if(possibilities[i][j].size == 0)
            {
                if(_board[i][j] == -1)
                {
                    console.log("An invalid board state has been found for: ", i, j);
                    return;
                }
                else continue;  //  collapsed position
            }
            //  this is the first possibility
            if(bestOptions.length == 0)
                bestOptions.push([possibilities[i][j].size, i, j]);
            //  disregard possibility since it has higher entropy than better option found
            else if (possibilities[i][j].size > bestOptions[0][0])
                continue;
            //  same entropy so add to possibilities;
            else if (possibilities[i][j].size == bestOptions[0][0])
                bestOptions.push([possibilities[i][j].size, i, j]);
            //  lower entropy than all options found
            else
                bestOptions = [[possibilities[i][j].size, i, j]];
        }
    }
    //  pick a random choice
    let option = bestOptions[Math.floor(Math.random() * bestOptions.length)];
    //  apply random option
    let collapsedValue =  Array.from(possibilities[option[1]][option[2]])
        [Math.floor(Math.random() * possibilities[option[1]][option[2]].size)]
    setCell(option[1], option[2], collapsedValue);

    //  Stop when board is solved
    _board[option[1]][option[2]] = collapsedValue;
    if(isSolved(_board))
        return;
    else
        solveSudoku();
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