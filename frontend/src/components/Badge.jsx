import React from 'react';

const Badge = ({ status, variant }) => {
  if (!status) return null;

  const getVariant = (s) => {
    if (variant) return variant;
    const lower = String(s).toLowerCase();
    if (['active', 'completed', 'passed', 'published', 'scheduled'].includes(lower)) {
      return 'success';
    }
    if (['draft', 'pending', 'ongoing', 'in_progress', 'warning'].includes(lower)) {
      return 'warning';
    }
    if (['inactive', 'failed', 'terminated', 'danger', 'cancelled'].includes(lower)) {
      return 'danger';
    }
    return 'primary';
  };

  const v = getVariant(status);

  return (
    <span className={`badge badge-${v}`}>
      {status}
    </span>
  );
};

export default Badge;
