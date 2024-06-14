import { Button } from "@mui/material";

export type NumberUIProps = {
  disabled: boolean;

  /**
   * The number that will be placed into the sudoku board.
   */
  number: number;

  /**
   * The function that will be called when the button is clicked.
   * @param cell_value the value that will be placed onto the sudoku board.
   * @returns 
   */
  onClick: (cell_value: number) => void;
}
export default function NumberUI({disabled, number, onClick}: NumberUIProps) {
    return (
      <Button
        disabled={disabled}
        variant="outlined"
        onClick={() => {onClick(number); }}
        sx={{
          ":hover" : {
            borderWidth: "2px",
          },
          padding: "0rem",
          borderWidth: "2px",
          fontSize: "2.25rem",
          fontWeight: "bold",
          aspectRatio: 1
        }}
      >
        {number}
      </Button>
    )
  }