import { useEffect, useState } from "react";

import Icon from "@mdi/react";

import "./index.css";
import { mdiAutoFix, mdiBroom, mdiEraser, mdiHandBackLeft, mdiUndo } from "@mdi/js";
import { SudokuBoard, SudokuGame, sudoku_delete_cell, sudoku_length, sudoku_reset, sudoku_set_cell, sudoku_undo } from "./logic";
import { sudoku_parse_bitflag, sudoku_possibilities } from "./wfc";

export default function Sudoku() {
  const [sudoku, set_sudoku] = useState<SudokuGame>(
    {
      board: [],
      history: []
    }
  );

  const [possibilies, set_possibilities] = useState<number[]>([]);
  const [smallest_probability, set_smallest_probability] = useState(-1);
  const [selected_row, set_selected_row] = useState(-1);
  const [selected_col, set_selected_col] = useState(-1);

  const [in_manual_mode, set_in_manual_mode] = useState(true);

  function ui_set_possibilities() {
      let new_possibilities: number[] = sudoku_possibilities(sudoku);
      set_possibilities(new_possibilities);

      let min = Number.MAX_SAFE_INTEGER;
      for(let i = 0; i < new_possibilities.length; i++) {
        //  If the cell is occupied, ignore it
        if(sudoku.board[i] != 0)
          continue;

        const length = sudoku_parse_bitflag(new_possibilities[i]).length;
        
        if(length < min) {
          min = length;
        }
      }
      set_smallest_probability(min);
      console.log(new_possibilities);
  }

  /**
   * Sets the value of the sudoku.
   * @param index 
   * @param value 
   */
  function ui_set_sudoku_value(index: number, value: number) {
    sudoku_set_cell(sudoku, index, value);
    set_sudoku({...sudoku});
    
    if(!in_manual_mode)
      ui_set_possibilities();
  }

  /**
   * Deletes a cell in sudoku.
   * @param index 
   */
  function ui_delete_sudoku_value(index: number) {
    sudoku_delete_cell(sudoku, index); 
    set_sudoku({...sudoku});

    if(!in_manual_mode)
      ui_set_possibilities();
  }

  /**
   * Clears the sudoku board.
   */
  function ui_clear_sudoku() {
    set_selected_row(-1);
    set_selected_col(-1);
    sudoku_reset(sudoku);
    set_sudoku({...sudoku});

    if(!in_manual_mode)
      ui_set_possibilities();
  }

  /**
   * Toggles between editing and solving mode.
   */
  function ui_switch_mode() {
    set_selected_row(-1);
    set_selected_col(-1);

    let target_mode = !in_manual_mode;
    set_in_manual_mode(target_mode);

    if(!target_mode)
      ui_set_possibilities();
  }

  /**
   * Undos the latest move.
   * @returns 
   */
  function ui_undo() {
    if(sudoku.history.length == 0)
      return;
    set_selected_row(Math.floor(sudoku.history[sudoku.history.length - 1].index / 9));
    set_selected_col(sudoku.history[sudoku.history.length - 1].index % 9); 
    sudoku_undo(sudoku);
    set_sudoku({...sudoku});

    if(!in_manual_mode)
      ui_set_possibilities();
  }

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
  }
  /**
   * Returns an appropriate big cell for the sudoku board.
   * @param param0 
   */
  function BigCell({sudoku, big_cell_index}: BigCellProps) {
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
      <div className="Sudoku-Big-Cell">
        {
          cells.map(
            (value, index) => {
              const cell_value = sudoku.board[value];

              const this_row = Math.floor(value / 9);
              const this_col = value % 9;

              const same_row_and_col = this_row == selected_row && this_col == selected_col;
              const same_row_or_col = this_row == selected_row || this_col == selected_col;

              const this_cell_possibilities = sudoku_parse_bitflag(possibilies[value]);
              return (
                <div 
                  title={`${this_row}, ${this_col}`}
                  key={index}
                  onClick={() => {
                    set_selected_row(this_row);
                    set_selected_col(this_col);
                  }}
                  className={
                    `Sudoku-Cell${cell_value == 0 && in_manual_mode ? " Sudoku-Empty" : ""}
                      ${(
                          same_row_and_col ?  " Sudoku-Cell-Selected" : 
                          same_row_or_col ?   " Sudoku-Cell-Indicator" :
                                              " Sudoku-Cell-Normal"
                      )}
                      ${in_manual_mode ? " clams" : (
                          cell_value != 0 ? " Solving-Done" :
                          this_cell_possibilities.length == smallest_probability ? 
                            " Solving-Possible" : 
                            " Solving-Ignore"                                   
                      )}
                    }`} >
                  <p>
                    {in_manual_mode ? cell_value : 
                    cell_value != 0 ? cell_value :
                    `[${this_cell_possibilities}]`}
                  </p>
                </div>
              )
            }
          )
        }
      </div>
    )
  }

  type NumberUIProps = {
    /**
     * The number that will be placed into the sudoku board.
     */
    number: number;
  }
  function NumberUI({number}: NumberUIProps) {
    return (
      <div 
        title={String(number)}
        className="Number-UI"
        onClick={() => {
          if(selected_row < 0 || selected_col < 0)
            return;
          sudoku_set_cell(sudoku, selected_row * 9 + selected_col, number);
          set_sudoku({...sudoku});

          if(!in_manual_mode)
            set_possibilities(sudoku_possibilities(sudoku));  
        }}
      >
        <p>{number}</p>
      </div>
    )
  }

  /**
   * On initialization, set up the board.
   */
  useEffect(() => {
    let easy_sudoku_board: SudokuBoard = [
      9,6,0,3,0,0,4,1,0,
      1,8,5,0,2,0,7,0,3,
      0,0,0,5,0,0,9,2,8,
      0,9,6,8,0,2,0,5,7,
      2,1,0,0,4,0,3,0,0,
      0,5,0,0,0,6,0,8,4,
      5,0,0,0,0,4,6,0,0,
      0,0,0,6,1,3,5,4,0,
      0,0,9,0,0,7,0,0,0,
    ];
    let medium_sudoku_board: SudokuBoard = [
      7,1,4,2,5,0,3,8,0,
      0,6,0,0,0,0,1,9,0,
      5,0,9,6,3,1,7,2,0,
      0,0,0,8,0,0,0,0,1,
      8,0,5,0,0,0,2,0,0,
      4,2,0,0,6,5,0,0,0,
      0,4,0,0,0,0,5,0,0,
      0,0,7,0,1,8,0,0,2,
      0,0,0,5,9,0,6,0,7
    ]
    let medium_sudoku_board_partial_solve: SudokuBoard = [
      7,1,4,2,5,9,3,8,6,
      0,6,0,0,0,0,1,9,5,
      5,8,9,6,3,1,7,2,4,
      0,0,0,8,0,0,0,0,1,
      8,0,5,0,0,0,2,0,0,
      4,2,0,0,6,5,0,0,0,
      0,4,0,0,0,0,5,0,0,
      0,0,7,0,1,8,0,0,2,
      0,3,0,5,9,0,6,0,7
    ]
    let medium_sudoku_board_partial_solve_ir1_bc: SudokuBoard = [
      7,1,4,2,5,9,3,8,6,
      0,6,0,0,8,0,1,9,5,
      5,8,9,6,3,1,7,2,4,
      0,0,0,8,0,0,0,0,1,
      8,0,5,0,0,0,2,0,0,
      4,2,1,0,6,5,0,0,0,
      0,4,0,0,0,0,5,0,0,
      0,0,7,0,1,8,0,0,2,
      0,3,0,5,9,0,6,0,7
    ]
    let extreme_sudoku_board: SudokuBoard = [5, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 6, 1, 7, 0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 6, 0, 0, 0, 1, 0, 0, 0, 9, 0, 3, 0, 0, 8, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 8, 0, 0, 2, 0, 0, 0, 5, 0, 7, 0, 0, 0, 8, 0, 0, 0, 6, 0, 0, 0, 4];
    let extreme_sudoku_board_2: SudokuBoard = [0, 0, 0, 0, 2, 0, 4, 0, 0, 9, 0, 6, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 6, 0, 0, 0, 0, 0, 0, 7, 5, 4, 3, 8, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 5, 0, 4, 0, 0, 0, 0, 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 0, 7, 0, 0, 0];
    let hardest_sudoku_board: SudokuBoard = [
      0,0,0,1,0,2,0,0,0,
      0,6,0,0,0,0,0,7,0,
      0,0,8,0,0,0,9,0,0,
      4,0,0,0,0,0,0,0,3,
      0,5,0,0,0,7,0,0,0,
      2,0,0,0,8,0,0,0,1,
      0,0,9,0,0,0,8,0,5,
      0,7,0,0,0,0,0,6,0,
      0,0,0,3,0,4,0,0,0,
    ]
    sudoku.board = [...extreme_sudoku_board_2];
    set_sudoku({...sudoku});
  }, []);

  return (
    <div className="Sudoku">
      <div
        tabIndex={0}
        className="Sudoku-Board"

        /**
         * On key press, put the number from the keyboard onto the board.
         * Arrow keys move the selected square.
         * Backspace and delete remove the number.
         */
        onKeyDown={(event) => {
          if(selected_row < 0 || selected_col < 0)
            return;
          let number = Number(event.key);
          if(!isNaN(number) && number != 0)
          {
            ui_set_sudoku_value(selected_row * 9 + selected_col, number);
          } 
          else {
            switch(event.key) {
              default: 
                break;
              case "ArrowLeft":
                if(selected_col > 0)
                  set_selected_col(selected_col - 1);
                break;
              case "ArrowRight":
                if(selected_col < 8)
                  set_selected_col(selected_col + 1);
                break;
              case "ArrowUp":
                if(selected_row > 0)
                  set_selected_row(selected_row - 1);
                break;
              case "ArrowDown":
                if(selected_row < 8)
                  set_selected_row(selected_row + 1);
                break;
              case "Backspace":
              case "Delete":
                ui_delete_sudoku_value(selected_row * 9 + selected_col);
                break;
              case "[":
                console.log(sudoku.board);
                navigator.clipboard.writeText(JSON.stringify(sudoku.board));
                break;
                
              case "]":
                navigator.clipboard.readText()
                .then((text) => {
                  console.log(text);
                  sudoku.board = JSON.parse(text) as number[];
                  set_sudoku({...sudoku});
                });
                break;
            }
          }
        }}
      >
        {
          //  A sudoku board is represented as a 3x3 board of "big cells" which themselves are a 3x3 board of cells.
          <>
            <BigCell sudoku={sudoku} big_cell_index={0}/>
            <BigCell sudoku={sudoku} big_cell_index={1}/>
            <BigCell sudoku={sudoku} big_cell_index={2}/>
            <BigCell sudoku={sudoku} big_cell_index={3}/>
            <BigCell sudoku={sudoku} big_cell_index={4}/>
            <BigCell sudoku={sudoku} big_cell_index={5}/>
            <BigCell sudoku={sudoku} big_cell_index={6}/>
            <BigCell sudoku={sudoku} big_cell_index={7}/>
            <BigCell sudoku={sudoku} big_cell_index={8}/>
          </>
        }
      </div>
      <div className="Sudoku-Right-Panel">
        <div className="Sudoku-Right-Panel-Mode">
          <p>
            You are in <span className={`accent strong ${in_manual_mode ? "Editing" : "Solving"}`}>{in_manual_mode ? "Editing" : "Solving"}</span> mode. 
          </p> 
          <p>
            Click the {in_manual_mode ? "wand" : "hand"} to switch to <span className={`accent strong ${in_manual_mode ? "Solving" : "Editing"}`}>{in_manual_mode ? "solving": "editing"}</span> mode.
          </p>
        </div>
        <div className="Sudoku-Controls">
          <div 
            title="Undo"
            onClick={() => {
              ui_undo();  
            }}
          >
            <div className="Sudoku-Controls-Icon">
              <Icon path={mdiUndo} size={1.5} />
            </div>
            <span>Undo</span>
          </div>
          <div 
            title="Erase"
            onClick={() => {
              if(selected_row < 0 || selected_col < 0)
                return;
              ui_delete_sudoku_value(selected_row * 9 + selected_col)
            }}
          >
            <div className="Sudoku-Controls-Icon">
              <Icon path={mdiEraser} size={1.5} />
            </div>
            <span>Erase</span>
          </div>
          <div 
            title={in_manual_mode ? "Switch to solving mode" : "Switch to editing mode"}
            onClick={() => {
              ui_switch_mode();
            }}
          >
            <div className={`Sudoku-Controls-Icon ${in_manual_mode ? "Solving" : "Editing"}`}>
              <Icon path={in_manual_mode ? mdiAutoFix : mdiHandBackLeft} size={1.5} />
            </div>
            <span>{in_manual_mode ? "Solve" : "Edit"}</span>
          </div>
          <div 
            title="Clear"
            onClick={() => {
              ui_clear_sudoku();
            }}
          >
            <div className="Sudoku-Controls-Icon">
              <Icon path={mdiBroom} size={1.5} />
            </div>
            <span>Clear</span>
          </div>
        </div>
        <div className="Number-UI-Container">
          <NumberUI number={1}/>
          <NumberUI number={2}/>
          <NumberUI number={3}/>
          <NumberUI number={4}/>
          <NumberUI number={5}/>
          <NumberUI number={6}/>
          <NumberUI number={7}/>
          <NumberUI number={8}/>
          <NumberUI number={9}/>
        </div>
      </div>
    </div>
  );
}