import './Sudoku.css'
import React, { KeyboardEvent, createRef, RefObject } from 'react';

/**
 * The current cell selected by the user.
 */
export let currentCell : Cell;

/**
 * The internal board representation of all the sudoku cells.
 */
export let board : Cell[][];

let bigCellCount = 0;
let currentCellCount = 0;

interface CellProps {
  bigCellCount : number,
  value : any
}
class Cell extends React.Component<CellProps> {

  /**
   * True if the user specifically added the value through the keyboard.
   */
  userInputted : boolean;
  /**
   * A valid value ranges from 1 to 9. An invalid value is stored as -1.
   */
  value : any;
  isSelected : boolean;
  componentReference : RefObject<any>;
  row : number;
  col : number;
  constructor(props : CellProps) {
    super(props);
    
    this.userInputted = false;
    this.value = Number(props.value);
    this.isSelected = false;
    this.componentReference = createRef();

    this.onKeyPressHandler = this.onKeyPressHandler.bind(this);
    this.onFocusHandler = this.onFocusHandler.bind(this);

    this.setValue = this.setValue.bind(this);
    this.setUserValue = this.setUserValue.bind(this);
    
    const bigr = (props.bigCellCount - props.bigCellCount % 3);
    const bigc = (props.bigCellCount % 3) * 3;
    const myRow = bigr + (currentCellCount - currentCellCount % 3) / 3;
    const myCol = bigc + (currentCellCount % 3);
    this.row = myRow;
    this.col = myCol;
    board[this.row][this.col] = this;
    currentCellCount++;
  }

  /**
   * Sets focus on this element.
   */
  onFocusHandler() {
    if(currentCell != undefined)
    {
      currentCell.isSelected = false;
      currentCell.forceUpdate();
    }
    currentCell = this;
    currentCell.isSelected = true;
    currentCell.forceUpdate();
  }

  onKeyPressHandler(event : KeyboardEvent) {
    //  Moving the cell
    let verticalDir = 0;
    let horizontalDir = 0;
    if(event.key === "ArrowUp")
      verticalDir = -1;
    else if(event.key === "ArrowDown")
      verticalDir = +1;
    else if(event.key === "ArrowLeft")
      horizontalDir = -1;
    else if(event.key === "ArrowRight")
      horizontalDir = +1;
    
    if(verticalDir != 0 || horizontalDir != 0)
    {
      let targetRow;
      let targetCol;
      //  Bounds checking
      if(this.row + verticalDir > 8)  targetRow = 0;
      else if(this.row + verticalDir < 0) targetRow = 8;
      else  targetRow = this.row + verticalDir;
      if(this.col + horizontalDir > 8)  targetCol = 0;
      else if(this.col + horizontalDir < 0) targetCol = 8;
      else  targetCol = this.col + horizontalDir;

      board[targetRow][targetCol].componentReference.current.focus();
    }
    //  Clearing a cell
    if(event.key === "Backspace" || event.key === "Delete")
    {
      this.value = -1;
      this.userInputted = false;
      this.forceUpdate();
      return; 
    }
    //  Inputting a number
    if(isNaN(Number(event.key)) || Number(event.key) == 0) return;
    this.setUserValue(Number(event.key));
  }

  setValue(value: any) {
    this.value = value;
    this.forceUpdate();
  }

  /**
   * Identical to set value, but also sets the "userInputted" flag.
   * @param value 
   */
  setUserValue(value: any) {
    this.userInputted = true;
    this.setValue(value);
  }
  
  render() {
    let isSelected = "";
    if(this.isSelected) isSelected += " Sudoku_selected";
    let isUserInputted = "";
    if(this.userInputted) isUserInputted += " Sudoku_userinputted";
    if(this.value != undefined)
    {
      let value = String(this.value);
      let className = "Sudoku_cell" + isSelected + isUserInputted;
      //  has no value, but not in solving mode yet
      if(this.value == "-1")
        value = "";
      return (
        <>
          <div ref={this.componentReference} tabIndex={0}
            onFocus={this.onFocusHandler}
            onKeyUp={this.onKeyPressHandler} className={className} data-value={this.value}>
            {value}
          </div>
        </>
      );
    } 
    //  deprecated
    //  has no value and in solving mode so presenting all valid options for the cell
    else
    {
      let containerClassName = "Sudoku_cell_unknown " + isSelected;
      let optionClassName = "Sudoku_cell_option " + isSelected;
        return (
          <>
            <div data-value={this.value} className={containerClassName}>
              <div className={optionClassName}>1</div><div className={optionClassName}>2</div><div className={optionClassName}>3</div>
              <div className={optionClassName}>4</div><div className={optionClassName}>5</div><div className={optionClassName}>6</div>
              <div className={optionClassName}>7</div><div className={optionClassName}>8</div><div className={optionClassName}>9</div>
            </div>
          </>
        );
    }
  }
}

/**
 * A BigCell is a 3x3 group of cells that make up the sudoku board.
 * @returns component representing the BigCell
 */
function BigCell() {
  currentCellCount = 0;
  let bigCell = (
    <>
      <div className="Sudoku_bigcell">
        <Cell bigCellCount={bigCellCount} value="-1"/><Cell bigCellCount={bigCellCount} value="-1"/><Cell bigCellCount={bigCellCount} value="-1"/>
        <Cell bigCellCount={bigCellCount} value="-1"/><Cell bigCellCount={bigCellCount} value="-1"/><Cell bigCellCount={bigCellCount} value="-1"/>
        <Cell bigCellCount={bigCellCount} value="-1"/><Cell bigCellCount={bigCellCount} value="-1"/><Cell bigCellCount={bigCellCount} value="-1"/>
      </div>
    </>
  );
  bigCellCount++;
  return bigCell;
}

function Board() {
  board = [[],[],[],[],[],[],[],[],[],];
  bigCellCount = 0;
    return (
      <>
        <div id="Sudoku_board">
            <BigCell/><BigCell/><BigCell/>
            <BigCell/><BigCell/><BigCell/>
            <BigCell/><BigCell/><BigCell/>
        </div>
      </>
    );
  }
  
  export default Board;
  
  