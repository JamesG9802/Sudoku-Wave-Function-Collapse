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

class Cell extends React.Component {
  /**
   * A valid value ranges from 1 to 9. An invalid value is stored as -1.
   */
  value : any;
  isSelected : boolean;
  componentReference : RefObject<any>;

  constructor(props : {bigCellCount: number, value?: string}) {
    super(props);
    
    this.value = Number(props.value);
    this.isSelected = false;
    this.componentReference = createRef();

    this.onClickHandler = this.onClickHandler.bind(this);
    this.onKeyPressHandler = this.onKeyPressHandler.bind(this);
    this.setValue = this.setValue.bind(this);

    const row = (props.bigCellCount - props.bigCellCount % 3);
    const col = (props.bigCellCount % 3) * 3;
    const myRow = row + (currentCellCount - currentCellCount % 3) / 3;
    const myCol = col + (currentCellCount % 3);
    board[myRow][myCol] = this;
    currentCellCount++;
  }
  /**
   * Sets the select property of a cell and sets the currently selected cell to this.
   */
  onClickHandler() {
    if(currentCell != undefined)
    {
      currentCell.isSelected = false;
      currentCell.forceUpdate();
    }  
    
    currentCell = this;
    currentCell.isSelected = true;
    currentCell.forceUpdate();
  }
  /**
   * When the component rerenders, it sets the focus on itself to allow for keyboard input.
   */
  componentDidUpdate() {
    if(this.isSelected)
      currentCell.componentReference.current.focus();
  }
  onKeyPressHandler(event : KeyboardEvent) {
    if(isNaN(Number(event.key)) || Number(event.key) == 0) return;
    this.value = Number(event.key); 
    this.forceUpdate();
  }
  setValue(value: any) {
    this.value = value;
    this.forceUpdate();
  }
  render() {
    let isSelected = "";
    if(this.isSelected) isSelected += "Sudoku_selected";

    if(this.value != undefined)
    {
      let value = String(this.value);
      let className = "Sudoku_cell " + isSelected;
      //  has no value, but not in solving mode yet
      if(this.value == "-1")
        value = "";
      return (
        <>
          <div ref={this.componentReference} tabIndex={0}
            onKeyUp={this.onKeyPressHandler} onClick={this.onClickHandler} className={className} data-value={this.value}>
            {value}
          </div>
        </>
      );
    } 
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
  
  