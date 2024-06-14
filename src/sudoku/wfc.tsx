import { SudokuGame, SudokuMove, sudoku_is_solved, sudoku_length, sudoku_move_array_is_subset, sudoku_move_copy, sudoku_move_equals, sudoku_place_cell, sudoku_undo } from "./logic";

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
 * The possible states of the solver
 */
export enum SolverState {
    /**
     * In the process of reducing the possibility space
     */
    COLLAPSING,

    /**
     * In the process of undoing bad decisions.
     */
    BACKTRACKING,

    /**
     * Has finished solving the sudoku
     */
    SOLVED,

    /**
     * The sudoku puzzle is impossible
     */
    BROKEN
}

export type SudokuSolver = {
    /**
     * The solver's current state
     */
    state: SolverState;

    /**
     * The list of MEANINGFUL decisions the solver has had to make.
     * A meaningful decision is a move where the solver had several different options to make.
     */
    decisions: SudokuMove[];

    /**
     * The list of MEANINGFUL decision chains that led to a unsolvable board. 
     */
    bad_decisions: SudokuMove[][];
};

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
        (bitflag >> 7 & 1) +
        (bitflag >> 8 & 1) 
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
export function sudoku_possibilities(sudoku: SudokuGame, bad_decisions?: SudokuMove[]): number[] {
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

    if(!attempts || !progress_made) {}

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
            const big_cell_indices = get_big_cell_indices(i, j);
            recalculate_dictionaries(big_cell_indices);
            apply_informal_rule_1(sorted_cell_to_number, big_cell_indices);
            recalculate_dictionaries(big_cell_indices);
            apply_informal_rule_2(sorted_number_to_cell, big_cell_indices);
        }
    }

    //  Look at all rows
    for(let i = 0; i < 9; i++) {
        const row_indices = get_row_indices(i);
        recalculate_dictionaries(row_indices);
        apply_informal_rule_1(sorted_cell_to_number, row_indices);
        recalculate_dictionaries(row_indices);
        apply_informal_rule_2(sorted_number_to_cell, row_indices);
    }

    //  Look at all cols
    for(let i = 0; i < 9; i++) {
        const col_indices = get_col_indices(i);
        recalculate_dictionaries(col_indices);
        apply_informal_rule_1(sorted_cell_to_number, col_indices);
        recalculate_dictionaries(col_indices);
        apply_informal_rule_2(sorted_number_to_cell, col_indices);
    }

    //  Finally, apply the black list of bad decisions
    if(bad_decisions) {
        for(let i = 0; i < bad_decisions.length; i++) {
            const bad_move: SudokuMove = bad_decisions[i];
            possibilites[bad_move.index] &= ~number_to_bitflag(bad_move.value);
        }
    }

    return possibilites;
}

export function sudoku_solver_new(): SudokuSolver {
    return {
        state: SolverState.COLLAPSING,
        decisions: [],
        bad_decisions: [],
    }
}

/**
 * Collapses the state of the board by picking the most likely option. Returns false if there are no more moves available.
 * @param sudoku the sudoku game
 * @param bad_decisions the list of bad decisions
 * @returns 
 */
export function sudoku_collapse(sudoku: SudokuGame, bad_decisions?: SudokuMove[]): {
    /**
     * True if collapsing required making a random decision
     */
    made_decision: boolean,
    /**
     * True if a move was successfully made
     */
    made_move: boolean
} {
    let possibilies_list = sudoku_possibilities(sudoku, bad_decisions);

    //  For conciseness, the index is interleaved with the possibility bitflags
    //  Example:
    //  0 - index
    //  1 - bitflag
    //  2 - index
    //  3 - bitflag
    let options: number[] = [];
    let min = 10;
    for(let i = 0; i < possibilies_list.length; i++) {
        //  ignore occupied cells
        if(sudoku.board[i] != 0)
            continue;
        
        const num_possibilities: number = sudoku_bitflag_number_possibilities(possibilies_list[i]);
        if(num_possibilities < min) {
            options = [];
            min = num_possibilities;
        }
        if(num_possibilities == min) {
            options.push(i);
            options.push(possibilies_list[i]);
        }
    }
    if(min == 0)
        return {
            made_decision: false,
            made_move: false
        };
    //  Pick random option available
    const chosen_option = 2 * Math.floor(Math.random() * Math.floor(options.length / 2));
    const random_possibilities = sudoku_parse_bitflag(options[chosen_option + 1]);
    return {
            made_decision: random_possibilities.length > 1,
            made_move: sudoku_place_cell(sudoku, 
                options[chosen_option], //  first in interleaved array is the index 
                random_possibilities[Math.floor(Math.random() * random_possibilities.length)]  //  second is the bitflag
            )
    };
}

