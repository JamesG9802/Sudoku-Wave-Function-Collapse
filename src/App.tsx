import './App.css';
import Sudoku from './Sudoku';
import NumberSelector from './NumberSelector';
import Solver from './Solver';

let isDarkMode = false;
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  console.log(isDarkMode);
  const root = document.documentElement;
  if(isDarkMode)
  {
    root.style.setProperty("--page-bg-color", "var(--page-bg-color-dark)");
    root.style.setProperty("--page-bg-color-highlight", "var(--page-bg-color-highlight-dark)");
    root.style.setProperty("--text-color", "var(--text-color-dark)");
    root.style.setProperty("--text-color-highlight", "var(--text-color-highlight-dark)");
  }
  else
  {
    root.style.setProperty("--page-bg-color", "var(--page-bg-color-light)");
    root.style.setProperty("--page-bg-color-highlight", "var(--page-bg-color-highlight-light)");
    root.style.setProperty("--text-color", "var(--text-color-light)");
    root.style.setProperty("--text-color-highlight", "var(--text-color-highlight-light)");
  }
}

function App() {
  return (
    <>
      <div className="App">
        <button onClick={toggleDarkMode}>
          CLICK ME
        </button>
        <div className="column">
          <Sudoku></Sudoku>
          <Solver></Solver>
        </div>
        <NumberSelector></NumberSelector>
      </div>
    </>
  );
}

export default App;

