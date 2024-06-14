import { SudokuBoard, SudokuGame, sudoku_new } from "./logic";
import { SudokuSolver, sudoku_solve, sudoku_solver_new } from "./wfc";

export function sudoku_board_random(): SudokuBoard {
    let sudoku: SudokuGame = sudoku_new();
    let solver: SudokuSolver = sudoku_solver_new();

    while(!sudoku_solve(sudoku, solver)) {}

    let same_numbers = []
    for(let i = 0; i < 81; same_numbers.push(i++)) {}

    //  https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffle(array: number[]) {
        let currentIndex = array.length;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          let randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      }
      
    shuffle(same_numbers);
    //  Randomly leave 17 to 26 numbers
    for(let i = 17 + Math.floor(Math.random() * 6); i < same_numbers.length; i++) {
        sudoku.board[same_numbers[i]] = 0;
    }
    return sudoku.board;
}

export function sudoku_board_hardest(): SudokuBoard {
    return [8,0,0,0,0,0,0,0,0,0,0,3,6,0,0,0,0,0,0,7,0,0,9,0,2,0,0,0,5,0,0,0,7,0,0,0,0,0,0,0,4,5,7,0,0,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,0,6,8,0,0,8,5,0,0,0,1,0,0,9,0,0,0,0,0,4,0];
}