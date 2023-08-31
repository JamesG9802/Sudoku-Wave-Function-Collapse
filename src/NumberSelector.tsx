import './NumberSelector.css'
import React, { MouseEvent } from 'react';
import { currentCell } from './Sudoku';

function selectNumberOption(event : MouseEvent) {
    if(currentCell != undefined)
        currentCell.setValue(Number((event.target as HTMLElement).dataset.value));
}
function NumberOption(props: {children?: any, value: string}) {
    return (
        <>
            <div onClick={selectNumberOption} className="NumberSelector_numberoption" data-value={props.value}>
                {props.value}
            </div>
        </>
    )
}
function NumberSelector() {
    return (
    <>
        <div className="NumberSelector_container">
            <NumberOption value="1"></NumberOption>
            <NumberOption value="2"></NumberOption>
            <NumberOption value="3"></NumberOption>
            <NumberOption value="4"></NumberOption>
            <NumberOption value="5"></NumberOption>
            <NumberOption value="6"></NumberOption>
            <NumberOption value="7"></NumberOption>
            <NumberOption value="8"></NumberOption>
            <NumberOption value="9"></NumberOption>
        </div>
      </>
    );
  }
  
export default NumberSelector;