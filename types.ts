import React from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'professor';
  department?: string;
  studentId?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  department: string;
  imageUrl?: string;
  resolvedImageUrl?: string;
  upvotes: number;
  reports: number;
  createdBy: string;
  timestamp: number;
  author: string;
  status: 'open' | 'resolved' | 'rejected';
  rejectionReason?: string;
}

export type ViewMode = 'student' | 'professor';

export interface DockItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}