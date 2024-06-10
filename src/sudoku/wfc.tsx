import { SudokuGame, sudoku_length } from "./logic";

const ONE = 1;
const TWO = 2;
const THREE = 4;
const FOUR = 8;
const FIVE = 16;
const SIX = 32;
const SEVEN = 64;
const EIGHT = 128;
const NINE = 256;

/**
 * Returns the bitflag for sudoku's cell value.
 * @param cell_value 
 * @returns 
 */
function number_to_bitflag(cell_value: number): number {
    switch(cell_value)
    {
        default:
            console.error("Bitflag conversion being called for", cell_value);
            return ONE;
        case 1:
            return ONE;
        case 2:
            return TWO;
        case 3:
            return THREE;
        case 4:
            return FOUR;
        case 5:
            return FIVE;
        case 6:
            return SIX;
        case 7:
            return SEVEN;
        case 8:
            return EIGHT;
        case 9:
            return NINE;
    }
}

/**
 * Returns a bitflag for an array of possibilities.
 * @param possibilities 
 * @returns 
 */
function possibilities_to_bitflag(possibilities: number[]): number {
    let bitflag = 0;
    for(let i = 0; i < possibilities.length; i++)
        bitflag += 1 << (possibilities[i] - 1);
    return bitflag;
}

/**
 * Returns the number of possible values for the cells.
 * @param bitflag 
 */
export function sudoku_bitflag_number_possibilities(bitflag: number): number {
    if(bitflag < 0)
        return 0;
    return (
        (bitflag >> 0 & 1) +
        (bitflag >> 1 & 1) +
        (bitflag >> 2 & 1) +
        (bitflag >> 3 & 1) +
        (bitflag >> 4 & 1) +
        (bitflag >> 5 & 1) +
        (bitflag >> 6 & 1) +
        (bitflag >> 7 & 1)
    )
}

/**
 * Parses the bitflag into an array of possible cell values.
 */
export function sudoku_parse_bitflag(bitflag: number): number[] {
    let parsed_possibilies: number[] = [];
    if(bitflag < 0)
        return parsed_possibilies;
    for(let i = 1; i <= 9; i++) {
        if(bitflag & 1)
            parsed_possibilies.push(i);
        bitflag = bitflag >> 1;
    }
    return parsed_possibilies;
}

/**
 * Gets all indices in the row.
 * @param cell_row 
 * @returns 
 */
function get_row_indices(cell_row: number): number[] {
    //  Cell row index
    let cri: number = cell_row * 9;
    return [
        cri + 0, cri + 1, cri + 2, cri + 3, cri + 4, cri + 5, cri + 6, cri + 7, cri + 8,
    ]
}

/**
 * Gets all the indices in the column.
 * @param cell_col 
 * @returns 
 */
function get_col_indices(cell_col: number): number[] {
    return [
        0 + cell_col,
        9 + cell_col,
        18 + cell_col,
        27 + cell_col,
        36 + cell_col,
        45 + cell_col,
        54 + cell_col,
        63 + cell_col,
        72 + cell_col,
    ]
}

/**
 * Gets all the indices in the big cell.
 * @param cell_row 
 * @param cell_col 
 * @returns 
 */
function get_big_cell_indices(cell_row: number, cell_col: number): number[] {
    let cell_row_1_index: number = cell_row * 9;
    let cell_row_2_index: number = cell_row * 9 + 9;
    let cell_row_3_index: number = cell_row * 9 + 18;
    
    return [
        cell_row_1_index + cell_col + 0, cell_row_1_index + cell_col + 1, cell_row_1_index + cell_col + 2,
        cell_row_2_index + cell_col + 0, cell_row_2_index + cell_col + 1, cell_row_2_index + cell_col + 2,
        cell_row_3_index + cell_col + 0, cell_row_3_index + cell_col + 1, cell_row_3_index + cell_col + 2,
    ]
}

/**
 * Gets all related indices (row, column, and big cells) for a cell index.
 * @param cell_index 
 * @returns 
 */
function get_indices(cell_index: number): {
    row_indices: number[],
    col_indices: number[],
    big_cell_indices: number[]
} {
    const cell_row = Math.floor(cell_index / 9);
    const cell_col = cell_index % 9;

    const big_cell_row = Math.floor(cell_row / 3) * 3;
    const big_cell_col = Math.floor(cell_col / 3) * 3;

    return {
        row_indices: get_row_indices(cell_row),
        col_indices: get_col_indices(cell_col),
        big_cell_indices: get_big_cell_indices(big_cell_row, big_cell_col)
    };
}

