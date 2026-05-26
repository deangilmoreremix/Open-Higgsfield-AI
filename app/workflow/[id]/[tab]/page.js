"use client";

import { WorkflowBuilder } from 'workflow-builder';

export default function WorkflowTabPage({ params }) {
  return (
    <div className="h-screen bg-black">
      <WorkflowBuilder 
        workflowId={params?.id} 
        initialTab={params?.tab} 
      />
    </div>
  );
}