// src/App.jsx

import React from 'react';
// Update this line to point to the new file name
import TaskList from './components/TaskList.jsx'; 
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <TaskList />
      </header>
    </div>
  );
}

export default App;
