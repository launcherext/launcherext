import React from 'react';
import clsx from 'clsx';

interface StatBadgeProps {
  label: string;
  value: string;
  positive?: boolean;
}

const StatBadge: React.FC<StatBadgeProps> = ({ label, value, positive }) => {
  return (
    <div className="flex-1 bg-background-tertiary rounded-md px-3 py-2">
      <div className="text-text-muted text-xs">{label}</div>
      <div
        className={clsx(
          'text-sm font-semibold monospace',
          positive === true && 'text-success',
          positive === false && 'text-error',
          positive === undefined && 'text-text-primary'
        )}
      >
        {value}
      </div>
    </div>
  );
};

export default StatBadge;
