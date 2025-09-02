import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Game = () => {
    const initialGrid = Array(6).fill('').map(() => Array(5).fill(''));
    const [grid, setGrid] = useState(initialGrid);
    const [currentRow, setCurrentRow] = useState(0);
    const [currentCol, setCurrentCol] = useState(0);
    const [randomWord, setRandomWord] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [isRowSubmitted, setIsRowSubmitted] = useState(Array(6).fill(false)); 
    const [message, setMessage] = useState('');
    const [keyColors, setKeyColors] = useState({}); 

    const fetchRandomWord = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/word/random');
            setRandomWord(response.data.word.toUpperCase());
        } catch (error) {
            console.error('Error fetching random word:', error);
        }
    };

    useEffect(() => {
        fetchRandomWord();
    }, []);

    const handleLetterInput = (letter) => {
        if (currentCol < 5 && !isRowSubmitted[currentRow] && !gameOver) {
            const newGrid = [...grid];
            newGrid[currentRow][currentCol] = letter;
            setGrid(newGrid);
            setCurrentCol(currentCol + 1);
        }
    };

    const handleEnter = async () => {
        if (currentCol === 5 && !gameOver) {
            const word = grid[currentRow].join('');
            if (word.length === 5) {
                if (word === randomWord) {
                    setMessage('Congratulations! You guessed the word.');
                    setGameOver(true);
                    colorRow(grid[currentRow], randomWord);
                } else {
                    try {
                        const response = await axios.post('http://localhost:8080/api/word/check', { word });
                        const exists = response.data.exists;
                        if (exists) {
                            setMessage('');
                            colorRow(grid[currentRow], randomWord);
                            if (currentRow === 5) {
                                setMessage(`Game Over! The word was ${randomWord}`);
                                setGameOver(true);
                            } else {
                                setCurrentRow(currentRow + 1);
                                setCurrentCol(0);
                            }
                        } else {
                            //setMessage('Invalid word. Try again.');
                            clearCurrentRow();
                        }
                    } catch (error) {
                        console.error('Error checking the word:', error);
                    }
                }
            }
        }
    };

    const handleDelete = () => {
        if (currentCol > 0 && !isRowSubmitted[currentRow] && !gameOver) {
            const newGrid = [...grid];
            newGrid[currentRow][currentCol - 1] = '';
            setGrid(newGrid);
            setCurrentCol(currentCol - 1);
        }
    };

    const clearCurrentRow = () => {
        const newGrid = [...grid];
        newGrid[currentRow] = Array(5).fill('');
        setGrid(newGrid);
        setCurrentCol(0);
    };

    const colorRow = (row, word) => {
        const newGrid = [...grid];
        const newKeyColors = { ...keyColors };

        const wordArray = word.split('');

        row.forEach((letter, index) => {
            if (letter === wordArray[index]) {
                newGrid[currentRow][index] = {
                    letter,
                    color: 'bg-green-500',
                };
                newKeyColors[letter] = 'bg-green-500';
                wordArray[index] = null;
            }
        });

        row.forEach((letter, index) => {
            if (newGrid[currentRow][index].color) return;
            if (wordArray.includes(letter)) {
                newGrid[currentRow][index] = {
                    letter,
                    color: 'bg-yellow-500',
                };
                if (!newKeyColors[letter]) {
                    newKeyColors[letter] = 'bg-yellow-500';
                }
                wordArray[wordArray.indexOf(letter)] = null;
            } else {
                newGrid[currentRow][index] = {
                    letter,
                    color: 'bg-gray-500',
                };
                if (!newKeyColors[letter]) {
                    newKeyColors[letter] = 'bg-gray-500';
                }
            }
        });

        setGrid(newGrid);
        setKeyColors(newKeyColors);
        setIsRowSubmitted([...isRowSubmitted.slice(0, currentRow), true, ...isRowSubmitted.slice(currentRow + 1)]);
    };

    const startNewGame = () => {
        setGrid(initialGrid);
        setCurrentRow(0);
        setCurrentCol(0);
        setGameOver(false);
        setIsRowSubmitted(Array(6).fill(false));
        setMessage('');
        setKeyColors({});
        fetchRandomWord();
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
            const { key } = event;
            if (/^[a-zA-Z]$/.test(key) && !gameOver) {
                handleLetterInput(key.toUpperCase());
            } else if (key === 'Enter' && !gameOver) {
                handleEnter();
            } else if (key === 'Backspace' && !gameOver) {
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [currentCol, currentRow, grid, isRowSubmitted, gameOver]);

    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
    ];

    return (
        <div className="flex flex-col items-center space-y-8">
            <h1 className="text-2xl font-bold text-white">Wordle Game</h1>
            {message && <p className="text-white">{message}</p>}
            
            <div className="flex flex-col items-center space-y-2">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex space-x-2">
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className={`w-16 h-16 flex justify-center items-center text-2xl font-bold text-white rounded-md
                                    ${typeof cell === 'object' ? cell.color : 'bg-gray-800'}
                                `}
                            >
                                {typeof cell === 'object' ? cell.letter : cell}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            
            <div className="flex flex-col items-center space-y-2">
                {keys.map((keyRow, rowIndex) => (
                    <div key={rowIndex} className="flex space-x-2">
                        {keyRow.map((key) => (
                            <button
                                key={key}
                                onClick={() => {
                                    if (key === 'Enter') handleEnter();
                                    else if (key === '⌫') handleDelete();
                                    else handleLetterInput(key);
                                }}
                                className={`w-12 h-14 text-xl font-bold text-white rounded-md hover:bg-gray-600 ${
                                    keyColors[key] ? keyColors[key] : 'bg-gray-700'
                                } ${key === 'Enter' || key === '⌫' ? 'w-20' : ''}`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {gameOver && (
                <button
                    onClick={startNewGame}
                    className="mt-4 px-6 py-2 text-lg font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    Start New Game
                </button>
            )}
        </div>
    );
};

export default Game;









// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Game = () => {
//     const initialGrid = Array(6).fill('').map(() => Array(5).fill(''));

//     // State variables
//     const [grid, setGrid] = useState(initialGrid);
//     const [currentRow, setCurrentRow] = useState(0);
//     const [currentCol, setCurrentCol] = useState(0);
//     const [randomWord, setRandomWord] = useState('');
//     const [gameOver, setGameOver] = useState(false);
//     const [isRowSubmitted, setIsRowSubmitted] = useState(Array(6).fill(false));
//     const [message, setMessage] = useState('');
//     const [keyColors, setKeyColors] = useState({});

//     // Fetch a random word
//     const fetchRandomWord = async () => {
//         try {
//             const response = await axios.get('http://localhost:3000/api/word/random');
//             const word = response.data.word.toUpperCase();
//             setRandomWord(word);
//             localStorage.setItem('randomWord', word);
//         } catch (error) {
//             console.error('Error fetching random word:', error);
//         }
//     };

//     // Load game data from localStorage if available
//     useEffect(() => {
//         const savedGrid = JSON.parse(localStorage.getItem('grid'));
//         const savedRow = parseInt(localStorage.getItem('currentRow'), 10);
//         const savedCol = parseInt(localStorage.getItem('currentCol'), 10);
//         const savedWord = localStorage.getItem('randomWord');
//         const savedGameOver = JSON.parse(localStorage.getItem('gameOver'));
//         const savedIsRowSubmitted = JSON.parse(localStorage.getItem('isRowSubmitted'));
//         const savedMessage = localStorage.getItem('message');
//         const savedKeyColors = JSON.parse(localStorage.getItem('keyColors'));

//         if (savedGrid && savedWord) {
//             setGrid(savedGrid);
//             setCurrentRow(savedRow);
//             setCurrentCol(savedCol);
//             setRandomWord(savedWord);
//             setGameOver(savedGameOver);
//             setIsRowSubmitted(savedIsRowSubmitted);
//             setMessage(savedMessage);
//             setKeyColors(savedKeyColors);
//         } else {
//             fetchRandomWord();
//         }
//     }, []);

//     // Save game data to localStorage
//     useEffect(() => {
//         localStorage.setItem('grid', JSON.stringify(grid));
//         localStorage.setItem('currentRow', currentRow);
//         localStorage.setItem('currentCol', currentCol);
//         localStorage.setItem('gameOver', JSON.stringify(gameOver));
//         localStorage.setItem('isRowSubmitted', JSON.stringify(isRowSubmitted));
//         localStorage.setItem('message', message);
//         localStorage.setItem('keyColors', JSON.stringify(keyColors));
//     }, [grid, currentRow, currentCol, gameOver, isRowSubmitted, message, keyColors]);

//     const handleLetterInput = (letter) => {
//         if (currentCol < 5 && !isRowSubmitted[currentRow] && !gameOver) {
//             const newGrid = [...grid];
//             newGrid[currentRow][currentCol] = letter;
//             setGrid(newGrid);
//             setCurrentCol(currentCol + 1);
//         }
//     };

//     const handleEnter = async () => {
//         if (currentCol === 5 && !gameOver) {
//             const word = grid[currentRow].join('');
//             if (word.length === 5) {
//                 if (word === randomWord) {
//                     setMessage('Congratulations! You guessed the word.');
//                     setGameOver(true);
//                     colorRow(grid[currentRow], randomWord);
//                 } else {
//                     try {
//                         const response = await axios.post('http://localhost:3000/api/word/check', { word });
//                         const exists = response.data.exists;
//                         if (exists) {
//                             setMessage('');
//                             colorRow(grid[currentRow], randomWord);
//                             if (currentRow === 5) {
//                                 setMessage(`Game Over! The word was ${randomWord}`);
//                                 setGameOver(true);
//                             } else {
//                                 setCurrentRow(currentRow + 1);
//                                 setCurrentCol(0);
//                             }
//                         } else {
//                             clearCurrentRow();
//                         }
//                     } catch (error) {
//                         console.error('Error checking the word:', error);
//                     }
//                 }
//             }
//         }
//     };

//     const handleDelete = () => {
//         if (currentCol > 0 && !isRowSubmitted[currentRow] && !gameOver) {
//             const newGrid = [...grid];
//             newGrid[currentRow][currentCol - 1] = '';
//             setGrid(newGrid);
//             setCurrentCol(currentCol - 1);
//         }
//     };

//     const clearCurrentRow = () => {
//         const newGrid = [...grid];
//         newGrid[currentRow] = Array(5).fill('');
//         setGrid(newGrid);
//         setCurrentCol(0);
//     };

//     const colorRow = (row, word) => {
//         const newGrid = [...grid];
//         const newKeyColors = { ...keyColors };
//         const wordArray = word.split('');

//         row.forEach((letter, index) => {
//             if (letter === wordArray[index]) {
//                 newGrid[currentRow][index] = {
//                     letter,
//                     color: 'bg-green-500',
//                 };
//                 newKeyColors[letter] = 'bg-green-500';
//                 wordArray[index] = null;
//             }
//         });

//         row.forEach((letter, index) => {
//             if (newGrid[currentRow][index].color) return;
//             if (wordArray.includes(letter)) {
//                 newGrid[currentRow][index] = {
//                     letter,
//                     color: 'bg-yellow-500',
//                 };
//                 if (!newKeyColors[letter]) {
//                     newKeyColors[letter] = 'bg-yellow-500';
//                 }
//                 wordArray[wordArray.indexOf(letter)] = null;
//             } else {
//                 newGrid[currentRow][index] = {
//                     letter,
//                     color: 'bg-gray-500',
//                 };
//                 if (!newKeyColors[letter]) {
//                     newKeyColors[letter] = 'bg-gray-500';
//                 }
//             }
//         });

//         setGrid(newGrid);
//         setKeyColors(newKeyColors);
//         setIsRowSubmitted([...isRowSubmitted.slice(0, currentRow), true, ...isRowSubmitted.slice(currentRow + 1)]);
//     };

//     const startNewGame = () => {
//         setGrid(initialGrid);
//         setCurrentRow(0);
//         setCurrentCol(0);
//         setGameOver(false);
//         setIsRowSubmitted(Array(6).fill(false));
//         setMessage('');
//         setKeyColors({});
//         fetchRandomWord();
//         localStorage.clear();
//     };

//     useEffect(() => {
//         const handleKeyPress = (event) => {
//             const { key } = event;
//             if (/^[a-zA-Z]$/.test(key) && !gameOver) {
//                 handleLetterInput(key.toUpperCase());
//             } else if (key === 'Enter' && !gameOver) {
//                 handleEnter();
//             } else if (key === 'Backspace' && !gameOver) {
//                 handleDelete();
//             }
//         };

//         window.addEventListener('keydown', handleKeyPress);
//         return () => {
//             window.removeEventListener('keydown', handleKeyPress);
//         };
//     }, [currentCol, currentRow, grid, isRowSubmitted, gameOver]);

//     const keys = [
//         ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
//         ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
//         ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
//     ];

//     return (
//         <div className="flex flex-col items-center space-y-8">
//             {/* <h1 className="text-2xl font-bold text-white">Wordle Game</h1> */}
//             {message && <p className="text-white">{message}</p>}
            
//             <div className="flex flex-col items-center space-y-2">
//                 {grid.map((row, rowIndex) => (
//                     <div key={rowIndex} className="flex space-x-2">
//                         {row.map((cell, colIndex) => (
//                             <div
//                                 key={colIndex}
//                                 className={`w-16 h-16 flex justify-center items-center text-2xl font-bold text-white rounded-md
//                                     ${typeof cell === 'object' ? cell.color : 'bg-gray-800'}
//                                 `}
//                             >
//                                 {typeof cell === 'object' ? cell.letter : cell}
//                             </div>
//                         ))}
//                     </div>
//                 ))}
//             </div>
            
//             <div className="flex flex-col items-center space-y-2">
//                 {keys.map((keyRow, rowIndex) => (
//                     <div key={rowIndex} className="flex space-x-2">
//                         {keyRow.map((key) => (
//                             <button
//                                 key={key}
//                                 onClick={() => {
//                                     if (key === 'Enter') handleEnter();
//                                     else if (key === '⌫') handleDelete();
//                                     else handleLetterInput(key);
//                                 }}
//                                 className={`w-12 h-14 text-xl font-bold text-white rounded-md hover:bg-gray-600 ${
//                                     keyColors[key] ? keyColors[key] : 'bg-gray-700'
//                                 } ${key === 'Enter' || key === '⌫' ? 'w-20' : ''}`}
//                             >
//                                 {key}
//                             </button>
//                         ))}
//                     </div>
//                 ))}
//             </div>

//             {gameOver && (
//                 <button
//                     onClick={startNewGame}
//                     className="mt-4 px-6 py-2 text-lg font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600"
//                 >
//                     Start New Game
//                 </button>
//             )}
//         </div>
//     );
// };

// export default Game;