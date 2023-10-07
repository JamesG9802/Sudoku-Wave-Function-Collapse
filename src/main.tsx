import ReactDOM from 'react-dom/client'
import App from './App.tsx'

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
 *      +   Expected:   Fix sizing.
 *      +   Expected:   Add help text.
 * v1.2
 *      +   Added:      Strengthen solver against more difficult puzzles.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
)
