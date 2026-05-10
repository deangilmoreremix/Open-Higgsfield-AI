import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreProvider';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const PhaseView = observer(({ currentPhase, phases, onPhaseClick }) => {
  const store = useStore();

  return (
    <div className="w-full py-4 px-6 bg-white border-b">
      <div className="flex items-center justify-center gap-2">
        {phases.map((phase, index) => (
          <React.Fragment key={phase.id}>
            <button
              className={clsx(
                'flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-all',
                currentPhase === phase.id
                  ? 'bg-blue-50 text-blue-600'
                  : phase.completed
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
              onClick={() => onPhaseClick(phase.id)}
            >
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                currentPhase === phase.id
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : phase.completed
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white'
              )}>
                {phase.completed ? (
                  <CheckCircle size={16} />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className="text-xs font-medium">{phase.name}</span>
            </button>

            {index < phases.length - 1 && (
              <div className="flex-1 flex items-center">
                <div className={clsx(
                  'h-0.5 flex-1 rounded-full',
                  phase.completed ? 'bg-green-500' : 'bg-gray-300'
                )}>
                  <ArrowRight size={12} className="text-gray-400" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

export default PhaseView;