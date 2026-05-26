"use client";

import { WorkflowBuilder } from 'workflow-builder';

export default function WorkflowPage({ params }) {
  return (
    <div className="h-screen bg-black">
      <WorkflowBuilder workflowId={params?.id} />
    </div>
  );
}