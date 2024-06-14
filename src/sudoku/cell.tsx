import { Box, useTheme } from "@mui/material";
import { memo } from "react";
import { sudoku_parse_bitflag } from "./wfc";

export type CellProps = {
    /**
     * The value of the cell
     */
    cell_value: number

    onClick?: () => void

    in_manual_mode: boolean
    is_solving: boolean

    /**
     * True if solving and this cell changed
     */
    solve_changed: boolean
    solve_speed: number

    /**
     * The possibility bitflag for this cell
     */
    possibilities?: number

    /**
     * The smallest number of possibilities globally
     */
    smallest_possibility?: number

    row: number,
    col: number,

    selected_row: number,
    selected_col: number,
    selected_number: number
}

/**
 * Get the red, green, and blue color components of a "rgb(RRR, GGG, BBB)" or "#RRGGBB" formatted string. 
 * @param color 
 */
function get_rgb(color: string): {
    red: number,
    green: number,
    blue: number
} {
    if(color.charAt(0) == "r")
    {
        let colors = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(color);

        if(colors == undefined)
            return {
                red: -1,
                green: -1,
                blue: -1
            }
        return {
            red: Number(colors[1]),
            green: Number(colors[2]),
            blue: Number(colors[3])
        }
    }
    //  Sometimes it is in #RRGGBB format
    else if(color.charAt(0) == "#") {
        return {
            red: Number("0x" + color.substring(1, 3)),
            green: Number("0x" + color.substring(3, 5)),
            blue: Number("0x" + color.substring(5, 7)),
        }
    }
    //  Wrong format
    else {
        console.error("Trying to convert a strange color:", color);
        return {
            red: -1,
            green: -1,
            blue: -1
        }
    }
    
}

//  https://stackoverflow.com/questions/22218140/calculate-the-color-at-a-given-point-on-a-gradient-between-two-colors
export function interpolate_color(color1: string, color2: string, percentage: number) {
    const color1_rgb = get_rgb(color1);
    const color2_rgb = get_rgb(color2);

    return "rgb(" + 
        (color1_rgb.red + percentage * (color2_rgb.red - color1_rgb.red)) + ", " +
        (color1_rgb.green + percentage * (color2_rgb.green - color1_rgb.green)) + ", " +
        (color1_rgb.blue + percentage * (color2_rgb.blue - color1_rgb.blue)) +")";
}

export enum CellState {
    Empty,      //  When the cell has no value
    Filled,     //  When the cell has a value
    Valid,      //  When the cell has valid possibilities
    Invalid,    //  When the cell has no valid possibilities
    Solved      //  When the cell has just been solved
}

