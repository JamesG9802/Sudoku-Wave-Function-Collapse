import { useRef, useState } from "react";

import Icon from "@mdi/react";

import "./index.css";
import { mdiBroom, mdiCog, mdiEraser, mdiUndo, mdiWrenchClock } from "@mdi/js";
import { SudokuGame, sudoku_delete_cell, sudoku_new, sudoku_place_cell, sudoku_reset, sudoku_set_cell, sudoku_undo } from "./logic";
import { sudoku_collapse, sudoku_parse_bitflag, sudoku_possibilities } from "./wfc";
import { Button, Modal, Popover, Slider, Switch, useTheme } from "@mui/material";
import NumberUI from "./number_ui";
import BigCell from "./bigcell";
import { sudoku_board_hardest } from "./boards";

export default function Sudoku() {
  const theme = useTheme();

  const [sudoku, set_sudoku] = useState<SudokuGame>(
    sudoku_new([0, 0, 0, 0, 2, 0, 4, 0, 0, 9, 0, 6, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 6, 0, 0, 0, 0, 0, 0, 7, 5, 4, 3, 8, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 5, 0, 4, 0, 0, 0, 0, 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 0, 7, 0, 0, 0])
  );

  const [possibilities, set_possibilities] = useState<number[]>([]);
  const [smallest_probability, set_smallest_probability] = useState(-1);
  const [selected_row, set_selected_row] = useState(-1);
  const [selected_col, set_selected_col] = useState(-1);
  const [selected_number, set_selected_number] = useState(0);

  const [in_manual_mode, set_in_manual_mode] = useState(true);

  const [in_automated_mode, set_in_automated_mode] = useState(false);
  const is_solving = useRef(false);

  const [speed_popover_anchor, set_speed_popover_anchor] = useState<HTMLButtonElement | undefined >();
  const show_speed_popover = Boolean(speed_popover_anchor);

  const [ui_solve_speed, set_ui_solve_speed] = useState(50);
  const solve_speed = useRef(1000);
  
  const [showing_new_game_modal, set_showing_new_game_modal] = useState(false);

  function ui_set_sudoku(sudoku: SudokuGame, update_possibilities: boolean) {
    if(update_possibilities)
      ui_set_possibilities(sudoku);
    set_sudoku({...sudoku});
    ui_update_selected(selected_row, selected_col);
  }

  function ui_collapse(row: number, column: number) {
    if(sudoku.board[row * 9 + column] != 0 || possibilities[row * 9 + column] <= 0)
      return;

    //  No possibilities
    for(let i = 0; i < sudoku.board.length; i++) {
      if(sudoku.board[i] == 0 && possibilities[row * 9 + column] <= 0)
        return;
    }

    //  Can't be solving
    if(in_automated_mode)
      return;
    const options = sudoku_parse_bitflag(possibilities[row * 9 + column]);

    //  Must be the least possibilities
    if(options.length != smallest_probability)
      return;
    const random_option = options[Math.floor(Math.random() * options.length)];
    sudoku_place_cell(sudoku, row * 9 + column, random_option);
    ui_set_sudoku({...sudoku}, true);
  }

  function ui_update_selected(row: number, column: number) {
    set_selected_row(row);
    set_selected_col(column);
    set_selected_number(sudoku.board[row * 9 + column]);
  }

  function ui_set_possibilities(sudoku: SudokuGame) {
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
    set_in_automated_mode(false);
    is_solving.current = false;

    sudoku_set_cell(sudoku, index, value);
    ui_set_sudoku(sudoku, !in_manual_mode)
  }

  /**
   * Deletes a cell in sudoku.
   * @param index 
   */
  function ui_delete_sudoku_value(index: number) {
    set_in_automated_mode(false);
    is_solving.current = false;

    sudoku_delete_cell(sudoku, index); 
    
    ui_set_sudoku(sudoku, !in_manual_mode)
  }

  /**
   * Clears the sudoku board.
   */
  function ui_clear_sudoku() {
    set_in_automated_mode(false);
    is_solving.current = false;

    ui_update_selected(-1, -1);

    sudoku_reset(sudoku);
    
    ui_set_sudoku(sudoku, !in_manual_mode)
  }

  /**
   * Toggles between manual and solving mode.
   */
  function ui_switch_mode() {
    set_in_automated_mode(false);
    is_solving.current = false;

    ui_update_selected(-1, -1);

    let target_mode = !in_manual_mode;
    set_in_manual_mode(target_mode);

    if(!target_mode)
      ui_set_possibilities(sudoku);
  }

  /**
   * Undos the latest move.
   * @returns 
   */
  function ui_undo() {
    set_in_automated_mode(false);
    is_solving.current = false;

    if(sudoku.history.length == 0)
      return;
    ui_update_selected(
      Math.floor(sudoku.history[sudoku.history.length - 1].index / 9),
      sudoku.history[sudoku.history.length - 1].index % 9
    );
    sudoku_undo(sudoku);
    
    ui_set_sudoku(sudoku, !in_manual_mode)
  }

  function ui_click_number(cell_value: number) {
    if(selected_row < 0 || selected_col < 0)
      return;
    sudoku_set_cell(sudoku, selected_row * 9 + selected_col, cell_value);
      
    ui_set_sudoku(sudoku, !in_manual_mode)
  }

  return (
    <div>
      <div className="Sudoku">
        <div style={{
          display: "flex",
          flexDirection: "column",
        }}>
          <p className="Sudoku-Title">
            Sudoku Wave Function Collapse Solver
          </p>
          <div
            tabIndex={0}
            className="Sudoku-Board"
            style={{
              backgroundColor: theme.palette.text.primary,
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor: theme.palette.text.primary
            }}

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
                console.log(event.key)
                switch(event.key) {
                  default: 
                    break;
                  case "ArrowLeft":
                    if(selected_col > 0)
                      ui_update_selected(selected_row, selected_col - 1);
                    break;
                  case "ArrowRight":
                    if(selected_col < 8)
                      ui_update_selected(selected_row, selected_col + 1);
                    break;
                  case "ArrowUp":
                    if(selected_row > 0)
                      ui_update_selected(selected_row - 1, selected_col);
                    break;
                  case "ArrowDown":
                    if(selected_row < 8)
                      ui_update_selected(selected_row + 1, selected_col);
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
                  case "Enter":
                    sudoku_collapse(sudoku);
                    set_sudoku({...sudoku});
                    ui_set_sudoku(sudoku, false)
                }
              }
            }}
          >
            {
              //  A sudoku board is represented as a 3x3 board of "big cells" which themselves are a 3x3 board of cells.
              <>
                <BigCell big_cell_index={0} sudoku={sudoku} in_manual_mode={in_manual_mode} is_solving={is_solving.current} solve_speed={solve_speed.current} possibilities={possibilities} smallest_possibility={smallest_probability} selected_row={selected_row} selected_col={selected_col} selected_number={selected_number} ui_update_selected={ui_update_selected} ui_collapse={ui_collapse}/>
                <BigCell big_cell_index={1} sudoku={sudoku} in_manual_mode={in_manual_mode} is_solving={is_solving.current} solve_speed={solve_speed.current} possibilities={possibilities} smallest_possibility={smallest_probability} selected_row={selected_row} selected_col={selected_col} selected_number={selected_number} ui_update_selected={ui_update_selected} ui_collapse={ui_collapse}/>
                <BigCell big_cell_index={2} sudoku={sudoku} in_manual_mode={in_manual_mode} is_solving={is_solving.current} solve_speed={solve_speed.current} possibilities={possibilities} smallest_possibility={smallest_probability} selected_row={selected_row} selected_col={selected_col} selected_number={selected_number} ui_update_selected={ui_update_selected} ui_collapse={ui_collapse}/>
                <BigCell big_cell_index={3} sudoku={sudoku} in_manual_mode={in_manual_mode} is_solving={is_solving.current} solve_speed={solve_speed.current} possibilities={possibilities} smallest_possibility={smallest_probability} selected_row={selected_row} selected_col={selected_col} selected_number={selected_number} ui_update_selected={ui_update_selected} ui_collapse={ui_collapse}/>
                <BigCell big_cell_index={4} sudoku={sudoku} in_manual_mode={in_manual_mode} is_solving={is_solving.current} solve_speed={solve_speed.current} possibilities={possibilities} smallest_possibility={smallest_probability} selected_row={selected_row} selected_col={selected_col} selected_number={selected_number} ui_update_selected={ui_update_selected} ui_collapse={ui_collapse}/>
                <BigCell big_cell_index={5} sudoku={sudoku} in_manual_mode={in_manual_mode} is_solving={is_solving.current} solve_speed={solve_speed.current} possibilities={possibilities} smallest_possibility={smallest_probability} selected_row={selected_row} selected_col={selected_col} selected_number={selected_number} ui_update_selected={ui_update_selected} ui_collapse={ui_collapse}/>
                <BigCell big_cell_index={6} sudoku={sudoku} in_manual_mode={in_manual_mode} is_solving={is_solving.current} solve_speed={solve_speed.current} possibilities={possibilities} smallest_possibility={smallest_probability} selected_row={selected_row} selected_col={selected_col} selected_number={selected_number} ui_update_selected={ui_update_selected} ui_collapse={ui_collapse}/>
                <BigCell big_cell_index={7} sudoku={sudoku} in_manual_mode={in_manual_mode} is_solving={is_solving.current} solve_speed={solve_speed.current} possibilities={possibilities} smallest_possibility={smallest_probability} selected_row={selected_row} selected_col={selected_col} selected_number={selected_number} ui_update_selected={ui_update_selected} ui_collapse={ui_collapse}/>
                <BigCell big_cell_index={8} sudoku={sudoku} in_manual_mode={in_manual_mode} is_solving={is_solving.current} solve_speed={solve_speed.current} possibilities={possibilities} smallest_possibility={smallest_probability} selected_row={selected_row} selected_col={selected_col} selected_number={selected_number} ui_update_selected={ui_update_selected} ui_collapse={ui_collapse}/>
              </>
            }
          </div>
        </div>
        <div className="Sudoku-Right-Panel">
          <Button 
            onClick={() => {
              ui_switch_mode();
            }}
            variant="text"
            sx={{
              display: "flex",
              flexDirection: "column",
              color: theme.palette.text.primary,
              fontSize: "1.25rem",
              textTransform: "none"
            }}
          >
            <p>
              You are in <span style={{color: theme.palette.primary.main, fontWeight: "bold"}}>{in_manual_mode ? "Editing" : "Solving"}</span> mode. 
            </p>
            <div style={{display: "flex", flexDirection: "row"}}>
              <span>Editing Mode</span>
              <Switch 
                checked={!in_manual_mode} 
                onChange={() => { 
                  ui_switch_mode();
                  }
                }
              />
              <span>Solving Mode</span>
            </div>
          </Button>
          <div className="Sudoku-Controls">
            <Button 
              variant="text"
              disabled={sudoku.history.length == 0 || in_automated_mode}
              onClick={() => {
                ui_undo();  
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                color: theme.palette.text.primary
              }}
            >
              <Icon path={mdiUndo} size={1.5} />
              <span className="Sudoku-Button-Text">Undo</span>
            </Button>
            <Button 
              disabled={!in_manual_mode}
              variant="text"
              onClick={() => {
                if(selected_row < 0 || selected_col < 0)
                  return;
                ui_delete_sudoku_value(selected_row * 9 + selected_col)
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                color: theme.palette.text.primary
              }}
            >
              <Icon path={mdiEraser} size={1.5} />
              <span className="Sudoku-Button-Text">Erase</span>
            </Button>
            <Button 
              disabled={!in_manual_mode}
              variant="text"
              onClick={() => {
                ui_clear_sudoku();
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                color: theme.palette.text.primary
              }}
            >
              <Icon path={mdiBroom} size={1.5} />
              <span className="Sudoku-Button-Text">Clear</span>
            </Button>
            <Button 
              variant="text"
              disabled={in_manual_mode}
              onClick={
              () => {
                function solve() {
                  if(!is_solving.current)
                    return;
                  if(sudoku_collapse(sudoku)) {
                    ui_set_sudoku(sudoku, true);
                    setTimeout(() => {solve()}, solve_speed.current);
                  }
                  else {
                    is_solving.current = false;
                    set_in_automated_mode(false);
                  }
                }

                let switching_mode_to = !in_automated_mode;
                set_in_automated_mode(switching_mode_to);
                if(switching_mode_to) { //  automated
                  if(is_solving.current == true)  //  still solving
                    return;
                  is_solving.current = true;
                  solve();
                }
                else {  //  not automated
                  is_solving.current = false;
                }
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                color: in_automated_mode ? theme.palette.secondary.main : theme.palette.text.primary,
                fontWeight: "bold",
              }}
            >
              <Icon 
                path={mdiCog}
                className={`Animated-Gear  +
                  ${in_manual_mode || !in_automated_mode ? "Animated-Pause" : ""} 
                `}
                size={1.5} />
              <span className="Sudoku-Button-Text">Auto Solve</span>
            </Button>
            <Button 
              disabled={in_manual_mode}
              variant="text"
              onClick={(event) => {
                console.log(event.currentTarget)
                set_speed_popover_anchor(event.currentTarget);
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                color: theme.palette.text.primary
              }}
            >
              <Icon path={mdiWrenchClock} size={1.5} />
              <span className="Sudoku-Button-Text">Time</span>
            </Button>
            <Popover
              open={show_speed_popover}
              anchorEl={speed_popover_anchor}
              onClose={() => {
                set_speed_popover_anchor(undefined);
              }}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <div style={{display: "flex", margin: "2rem", marginRight: "3rem"}}>
                <div style={{display: "flex", flexDirection: "column", flexGrow: 0}}>
                  Adjust Solving Speed
                  <Slider size="small"
                    sx={{
                      marginLeft: "1rem",
                      marginRight: "1rem"
                    }}
                    min={0}
                    max={100}
                    step={10}
                    marks={
                      [
                        {
                          value: 0,
                          label: "Slow"
                        },
                        {
                          value: 50,
                          label: "Normal"
                        },
                        {
                          value: 100,
                          label: "Fast"
                        },
                      ]
                    }
                    value={ui_solve_speed}
                    onChange={(_event, value) => {
                      if(typeof value === "number") {
                        set_ui_solve_speed(value);

                        //  The ui scale is flipped so need to flip it internally
                        solve_speed.current = 100 - value;
                        //  Next we transform the scale from [0,100] to [100, 2000]
                        solve_speed.current = 
                          (solve_speed.current) / 100 * (1900) + 100;
                        console.log(solve_speed)
                      }
                    }}
                    disabled={in_manual_mode}
                  />
                </div>
              </div>
            </Popover>
          </div>
          <div className="Number-UI-Container">
            <NumberUI disabled={!in_manual_mode} number={1} onClick={ui_click_number}/>
            <NumberUI disabled={!in_manual_mode} number={2} onClick={ui_click_number}/>
            <NumberUI disabled={!in_manual_mode} number={3} onClick={ui_click_number}/>
            <NumberUI disabled={!in_manual_mode} number={4} onClick={ui_click_number}/>
            <NumberUI disabled={!in_manual_mode} number={5} onClick={ui_click_number}/>
            <NumberUI disabled={!in_manual_mode} number={6} onClick={ui_click_number}/>
            <NumberUI disabled={!in_manual_mode} number={7} onClick={ui_click_number}/>
            <NumberUI disabled={!in_manual_mode} number={8} onClick={ui_click_number}/>
            <NumberUI disabled={!in_manual_mode} number={9} onClick={ui_click_number}/>
          </div>
          <div className="Sudoku-Controls">
            <Button variant="contained" size="large" 
              sx={{
                fontSize: "1.0rem",
                fontWeight: "bold",
              }}
              onClick={() => {
                set_showing_new_game_modal(true);
              }}
            >
              New Game
            </Button>
          </div>
        </div>
        <Modal
          open={showing_new_game_modal}
          onClose={() => {set_showing_new_game_modal(false)}}
        >
          <div
            style={{
              backgroundColor: theme.palette.background.paper,
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "2rem",
              paddingTop: "1rem",
              paddingBottom: "4rem",
              paddingLeft: "2rem",
              paddingRight: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "stretch",
              gap: "4px",
              width: "90%",
              maxWidth: "500px",
              textAlign: "center"
            }}>
              <p style={{fontWeight: "bold", textAlign: "center"}}>
                Choose a new sudoku board.
              </p>
              <Button 
                variant="contained"  
                sx={{
                  display: "flex",
                  justifyContent: "start"
                }}
              >
                Easy
              </Button>
              <Button 
                variant="contained"  
                sx={{
                  display: "flex",
                  justifyContent: "start"
                }}
              >
                Medium
                </Button>
                <Button 
                variant="contained"  
                sx={{
                  display: "flex",
                  justifyContent: "start"
                }}
              >
                Hard
              </Button>
              <Button 
                variant="contained"  
                sx={{
                  display: "flex",
                  justifyContent: "start",
                  fontWeight: "bold"
                }}
                onClick={() => {
                  ui_set_sudoku(sudoku_new(sudoku_board_hardest()), true)
                  set_showing_new_game_modal(false);
                }}
              >
                The World's Hardest Sudoku
              </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}