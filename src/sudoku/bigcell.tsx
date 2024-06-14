import { memo, useEffect, useRef } from "react";
import { SudokuGame } from "./logic";
import { useTheme } from "@mui/material";
import Cell from "./cell";
/**
 * The props for a Big Cell.
 */
type BigCellProps = {
    /**
     * The board to be referenced.
     */
    sudoku: SudokuGame,
    /**
     * The index indicating which cell of the 3x3 board is the big cell.
     */
    big_cell_index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

    /**
     * Whether the game is in manual mode
     */
    in_manual_mode: boolean;
    is_solving: boolean;
    solve_speed: number;

    possibilities: number[]
    smallest_possibility: number

    selected_row: number,
    selected_col: number, 
    selected_number: number, 

    ui_update_selected: (row: number, column: number) => void
    ui_collapse: (row: number, column: number) => void
}
  
export const BigCell = memo(function({sudoku, big_cell_index, 
    in_manual_mode,
    is_solving,
    solve_speed,
    possibilities, smallest_possibility,
    selected_row, selected_col, selected_number,
    ui_update_selected,
    ui_collapse}: BigCellProps
) {
    const theme = useTheme();
    const previous_board = useRef<number[]>([]);
    let solve_index: number = -1;

    useEffect(() => {
      for(let i = 0; i < sudoku.board.length; i++) {
        previous_board.current[i] = sudoku.board[i];
      }
    }, [])

    if(is_solving)
    {
      for(let i = 0; i < sudoku.board.length; i++) {
        if(previous_board.current[i] != sudoku.board[i])
        {
          solve_index = i;
        }
        previous_board.current[i] = sudoku.board[i];
      }
    }
    else {
      for(let i = 0; i < sudoku.board.length; i++) {
        previous_board.current[i] = sudoku.board[i];
      }
    }
  
    let cells: number[] = [];
    //  The row and column of the topleft cell of the big cell.
    let starting_row: number = 3 * Math.floor(big_cell_index / 3);
    let starting_col: number = 3 * (big_cell_index % 3);
    for(let row = 0; row < 3; row++) {
        for(let col = 0; col < 3; col++) {
            const cell_row = starting_row + row;
            const cell_col = starting_col + col;
            const cell_index = cell_row * 9 + cell_col;
            cells.push(cell_index);
        }
    }

    return (
        <div className="Sudoku-Big-Cell" style={{
            backgroundColor: theme.palette.text.primary,
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: theme.palette.text.primary
        }}>
        {
          cells.map(
            (value, index) => {
              const cell_value = sudoku.board[value];

              const this_row = Math.floor(value / 9);
              const this_col = value % 9;

            //   const same_row_and_col = this_row == selected_row && this_col == selected_col;
            //   const same_row_or_col = this_row == selected_row || this_col == selected_col;

            //   const this_cell_possibilities = sudoku_parse_bitflag(possibilies[value]);
              
            return (
                <Cell
                    key={index}
                    cell_value={cell_value}
                    onClick={
                        () => {
                          if(this_row == selected_row && this_col == selected_col)
                              return;
                          if(in_manual_mode)
                            ui_update_selected(this_row, this_col);
                          else {
                            ui_collapse(this_row, this_col);
                          }
                        }
                    }
                    in_manual_mode={in_manual_mode}
                    is_solving={is_solving}
                    solve_changed={solve_index == value}
                    solve_speed={solve_speed}
                    possibilities={in_manual_mode ? undefined : possibilities[value]}
                    smallest_possibility={in_manual_mode ? undefined : smallest_possibility}
                    row={this_row}
                    col={this_col}
                    selected_row={selected_row}
                    selected_col={selected_col}
                    selected_number={selected_number}
                />
              )
            }
          )
        }
      </div>
    )
});

export default BigCell;