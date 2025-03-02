# Productivity Dashboard

A clean, modern productivity app built with HTML, CSS, and JavaScript that helps you manage tasks, track completion rates, and visualize your productivity.

## Features

- **Task Management**: Add, edit, and delete tasks
- **Task Categories**: Organize tasks into Work, Personal, Fitness, Chores, and Learning
- **Priority Levels**: Set tasks as High, Medium, or Low priority
- **Deadlines**: Set optional end dates for tasks
- **Completion Tracking**: View percentage of daily tasks completed
- **Dashboard**: Visual representation of task distribution and completion
- **Filtering**: Filter tasks by status (All, Today, Upcoming, Completed) and category
- **Data Persistence**: All data is stored in your browser's local storage

## Screenshots

![Dashboard View](screenshots/dashboard.png)

## How to Use

### Getting Started

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start adding tasks to your dashboard

### Adding Tasks

1. Fill in the task name (required)
2. Add an optional description
3. Select a category (Work, Personal, Fitness, Chores, Learning)
4. Choose a priority level (Low, Medium, High)
5. Optionally set a deadline by checking "Set Deadline" and selecting a date/time
6. Click "Add Task"

### Managing Tasks

- **Complete/Undo**: Mark tasks as complete or undo completion
- **Edit**: Modify task details
- **Delete**: Remove tasks permanently

### Filtering Tasks

- Use the top filter buttons to view:
  - **All Tasks**: View all tasks regardless of status
  - **Today**: View tasks due today
  - **Upcoming**: View tasks with future deadlines
  - **Completed**: View tasks you've completed

- Use the category buttons to filter by:
  - Work
  - Personal
  - Fitness
  - Chores
  - Learning

### Tracking Progress

- The "Today's Progress" section shows your completion rate for today's tasks
- The "Category Distribution" chart shows how your tasks are distributed
- The "Weekly Overview" chart shows your task completion over the past week

## Technical Details

This app is built with:

- **HTML5** for structure
- **Tailwind CSS** for styling
- **Vanilla JavaScript** for functionality
- **Chart.js** for data visualization
- **LocalStorage API** for data persistence
- **Font Awesome** for icons

## Future Enhancements

Potential features for future versions:
- User accounts and cloud sync
- Recurring tasks
- Subtasks and checklists
- Time tracking
- Pomodoro timer integration
- Dark/light theme toggle
- Export/import data

## License

This project is open source and available for personal and educational use. 