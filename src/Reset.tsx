import "./Solver.css"   //  Same styling as Solver Button
import {board} from "./Sudoku"
function resetBoard() {
    for(let i = 0; i < board.length; i++)
    {
        for(let j = 0; j < board[i].length; j++)
        {
            board[i][j].userInputted = false;
            board[i][j].setValue(-1); 
        }
    }
}

function ResetButton() {
    return <>
        <div onClick={resetBoard} className="Solver_button">
            Reset
        </div>
    </>
}
export default ResetButton;