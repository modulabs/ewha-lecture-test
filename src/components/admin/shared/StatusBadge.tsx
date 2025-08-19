import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'registered' | 'blocked' | 'needs_revision' | 'submitted' | 'reviewed' | 'in_progress' | 'completed';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const statusConfig = {
    pending: {
      label: '대기중',
      classes: 'bg-gray-100 text-gray-800'
    },
    approved: {
      label: '승인됨',
      classes: 'bg-green-100 text-green-800'
    },
    rejected: {
      label: '거부됨',
      classes: 'bg-red-100 text-red-800'
    },
    registered: {
      label: '가입완료',
      classes: 'bg-blue-100 text-blue-800'
    },
    blocked: {
      label: '차단됨',
      classes: 'bg-red-100 text-red-800'
    },
    needs_revision: {
      label: '수정필요',
      classes: 'bg-amber-100 text-amber-800'
    },
    submitted: {
      label: '제출됨',
      classes: 'bg-indigo-100 text-indigo-800'
    },
    reviewed: {
      label: '검토됨',
      classes: 'bg-purple-100 text-purple-800'
    },
    in_progress: {
      label: '진행중',
      classes: 'bg-yellow-100 text-yellow-800'
    },
    completed: {
      label: '완료',
      classes: 'bg-green-100 text-green-800'
    }
  };

  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${config.classes}
      `}
    >
      {config.label}
    </span>
  );
};