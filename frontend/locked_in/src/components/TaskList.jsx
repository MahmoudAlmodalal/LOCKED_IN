import React, { useState, useEffect } from 'react';

// This is a fake API function to simulate fetching data.
// Later, you can replace this with a real API call (e.g., using `axios` or `fetch`).
const fetchTasksFromAPI = async () => {
  console.log("Fetching tasks...");
  // Simulate a 1-second network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // This is our fake data
  const mockTasks = [
    { id: 1, title: 'Learn React basics', status: 'Completed' },
    { id: 2, title: 'Create TaskList component', status: 'In Progress' },
    { id: 3, title: 'Add styling to the app', status: 'To Do' },
  ];
  
  console.log("Tasks fetched successfully!");
  return mockTasks;
};

// This is our React component
const TaskList = () => {
  // State for storing the list of tasks
  const [tasks, setTasks] = useState([]);
  // State for showing a "Loading..." message
  const [isLoading, setIsLoading] = useState(true);
  // State for showing an error if something goes wrong
  const [error, setError] = useState(null);

  // This `useEffect` hook runs once when the component is first rendered
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksData = await fetchTasksFromAPI();
        setTasks(tasksData); // Put the fetched data into our state
      } catch (err) {
        setError("Failed to fetch tasks."); // If an error happens, store the message
        console.error(err);
      } finally {
        setIsLoading(false); // Stop loading, whether it succeeded or failed
      }
    };

    loadTasks();
  }, []); // The empty array [] means this runs only once

  // --- Conditional Rendering ---
  // Show a loading message while fetching
  if (isLoading) {
    return <p>Loading tasks...</p>;
  }

  // Show an error message if the fetch failed
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  // If everything is fine, show the list of tasks
  return (
    <div>
      <h1>My Tasks</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title} (<em>{task.status}</em>)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