export default memo(function ({cell_value, onClick, 
    in_manual_mode,
    is_solving,
    solve_changed, solve_speed,
    possibilities, smallest_possibility,
    row, col,
    selected_row, selected_col, selected_number}: CellProps
) {
    const theme = useTheme();

    const parsed_possibilities = possibilities != undefined ? sudoku_parse_bitflag(possibilities) : undefined;

    let state: CellState;

    if (solve_changed)
        state = CellState.Solved;
    else if(possibilities != undefined && parsed_possibilities != undefined) {
        if(parsed_possibilities.length == 0)
        {
            if(cell_value == 0)
                state = CellState.Invalid;
            else
                state = CellState.Filled;
        }
        else
            state = CellState.Valid;
    }
    else {
        if(cell_value == 0)
            state = CellState.Empty;
        else
            state = CellState.Filled;
    }

    const same_row_or_col_color = interpolate_color(theme.palette.background.paper, theme.palette.primary.light, .40);
    const same_number_color = interpolate_color(theme.palette.background.paper, theme.palette.primary.dark, .80);
    return (
        <Box 
            className={`Sudoku-Cell ${state == CellState.Solved ? "Sudoku-Cell-Solve-Changed" : ""} 
            ${state == CellState.Invalid ? "Sudoku-Cell-Invalid" : ""} 
            ${!in_manual_mode && state == CellState.Filled ? "Sudoku-Cell-Solved" : ""}`}
            onClick={onClick}
            sx={{
                animationDuration: solve_speed + "ms",
                backgroundColor: 
                //  If in manual mode
                    !in_manual_mode ? 
                    (state == CellState.Solved ? theme.palette.success.main :   //  green if successfully placed
                    state == CellState.Invalid ? theme.palette.error.main :     //  red if invalid cell
                    //  If a valid cell exists
                    state == CellState.Valid && parsed_possibilities != undefined && smallest_possibility != undefined ? 
                        //  give it a color on a scale based on how many possibilities it has
                        interpolate_color(theme.palette.secondary.light, theme.palette.text.primary, 
                            parsed_possibilities.length - smallest_possibility == 0 ? 0 :
                            parsed_possibilities.length - smallest_possibility == 1 ? .25 : 
                            parsed_possibilities.length - smallest_possibility == 2 ? .3 : 
                            parsed_possibilities.length - smallest_possibility == 3 ? .35 : 
                            parsed_possibilities.length - smallest_possibility == 4 ? .4 :
                            parsed_possibilities.length - smallest_possibility == 5 ? .45 : 
                            parsed_possibilities.length - smallest_possibility == 6 ? .5 : 
                            parsed_possibilities.length - smallest_possibility == 7 ? .55 : 
                            parsed_possibilities.length - smallest_possibility == 8 ? .6 :  
                            0
                        ) :
                    //  filled cells are blue 
                    state == CellState.Filled ? theme.palette.primary.main :
                    //  Empty cells are blank
                    state == CellState.Empty ? theme.palette.background.paper : 
                    "")
                    :
                    //  If not in manual mode
                    //  Highlight the selected cell
                    (row == selected_row && col == selected_col) ? theme.palette.primary.light :
                    //  Mark cells of the same number
                    (cell_value == selected_number && cell_value != 0) ? same_number_color :
                    //  Smaller highlight the cells in the row and column
                    (row == selected_row || col == selected_col) ? same_row_or_col_color : 
                    //  Default blank
                    theme.palette.background.paper
                ,
                ":hover": {
                    backgroundColor: 
                        in_manual_mode ? theme.palette.primary.main : 
                        (state == CellState.Valid && parsed_possibilities?.length == smallest_possibility) ? theme.palette.secondary.main :
                        "default"
                },
                ":active": {  
                    backgroundColor: 
                        in_manual_mode ? theme.palette.primary.dark : 
                        (state == CellState.Valid && parsed_possibilities?.length == smallest_possibility) ? theme.palette.secondary.dark :
                        "default"
                }
            }}
        >
            {
                state != CellState.Valid ?
                    <p> 
                        {
                            state == CellState.Solved ? cell_value :
                            state == CellState.Invalid ? "X" :
                            state == CellState.Filled ? cell_value :
                            state == CellState.Empty ? " " : 
                            state == CellState.Valid ? " " :
                            " "
                        }
                    </p>
                :
                (parsed_possibilities && parsed_possibilities.length > 1) ?
                    <div 
                        style={{
                            width: "100%", 
                            height: "100%",
                            fontWeight: !in_manual_mode && !is_solving && parsed_possibilities && smallest_possibility && parsed_possibilities.length == smallest_possibility ? "bold" : "normal"
                        }} className={`Sudoku-Cell-Options 
                    ${!in_manual_mode && !is_solving && parsed_possibilities && smallest_possibility && parsed_possibilities.length == smallest_possibility ?
                        "Sudoku-Cell-Most-Likely" : ""
                    }`}>
                        <div style={{display: "flex", width: "100%", height: "33.33%"}}>
                            {parsed_possibilities?.includes(1) && <div style={{display: "inline", width: "33.33%"}}>1</div>}
                            {parsed_possibilities?.includes(2) && <div style={{display: "inline", width: "33.33%"}}>2</div>}
                            {parsed_possibilities?.includes(3) && <div style={{display: "inline", width: "33.33%"}}>3</div>}
                        </div>
                        <div style={{display: "flex", width: "100%", height: "33.33%"}}>
                            {parsed_possibilities?.includes(4) && <div style={{display: "inline", width: "33.33%"}}>4</div>}
                            {parsed_possibilities?.includes(5) && <div style={{display: "inline", width: "33.33%"}}>5</div>}
                            {parsed_possibilities?.includes(6) && <div style={{display: "inline", width: "33.33%"}}>6</div>}
                        </div>
                        <div style={{display: "flex", width: "100%", height: "33.33%"}}>
                            {parsed_possibilities?.includes(7) && <div style={{display: "inline", width: "33.33%"}}>7</div>}
                            {parsed_possibilities?.includes(8) && <div style={{display: "inline", width: "33.33%"}}>8</div>}
                            {parsed_possibilities?.includes(9) && <div style={{display: "inline", width: "33.33%"}}>9</div>}
                        </div>
                    </div> :
                <p
                    className={`${!in_manual_mode && !is_solving && parsed_possibilities && smallest_possibility && parsed_possibilities.length == smallest_possibility ?
                        "Sudoku-Cell-Most-Likely" : ""
                    }`}
                    style={{scale: "75%", fontWeight: 100}}
                >
                    {parsed_possibilities && parsed_possibilities[0]}
                </p>
            }
            
            
        </Box>
    )
});