/**
 * Returns an array of the possibilites for each square to be used in wave function collapse
 * Possible moves are represented in the first 9 bits.
 * Empty cells with no valid moves are represented by a 0.
 * Occupied cells are represented by negative numbers.
 * 1 = 0b000000001
 * 2 = 0b000000010
 * 3 = 0b000000100
 * 4 = 0b000001000
 * 5 = 0b000010000
 * 6 = 0b000100000
 * 7 = 0b001000000
 * 8 = 0b010000000
 * 9 = 0b100000000
 * @param sudoku 
 */
export function sudoku_possibilities(sudoku: SudokuGame): number[] {
    let possibilites: number[] = [];
    for(let i = 0; i < sudoku_length; i++) {
        //  Only empty cells can have possible moves.
        if(sudoku.board[i] == 0)
            possibilites[i] = ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE;
        else
            possibilites[i] = -1;
    }

    //  First pass to apply the basic rules
    for(let i = 0; i < sudoku_length; i++) {
        //  The cell value in the board
        const number = sudoku.board[i];

        //  Empty cells don't affect possibilities.
        if(number == 0)
            continue;

        //  The inverted bitflag of the cell value so it can be bitwise ANDed to remove it from possibilities.
        const inverted_bitflag = ~number_to_bitflag(number);

        const {row_indices, col_indices, big_cell_indices} = get_indices(i);


        //  Rule 1: Numbers are unique in row.
        for(let j = 0; j < row_indices.length; j++)
            //  It doesn't matter to check for the same cell, i.e index == i, because the bitflag will still be negative.
            possibilites[row_indices[j]] &= inverted_bitflag;

        //  Rule 2: Numbers are unique in column.
        for(let j = 0; j < col_indices.length; j++)
            possibilites[col_indices[j]] &= inverted_bitflag;

        // //  Rule 3: Numbers are unique in 3x3 big cell
        for(let j = 0; j < big_cell_indices.length; j++)
            possibilites[big_cell_indices[j]] &= inverted_bitflag;
    }

    //  Second pass for more intuitive rules
    //  Informal rule 1:
    //  If X numbers are all the only options in X cells, then:
    //      1. They are the only options in those cells.
    //      2. They are not options in the other cells.
    //  1 is true due to the premise and 2 is true due to pigeonhole principle.

    //  Informal rule 2:
    //  If X numbers are all options only in X cells, then:
    //      1. They are the only options in those cells.
    //      2. They are not options in the other cells.
    //  2 is true due to the premise and 1 is true due to pigeonhole principle.

    //  Mapping possible cell values to what cell they can be in 
    let number_to_cell: Record<number, number[]> = {};
    //  Mapping the cell to what numbers can be in it
    let cell_to_number: Record<number, number[]> = {};

    let sorted_number_to_cell: (string | number[])[][] = [];
    let sorted_cell_to_number: (string | number[])[][] = [];

    let attempts = 0;
    let progress_made = true;

    function recalculate_dictionaries(indices: number[]) {
        cell_to_number = [];
        number_to_cell = [];
        
        for(let j = 0; j < indices.length; j++)
        {
            const cell_possibilities = possibilites[indices[j]];
            //  Occupied cell
            if(cell_possibilities < 0) {
                continue;
            }
            for(let k = 0; k < 9; k++) {
                if(((cell_possibilities >> k) & 1) == 1) {
                    if(k + 1 in number_to_cell)
                        number_to_cell[k + 1].push(indices[j]);
                    else
                        number_to_cell[k + 1] = [indices[j]];
                }
            }
            cell_to_number[indices[j]] = sudoku_parse_bitflag(possibilites[indices[j]]);
        }   
    
        //  Sort by length and order
        //  https://stackoverflow.com/a/25500462
        sorted_number_to_cell = Object.keys(number_to_cell).map(function(key) {
            return [key, number_to_cell[Number(key)]];
        });
        sorted_number_to_cell.sort(function(first, second) {
            return 10 * (first[1].length - second[1].length) + (first[1] < second[1] ? -1: 1);
        });
        sorted_cell_to_number = Object.keys(cell_to_number).map(function(key) {
            return [key, cell_to_number[Number(key)]];
        });
        sorted_cell_to_number.sort(function(first, second) {
            return 10 * (first[1].length - second[1].length) + (first[1] < second[1] ? -1: 1);
        });
    }
    function apply_informal_rule_1(sorted_cell_to_number: (string | number[])[][], indices: number[]) {
        //  All cells are occupied so there is no need to go furter
        if(sorted_cell_to_number.length == 0)
            return;
        let X = 0;
        let length = sorted_cell_to_number[0][1].length;
        let X_cells: number[] = [];
        let options: number[] = sorted_cell_to_number[0][1] as number[];

        for(let j = 0; j < sorted_cell_to_number.length; j++) {
            let cell = sorted_cell_to_number[j][0];
            let numbers = sorted_cell_to_number[j][1];

            if(numbers.length == length) {
                X++;
                X_cells.push(Number(cell));
            }

            //  Either this is the end or the next element does not match because
            //  it is not the same length or it has different options
            if(j + 1 == sorted_cell_to_number.length || (
                sorted_cell_to_number[j + 1][1].length != length ||
                sorted_cell_to_number[j + 1][1].toString() != options.toString()
                )
            ) {
                //  Fulfill informal rule 1
                if(length == X) {
                    const bitflag = possibilities_to_bitflag(numbers as number[]);
                    for(let k = 0; k < indices.length; k++) {
                        let pre_possibilities = possibilites[indices[k]];

                        //   1. They are the only options in those cells.
                        if(X_cells.includes(indices[k])) {
                            possibilites[indices[k]] = bitflag;
                        }
                        //  2. They are not options in the other cells.
                        else {
                            possibilites[indices[k]] &= ~bitflag; 
                        }

                        if(pre_possibilities != possibilites[indices[k]])
                            progress_made = true;
                    }
                }
                
                //  Reset variables
                X = 0;
                X_cells = [];
                if(j + 1 < sorted_cell_to_number.length) {
                    length = sorted_cell_to_number[j + 1][1].length;
                    options = sorted_cell_to_number[j + 1][1] as number[];
                }
            }
        }    
    }
    function apply_informal_rule_2(sorted_number_to_cell: (string | number[])[][], indices: number[]) {
        //  All cells are occupied so there is no reason to go further
        if(sorted_number_to_cell.length == 0)
            return;
        
        let X = 0;
        let length = sorted_number_to_cell[0][1].length;
        let X_numbers: number[] = [];
        let options: number[] = sorted_number_to_cell[0][1] as number[];

        for(let j = 0; j < sorted_number_to_cell.length; j++) {
            let number = sorted_number_to_cell[j][0];
            let cells = sorted_number_to_cell[j][1];

            if(cells.length == length) {
                X++;
                X_numbers.push(Number(number));
            }

            //  Either this is the end or the next element does not match because
            //  it is not the same length or it has different options
            if(j + 1 == sorted_number_to_cell.length || (
                sorted_number_to_cell[j + 1][1].length != length ||
                sorted_number_to_cell[j + 1][1].toString() != options.toString()
                )
            ) {
                //  Fulfill informal rule 1
                if(length == X) {
                    const bitflag = possibilities_to_bitflag(X_numbers as number[]);
                    for(let k = 0; k < indices.length; k++) {
                        let pre_possibilities = possibilites[indices[k]];

                        //   1. They are the only options in those cells.
                        if(options.includes(indices[k])) {
                            possibilites[indices[k]] = bitflag;
                        }
                        //  2. They are not options in the other cells.
                        else {
                            possibilites[indices[k]] &= ~bitflag; 
                        }

                        if(pre_possibilities != possibilites[indices[k]])
                            progress_made = true;
                    }
                }
                
                //  Reset variables
                X = 0;
                X_numbers = [];
                if(j + 1 < sorted_number_to_cell.length) {
                    length = sorted_number_to_cell[j + 1][1].length;
                    options = sorted_number_to_cell[j + 1][1] as number[];
                }
            }
        }
    }

    //  Look at all big cells
    for(let i = 0; i < 9; i+=3) {
        for(let j = 0; j < 9; j+=3) {
            //  The cell value in the board
            const number = sudoku.board[i];

            const big_cell_indices = get_big_cell_indices(i, j);
            recalculate_dictionaries(big_cell_indices);
            apply_informal_rule_1(sorted_cell_to_number, big_cell_indices);
            recalculate_dictionaries(big_cell_indices);
            apply_informal_rule_2(sorted_number_to_cell, big_cell_indices);
        }
    }

    //  Look at all rows
    for(let i = 0; i < 9; i++) {
        //  The cell value in the board
        const number = sudoku.board[i];

        const row_indices = get_row_indices(i);
        recalculate_dictionaries(row_indices);
        apply_informal_rule_1(sorted_cell_to_number, row_indices);
        recalculate_dictionaries(row_indices);
        apply_informal_rule_2(sorted_number_to_cell, row_indices);
    }

    //  Look at all cols
    for(let i = 0; i < 9; i++) {
        //  The cell value in the board
        const number = sudoku.board[i];

        const col_indices = get_col_indices(i);
        recalculate_dictionaries(col_indices);
        console.log(i, "before");
        console.log(sorted_cell_to_number)
        console.log(sorted_number_to_cell)
        apply_informal_rule_1(sorted_cell_to_number, col_indices);
        recalculate_dictionaries(col_indices);
        apply_informal_rule_2(sorted_number_to_cell, col_indices);
        console.log("after")
        
        console.log(sorted_cell_to_number)
        console.log(sorted_number_to_cell)
    }


    // for(let i = 0; i < sudoku_length; i++) {
    //     //  The cell value in the board
    //     const number = sudoku.board[i];

    //     //  This time we want to look at only empty cells
    //     if(number != 0)
    //         continue;
        
    //     const {row_indices, col_indices, big_cell_indices} = get_indices(i);

    //     //  Informal rule 1:
    //     //  If X numbers are all the only options in X cells, then:
    //     //      1. They are the only options in those cells.
    //     //      2. They are not options in the other cells.
    //     //  1 is true due to the premise and 2 is true due to pigeonhole principle.

    //     //  Informal rule 2:
    //     //  If X numbers are all options only in X cells, then:
    //     //      1. They are the only options in those cells.
    //     //      2. They are not options in the other cells.
    //     //  2 is true due to the premise and 1 is true due to pigeonhole principle.

    //     //  Mapping possible cell values to what cell they can be in 
    //     let number_to_cell: Record<number, number[]> = {};
    //     //  Mapping the cell to what numbers can be in it
    //     let cell_to_number: Record<number, number[]> = {};

    //     let sorted_number_to_cell: (string | number[])[][] = [];
    //     let sorted_cell_to_number: (string | number[])[][] = [];

    //     //  Informal rule 1
    //     let attempts = 0;
    //     let progress_made = true;

    //     function recalculate_dictionaries(indices: number[]) {
    //         cell_to_number = [];
    //         number_to_cell = [];
            
    //         for(let j = 0; j < indices.length; j++)
    //         {
    //             const cell_possibilities = possibilites[indices[j]];
    //             //  Occupied cell
    //             if(cell_possibilities < 0) {
    //                 continue;
    //             }
    //             for(let k = 0; k < 9; k++) {
    //                 if(((cell_possibilities >> k) & 1) == 1) {
    //                     if(k + 1 in number_to_cell)
    //                         number_to_cell[k + 1].push(indices[j]);
    //                     else
    //                         number_to_cell[k + 1] = [indices[j]];
    //                 }
    //             }
    //             cell_to_number[indices[j]] = sudoku_parse_bitflag(possibilites[indices[j]]);
    //         }   
        
    //         //  Sort by length and order
    //         //  https://stackoverflow.com/a/25500462
    //         sorted_number_to_cell = Object.keys(number_to_cell).map(function(key) {
    //             return [key, number_to_cell[Number(key)]];
    //         });
    //         sorted_number_to_cell.sort(function(first, second) {
    //             return 10 * (first[1].length - second[1].length) + (first[1] < second[1] ? -1: 1);
    //         });
    //         sorted_cell_to_number = Object.keys(cell_to_number).map(function(key) {
    //             return [key, cell_to_number[Number(key)]];
    //         });
    //         sorted_cell_to_number.sort(function(first, second) {
    //             return 10 * (first[1].length - second[1].length) + (first[1] < second[1] ? -1: 1);
    //         });
    //     }

    //     function apply_informal_rule_1(sorted_cell_to_number: (string | number[])[][], indices: number[]) {
    //         let X = 0;
    //         let length = sorted_cell_to_number[0][1].length;
    //         let X_cells: number[] = [];
    //         let options: number[] = sorted_cell_to_number[0][1] as number[];

    //         for(let j = 0; j < sorted_cell_to_number.length; j++) {
    //             let cell = sorted_cell_to_number[j][0];
    //             let numbers = sorted_cell_to_number[j][1];
    
    //             if(numbers.length == length) {
    //                 X++;
    //                 X_cells.push(Number(cell));
    //             }
    
    //             //  Either this is the end or the next element does not match because
    //             //  it is not the same length or it has different options
    //             if(j + 1 == sorted_cell_to_number.length || (
    //                 sorted_cell_to_number[j + 1][1].length != length ||
    //                 sorted_cell_to_number[j + 1][1].toString() != options.toString()
    //                 )
    //             ) {
    //                 //  Fulfill informal rule 1
    //                 if(length == X) {
    //                     const bitflag = possibilities_to_bitflag(numbers as number[]);
    //                     for(let k = 0; k < indices.length; k++) {
    //                         let pre_possibilities = possibilites[indices[k]];

    //                         //   1. They are the only options in those cells.
    //                         if(X_cells.includes(indices[k])) {
    //                             possibilites[indices[k]] = bitflag;
    //                         }
    //                         //  2. They are not options in the other cells.
    //                         else {
    //                             possibilites[indices[k]] &= ~bitflag; 
    //                         }

    //                         if(pre_possibilities != possibilites[indices[k]])
    //                             progress_made = true;
    //                     }
    //                 }
                    
    //                 //  Reset variables
    //                 X = 0;
    //                 X_cells = [];
    //                 if(j + 1 < sorted_cell_to_number.length) {
    //                     length = sorted_cell_to_number[j + 1][1].length;
    //                     options = sorted_cell_to_number[j + 1][1] as number[];
    //                 }
    //             }
    //         }    
    //     }
    //     function apply_informal_rule_2(sorted_number_to_cell: (string | number[])[][], indices: number[]) {
    //         let X = 0;
    //         let length = sorted_number_to_cell[0][1].length;
    //         let X_numbers: number[] = [];
    //         let options: number[] = sorted_number_to_cell[0][1] as number[];

    //         for(let j = 0; j < sorted_number_to_cell.length; j++) {
    //             let number = sorted_number_to_cell[j][0];
    //             let cells = sorted_number_to_cell[j][1];
    
    //             if(cells.length == length) {
    //                 X++;
    //                 X_numbers.push(Number(number));
    //             }
    
    //             //  Either this is the end or the next element does not match because
    //             //  it is not the same length or it has different options
    //             if(j + 1 == sorted_number_to_cell.length || (
    //                 sorted_number_to_cell[j + 1][1].length != length ||
    //                 sorted_number_to_cell[j + 1][1].toString() != options.toString()
    //                 )
    //             ) {
    //                 //  Fulfill informal rule 1
    //                 if(length == X) {
    //                     const bitflag = possibilities_to_bitflag(X_numbers as number[]);
    //                     for(let k = 0; k < indices.length; k++) {
    //                         let pre_possibilities = possibilites[indices[k]];

    //                         //   1. They are the only options in those cells.
    //                         if(options.includes(indices[k])) {
    //                             possibilites[indices[k]] = bitflag;
    //                         }
    //                         //  2. They are not options in the other cells.
    //                         else {
    //                             possibilites[indices[k]] &= ~bitflag; 
    //                         }

    //                         if(pre_possibilities != possibilites[indices[k]])
    //                             progress_made = true;
    //                     }
    //                 }
                    
    //                 //  Reset variables
    //                 X = 0;
    //                 X_numbers = [];
    //                 if(j + 1 < sorted_number_to_cell.length) {
    //                     length = sorted_number_to_cell[j + 1][1].length;
    //                     options = sorted_number_to_cell[j + 1][1] as number[];
    //                 }
    //             }
    //         }
    //     }

    //     while(progress_made && attempts < 10) {
    //         progress_made = false;
    //         attempts++;
            
    //         recalculate_dictionaries(big_cell_indices);
    //         apply_informal_rule_1(sorted_cell_to_number, big_cell_indices);

    //         // recalculate_dictionaries(big_cell_indices);
    //         // apply_informal_rule_2(sorted_cell_to_number, big_cell_indices);
           
    //     }
    // }
    
    return possibilites;
}