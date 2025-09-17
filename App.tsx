
import React, { useState, useCallback } from 'react';
import GoalSetter from './components/GoalSetter';
import PomodoroTimer from './components/PomodoroTimer';

const App: React.FC = () => {
  const [goal, setGoal] = useState<string>('');
  const [isGoalSet, setIsGoalSet] = useState<boolean>(false);

  const handleGoalSet = useCallback((newGoal: string) => {
    if (newGoal.trim()) {
      setGoal(newGoal.trim());
      setIsGoalSet(true);
    }
  }, []);

  return (
    <div className="min-h-screen w-full font-sans transition-colors duration-500">
      {!isGoalSet ? (
        <GoalSetter onGoalSet={handleGoalSet} />
      ) : (
        <PomodoroTimer goal={goal} />
      )}
    </div>
  );
};

export default App;
