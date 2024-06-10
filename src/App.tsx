import { useEffect } from 'react';
import './App.css';
import Sudoku from './sudoku';

function App() {
  function set_dark_mode(is_dark_mode: boolean) {
    const root = document.documentElement;
    if(is_dark_mode)
    {
      root.style.setProperty("--page-bg-color", "var(--page-bg-color-dark)");
      root.style.setProperty("--page-bg-card-color", "var(--page-bg-card-color-dark)");
      root.style.setProperty("--text-color", "var(--text-color-dark)");
      root.style.setProperty("--accent-color", "var(--accent-color-dark)");
      root.style.setProperty("--solving-color", "var(--solving-color-dark)");
      root.style.setProperty("--editing-color", "var(--editing-color-dark)");
    }
    else
    {
      root.style.setProperty("--page-bg-color", "var(--page-bg-color-light)");
      root.style.setProperty("--page-bg-card-color", "var(--page-bg-card-color-light)");
      root.style.setProperty("--text-color", "var(--text-color-light)");
      root.style.setProperty("--accent-color", "var(--accent-color-light)");
      root.style.setProperty("--solving-color", "var(--solving-color-light)");
      root.style.setProperty("--editing-color", "var(--editing-color-light)");
    }
  }

  //  https://stackoverflow.com/a/75495293
  useEffect(() => {
    const mq = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    set_dark_mode(mq.matches);
    mq.addEventListener("change", (evt) => set_dark_mode(evt.matches));
  }, []);

  return (
    <>
      <div className="App">
        <Sudoku/>
      </div>
    </>
  );
}

export default App;

