import './Sudoku.css'
import React, { KeyboardEvent, createRef, RefObject } from 'react';

/**
 * The current cell selected by the user.
 */
export let currentCell : Cell;

class Cell extends React.Component {
  value : any;
  isSelected : boolean;
  componentReference : RefObject<any>;

  constructor(props : {value?: string}) {
    super(props);
    
    this.value = Number(props.value);
    this.isSelected = false;
    this.componentReference = createRef();

    this.onClickHandler = this.onClickHandler.bind(this);
    this.onKeyPressHandler = this.onKeyPressHandler.bind(this);
    this.setValue = this.setValue.bind(this);
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
    if(isNaN(Number(event.key))) return;
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
            onKeyUp={this.onKeyPressHandler} onClick={this.onClickHandler} className={className}>
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
            <div className={containerClassName}>
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
  return (
    <>
      <div className="Sudoku_bigcell">
        <Cell value="-1"/><Cell value="-1"/><Cell value="-1"/>
        <Cell value="-1"/><Cell value="-1"/><Cell value="-1"/>
        <Cell value="-1"/><Cell value="-1"/><Cell value="-1"/>
      </div>
    </>
  );
}

function Board() {
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
  
  