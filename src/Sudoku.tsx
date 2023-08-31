import './Sudoku.css'
import React, { MouseEvent } from 'react';

export let currentCell : Cell;

class Cell extends React.Component {
  value : any;
  constructor(props : {value?: string}) {
    super(props);
    this.value = Number(props.value);
    this.clickMe = this.clickMe.bind(this);
    this.setValue = this.setValue.bind(this);
  }
  clickMe() {
    currentCell = this;
    this.value = undefined;
    this.forceUpdate();
  }
  setValue(value: any) {
    this.value = value;
    this.forceUpdate();
  }
  render() {
    if(this.value != undefined)
    {
      let value = String(this.value);
      //  has no value, but not in solving mode yet
      if(this.value == "-1")
        value = "";
      return (
        <>
          <div onClick={this.clickMe} className="Sudoku_cell">
            {value}
          </div>
        </>
      );
    } 
    //  has no value and in solving mode so presenting all valid options for the cell
    else
      return (
        <>
          <div className="Sudoku_cell_unknown">
            <div className="Sudoku_cell_option">1</div><div className="Sudoku_cell_option">2</div><div className="Sudoku_cell_option">3</div>
            <div className="Sudoku_cell_option">4</div><div className="Sudoku_cell_option">5</div><div className="Sudoku_cell_option">6</div>
            <div className="Sudoku_cell_option">7</div><div className="Sudoku_cell_option">8</div><div className="Sudoku_cell_option">9</div>
          </div>
        </>
      );
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
  
  