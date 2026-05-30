"use client";

import { WorkflowStudio } from 'studio';

export default function WorkflowTabPage({ params }) {
  return (
    <div className="h-screen bg-black">
      <WorkflowStudio apiKey={null} />
    </div>
  );
}