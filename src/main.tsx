import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { PaletteOptions, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';

export let debug = false;

/**
 * v1   
 *      +   Added:      Can solve sudoku board.
 * v1.1 
 *      +   Added:      Fix X not removing user input flag.
 *      +   Added:      Add reset button.
 *      +   Added:      Add arrow movement support.
 *      +   Added:      Add selection highlight based on tab / arrow movement.
 *      +   Added:      Remove Dark mode.
 * v1.2
 *      +   Added:      Strengthen solver against more difficult puzzles.
 * v2.0
 *      +   Added:      Changed the UI to no longer break.
 *      +   Added:      Replaced the solver logic to use better rules.
 * v2.1
 *      +   Added:      Button to load new sudoku (not fully working)
 *      +   Added:      Updated UI for selecting and choosing options
 *      +   Added:      Button to fully solve without human input (not fully working)
 *      +   Expected:   Add description
 *      +   Expected:   Button to load puzzle from image
 */

const dark_palette: PaletteOptions = {
    mode: "dark",
    primary: {
        main: "#69bfff",
    },
    secondary: {
        main: "#e6b189",
    },
    background: {
        default: "#2a231e",
        paper: "#3d3128"
    },
}
const light_palette: PaletteOptions = {
    mode: "light",
    primary: {
        main: "#69bfff",
    },
    secondary: {
        main: "#e6b189",
    },
    background: {
        default: "#f3f2ff",
        paper: "#dddcee"
    }
}


const darkTheme = createTheme({ 
    palette: dark_palette,
    typography: {
        fontFamily: [
            "Open Sans",
            "Roboto",
            "Helvetica",
            "Arial",
            "sans-serif",
            "ui-sans-serif",
            "system-ui",
            "Apple Color Emoji",
            "Segoe UI Emoji",
            "Segoe UI Symbol",
            "Noto Color Emoji"
        ].join(',')
    }
  });
const lightTheme = createTheme({
    ...darkTheme, 
    palette: light_palette
});

function Main() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = prefersDarkMode ? darkTheme : lightTheme;
    return (
        <ThemeProvider theme={theme}>
            <App/>
        </ThemeProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Main/>
)
