"use client";

import React, { useEffect } from "react";
import { WorkflowStudio, getWorkflowInputs, getAllNodeSchemas, getWorkflowData, getUserWorkflows } from "studio";
import { useState } from "react";

const WorkflowUI = ({ workflowId }) => {
  const [apiKey, setApiKey] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('muapi_key');
      if (stored) setApiKey(stored);
    }
    sessionStorage.setItem("fromWorkflowBuilder", "true");
  }, []);

  return (
    <div className="w-full h-full bg-black">
      <WorkflowStudio apiKey={apiKey} />
    </div>
  );
};

export default WorkflowUI;