/**
 * Make an iteration towards solving the sudoku puzzle.
 * Returns true if the puzzle is solved.
 * @param sudoku 
 */
export function sudoku_solve(sudoku: SudokuGame, solver: SudokuSolver): boolean {
    switch(solver.state) {
        case SolverState.COLLAPSING:
            //  Given the current decision chain, create a blacklist based on the bad moves made
            const bad_decisions: SudokuMove[] = [];
            for(let i = 0; i < solver.bad_decisions.length; i++) {
                //  Blacklist only works if it affects the next decision
                if(solver.bad_decisions[i].length != solver.decisions.length + 1)
                    continue;

                //  Check if the decision chain is the same, up to the last decision
                let is_same = true;
                for(let j = 0; j < solver.decisions.length; j++) {
                    if(!sudoku_move_equals(solver.decisions[j], solver.bad_decisions[i][j])) {
                        is_same = false;
                        break;
                    }
                }
                if(is_same)
                    bad_decisions.push(solver.bad_decisions[i][solver.decisions.length]);
            }
            //  Try to collapse
            const {made_decision, made_move} = sudoku_collapse(sudoku, bad_decisions);
            
            //  If collapsing was successful, check if a decision was made and stop
            if(made_move) {
                if(made_decision)
                    solver.decisions.push(sudoku_move_copy(sudoku.history[sudoku.history.length - 1]));
                break;
            }
            //  If unsuccessful, check if it is solved.
            //  Otherwise change to backtracking and add it to the list of bad decisions.
            else {
                if(sudoku_is_solved(sudoku)) {
                    solver.state = SolverState.SOLVED;
                    break;
                }
                //  This should be impossible
                if(made_decision)
                    console.error("During solving, somehow a decision was made with no valid moves.");
                solver.state = SolverState.BACKTRACKING;
                solver.bad_decisions.push(JSON.parse(JSON.stringify(solver.decisions)));

                //  if a bad decision is a subset of another one, you can delete the superset
                for(let i = 0; i < solver.bad_decisions.length; i++) {
                    for(let j = i + 1; j < solver.bad_decisions.length; j++) {
                        if(sudoku_move_array_is_subset(solver.bad_decisions[i], solver.bad_decisions[j])) {
                            solver.bad_decisions.splice(j, 1);
                            j--;
                        }
                    }
                }
                
                break;
            }
        case SolverState.BACKTRACKING:
            //  This technically works
            //  However, due to how bad decisions affect possibilities 
            //  (they are removed as options entirely)
            //  this can lead to a depth-first search which occasionally traps
            //  the solver in an extremely deep search when the initial guess(es) were wrong
            //  but it needs to explore all the child options first.

            //  This can be alleviated by just undoing all the way to the beginning.
            // const last_move = sudoku.history[sudoku.history.length - 1];
            // const was_decision_move = JSON.stringify(last_move) == JSON.stringify(solver.decisions[solver.decisions.length - 1]);
            // //  If there is somehow no moves left, then the puzzle was impossible
            // if(last_move == undefined) {
            //     solver.state = SolverState.BROKEN;
            //     break;
            // }

            // if(was_decision_move) {
            //     solver.decisions.pop();
            // }

            // //  Backtrack a step
            // sudoku_undo(sudoku);

            // //  If the decision chain no longer is bad, switch to collapsing
            // if(was_decision_move)
            // {
            //     let not_bad_match = true;

            //     for(let i = 0; i < solver.bad_decisions.length; i++) {
            //         if(sudoku_move_array_is_subset(solver.bad_decisions[i], solver.decisions)) {
            //             not_bad_match = false;
            //             break;
            //         }
            //     }   
            //     if(not_bad_match)
            //     {
            //         solver.state = SolverState.COLLAPSING;
            //         break;
            //     }
            // }
            // break;

            while(sudoku_undo(sudoku)) {}
            solver.decisions = [];
            solver.state = SolverState.COLLAPSING;
            break;
        case SolverState.SOLVED:
            break;
    }
    return solver.state == SolverState.SOLVED;
}