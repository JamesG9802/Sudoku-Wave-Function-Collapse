import './App.css';
import wfc_gif from "./assets/wfc.gif";
import house from "./assets/house.png";
import real_house from "./assets/real_house.png";
import house_gif from "./assets/house_wfc.gif";
import Sudoku from './sudoku';
import { Accordion, AccordionDetails, AccordionSummary, CssBaseline, useTheme } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function App() {
  const theme = useTheme();

  return (
    <>
      <CssBaseline/>
      <div className="App">
        <Sudoku/>
        <div style={{display: "flex", flexDirection: "column", justifyItems: "center", alignItems: "center", marginTop: "2rem"}}>
          <div className="Sudoku-Description" style={{fontSize: "medium"}}>
            <Accordion defaultExpanded sx={{backgroundColor: theme.palette.background.default}}>
              <AccordionSummary expandIcon={<ArrowDropDownIcon/>}> 
                <h1>Wave Function Collapse</h1>
              </AccordionSummary>
              <AccordionDetails>
                <p>
                  Inspired by the quantum physics concept of <a>superpositions</a>, or the possibility to be in multiple different states at once, wave function collapse has been used in computer programming for procedural generation of pictures and levels from nothing (or an incomplete image).
                </p>
                <p>
                  Shown below is an example of wave function collapse generating images by <a target="_blank" rel="noopener noreferrer" href="https://github.com/mxgmn">Maxim Gumin</a>.
                </p>
                <div style={{display: "flex", justifyContent: "center"}}>
                  <div style={{display: "flex", flexDirection: "column"}}>
                    <img style={{width: "384px", alignSelf: "center"}}src={wfc_gif} alt="An animated GIF of wave function collapse sequentially filling in empty space with tiles."/>
                    <p style={{fontSize: "small", alignSelf: "center", margin: ".5rem"}}>More information can be found at <a target="_blank" rel="noopener noreferrer"href="https://github.com/mxgmn/WaveFunctionCollapse">https://github.com/mxgmn/WaveFunctionCollapse</a>.</p>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded sx={{backgroundColor: theme.palette.background.default}}>
              <AccordionSummary expandIcon={<ArrowDropDownIcon/>}>
                <h1>How Does It Work?</h1>
              </AccordionSummary>
              <AccordionDetails>
                <p>
                  Imagine you were given a blank piece of paper and were told to draw a house. Any house, at all.
                  If you are artistically talented like myself, maybe you would draw a rectangle representing the walls and a triangle on top of it as the roof along with a nice ground foundation.
                </p>
                <div style={{display: "flex", justifyContent: "center"}}>
                  <div style={{display: "flex", flexDirection: "column"}}>
                    <img style={{width: "256px", alignSelf: "center"}}src={house} alt="A beautiful house."/>
                    <p style={{fontSize: "small", alignSelf: "center", margin: ".5rem"}}>It's a beautiful house.</p>
                  </div>
                </div>
                <p>
                  You have a lot of freedom in making your drawing. But without even realizing it, you may have put some constraints on yourself. Most likely, your house is not floating off the ground and your roof is actually attached to the walls.
                </p>
                <div style={{display: "flex", justifyContent: "center"}}>
                  <div style={{display: "flex", flexDirection: "column"}}>
                    <img style={{width: "256px", alignSelf: "center"}}src={real_house} alt="A beautiful house."/>
                    <p style={{fontSize: "small", alignSelf: "center", margin: ".5rem"}}>My condolences if this is your house.</p>
                  </div>
                </div>
                <p>
                  Just like how you had the freedom to draw a house with some constraints, the wave function collapse algorithm also follows the same rules. It starts with its own blank paper and tries its best to fill in the blanks to make a house. 
                </p>
                <p>
                  The only difference is it doesn't know what a "house" is. All it knows are the rules: walls must be connected to the ground and roofs must be connected to walls. 
                </p>
                <p>
                  Starting with nothing, the blank space on the paper can be anything; they are in a superposition of potentially being a wall, roof, or ground. But as soon as it starts drawing, let's say a wall, a single state has been chosen. The superposition collapses—hence wave function <strong style={{fontWeight: "bold"}}>collapse</strong>—into the state of "wall".
                </p>
                <p>
                  Continuing the drawing, the algorithm repeatedly collapses the blank space on the paper into different states until a final image is produced.
                </p>
                <div style={{display: "flex", justifyContent: "center"}}>
                  <div style={{display: "flex", flexDirection: "column"}}>
                    <img style={{width: "256px", alignSelf: "center"}}src={house_gif} alt="A beautiful house."/>
                    <p style={{fontSize: "small", alignSelf: "center", margin: ".5rem"}}>Collapsing the blank space into walls, the ground, and roofs.</p>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>  
            <Accordion defaultExpanded sx={{backgroundColor: theme.palette.background.default}}>
              <AccordionSummary expandIcon={<ArrowDropDownIcon/>}>
                <h1>Sudoku</h1>
              </AccordionSummary>
              <AccordionDetails>
                <p>
                  Sudoku is a popular puzzle game where the goal is to fill in each blank square with a number from 1 to 9 without having duplicates within each row, column, and 3x3 section.
                </p>
                <p>
                  It turns out that sudoku is an ideal puzzle to be solved with wave function collapse. Each cell is in a superposition of being 1, 2, 3, 4, 5, 6, 7, 8, or 9. The rules are to make sure there are no duplicates.
                </p>
                <p>
                  This is enough to completely fill out a sudoku board!
                </p>
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded sx={{backgroundColor: theme.palette.background.default}}>
              <AccordionSummary expandIcon={<ArrowDropDownIcon/>}>
                <h1>Using the Solver</h1>
              </AccordionSummary>
              <AccordionDetails>
                <h2>Editing Mode</h2>
                <p>
                  Here you can create or modify sudoku puzzles using the editor. Clicking on a square selects it and you can use your keyboard or the numbers on screen to change the value.
                </p>
                <p>
                  You can click the toggle to switch to solving mode.
                </p>
                <h2>Solving Mode</h2>
                <p>
                  In solving mode, the board looks slightly different.
                </p>
                <p>
                  Squares that are already filled out are now blue.
                </p>
                <p>
                The empty squares now show a superposition of the possible states they could be. The cells with the smallest number of possible states are indicated with an orange color and can be selected to collapse into a random state.
                </p>
                <p>
                  You can also automatically collapse the superpositions by clicking the gear icon. The solving speed can be adjusted by the wrench icon.
                </p>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
      </div>
      <footer style={{
        backgroundColor: theme.palette.background.paper,
        marginTop: "rem",
        paddingTop: "2rem",
        paddingLeft: "2rem",
        paddingRight: "2rem",
        paddingBottom: "0.5rem",
        borderTopLeftRadius: "2rem",
        borderTopRightRadius: "2rem",
        textAlign: "center"
      }}>
        <p>
          The source code for this website can be found at <a href="https://github.com/JamesG9802/Sudoku-Wave-Function-Collapse" target="_blank" rel="noreferrer">https://github.com/JamesG9802/Sudoku-Wave-Function-Collapse</a>.
        </p>
        <p>
          Want to see what else I made? Visit <a href="https://jamesg9802.github.io/">my website</a>.
        </p>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <a 
            style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "4px"}}
            href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
            <p>This website © 2024 is licensed under CC By-SA 4.0 License</p>
            <img style={{
              display: "inline-flex",
              height: "1.25rem"
            }} src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt=""/>
            <img style={{
              display: "inline-flex",
              height: "1.25rem"
            }} src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt=""/>
            <img style={{
              display: "inline-flex",
              height: "1.25rem"
            }} src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1" alt=""/>
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;

