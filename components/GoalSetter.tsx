
import React, { useState } from 'react';

interface GoalSetterProps {
  onGoalSet: (goal: string) => void;
}

const GoalSetter: React.FC<GoalSetterProps> = ({ onGoalSet }) => {
  const [goal, setGoal] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGoalSet(goal);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-cyan-300">
          PhD Focus Pomodoro
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          For the distracted, the desperate, the determined.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="goal" className="text-xl font-semibold mb-2">
            What is your main goal for today?
          </label>
          <input
            id="goal"
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Finish Chapter 3 draft..."
            className="p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
          <button
            type="submit"
            disabled={!goal.trim()}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
          >
            Start Focusing
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoalSetter;
