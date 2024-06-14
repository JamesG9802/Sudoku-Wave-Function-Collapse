
/**
 * A game a sudoku with its board and history.
 */
export type SudokuGame = {
    board: SudokuBoard;
    history: SudokuMove[];
}

/**
 * A sudoku board is represented as a 1D array of numbers. 0 represents an empty space.
 */
export type SudokuBoard = number[];

/**
 * The length of a sudoku board.
 */
export const sudoku_length = 81;

/**
 * Bitwise flag for setting the value on the board.
 */
export const SET = 0b001;

/**
 * Bitwise flag for placing the value on the board.
 */
export const PLACE = 0b010;

/**
 * Bitwise flag for deleting the value on the board.
 */
export const DELETE = 0b001;

/**
 * A sudoku move that can be played on the board.
 */
export type SudokuMove = {
    /**
     * The index of the board where the move was played on.
     */
    index: number;

    /**
     * The type of move played.
     */
    type: 
        0b001 | 
        0b010 | 
        0b100;

    /**
     * The value of the cell after this cell was made.
     */
    value: number

    /**
     * The previous value of the cell before this move was made.
     */
    last_value?: number
}

/**
 * Creates and returns a new sudoku game
 * @param board optionally initializes with the given board.
 * @returns 
 */
export function sudoku_new(board?: number[]): SudokuGame {
    return {
        board: board != undefined ? board : [
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
        ],
        history: []
    };
}

/**
 * Make a move on a sudoku board.
 * @param sudoku the game to be changed.
 * @param move the move to be played.
 */
export function sudoku_make_move(sudoku: SudokuGame, move: SudokuMove) {
    sudoku.board[move.index] = move.value;
    sudoku.history.push(move);
}

/**
 * Undos the last move on the sudoku board.
 * @param sudoku the game to be changed.
 * @returns 
 */
export function sudoku_undo(sudoku: SudokuGame): boolean {
    let last_move: SudokuMove | undefined = sudoku.history.pop();
    if(!last_move)
        return false;
    switch(last_move.type) {
        case DELETE:
        case SET:
            if(last_move.last_value == undefined)
            {
                console.error("Something went wrong tring to undo", last_move);
                return false;
            }
            sudoku.board[last_move.index] = last_move.last_value;
            break;
        case PLACE:
            sudoku.board[last_move.index] = 0;
            break;
    }
    return true;
}

/**
 * Sets a number on the sudoku board. Returns true if it is a valid move.
 * @param sudoku the game to be changed
 * @param index the index of the cell using row major order
 * @param value the sudoku value to be inserted 
 * @returns 
 */
export function sudoku_set_cell(sudoku: SudokuGame, index: number, value: number): boolean {
    if(index < 0 || index >= sudoku_length)
        return false;

    //  Cannot set duplicate values.
    if(sudoku.board[index] == value)
        return false;
    const last_value: number = sudoku.board[index];

    const move: SudokuMove = {
        index: index,
        type: SET,
        value: value,
        last_value: last_value
    };
    sudoku_make_move(sudoku, move);

    return true;
}

/**
 * Places a number on the sudoku board. Returns true if it is a valid move.
 * @param sudoku the game to be changed
 * @param index the index of the cell using row major order
 * @param value the sudoku value to be inserted
 * @returns 
 */
export function sudoku_place_cell(sudoku: SudokuGame, index: number, value: number): boolean {
    if(index < 0 || index >= sudoku_length)
        return false;

    //  Cannot override nonempty cells
    if(sudoku.board[index] != 0)
        return false;
    
    const move: SudokuMove = {
        index: index,
        type: PLACE,
        value: value,
    };
    sudoku_make_move(sudoku, move);

    return true;
}

/**
 * Deletes a cell on the sudoku board. Returns true if it is a valid move.
 * @param sudoku the game to be changed
 * @param index the index of the cell using row major order
 * @returns 
 */
export function sudoku_delete_cell(sudoku: SudokuGame, index: number): boolean {
    if(index < 0 || index >= sudoku_length)
        return false;

    //  Cannot delete empty cells.
    if(sudoku.board[index] == 0)
        return false;
    
    const last_value: number = sudoku.board[index];

    const move: SudokuMove = {
        index: index,
        type: DELETE,
        value: 0,
        last_value: last_value
    };
    sudoku_make_move(sudoku, move);

    return true;
}

/**
 * Resets the sudoku game to a blank board.
 * @param sudoku the sudoku game.
 */
export function sudoku_reset(sudoku: SudokuGame) {
    for(let i = 0; i < sudoku.board.length; i++) {
        sudoku.board[i] = 0;
    }
    sudoku.history = [];
}