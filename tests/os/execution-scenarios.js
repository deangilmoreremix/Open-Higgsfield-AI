export function createWorkflowScenarios() {
  return [
    {
      name: "Vibe → MuAPI → Render Pipeline",
      steps: ["vibe-workflow", "muapi-generation", "asset-pipeline", "render-engine"],
    },

    {
      name: "Video Outreach Full Loop",
      steps: ["ai-script-generation", "muapi-video-generation", "editor", "timeline", "export"],
    },

    {
      name: "Concurrent Multi-App Load",
      steps: Array.from({ length: 10 }).flatMap(() => ["workflow", "muapi", "render"]),
    },
  ];
}

export function createFailureScenarios() {
  return [
    {
      name: "Scheduler Kill",
      action: (kernel, chaos) => chaos.killSchedulerMidRun(50),
    },

    {
      name: "Event Bus Packet Loss",
      action: (kernel, chaos) => chaos.dropEventBusMessages(kernel.eventBus, 0.3),
    },

    {
      name: "Random Task Failures",
      action: (kernel, chaos) => chaos.injectRandomFailures(kernel.scheduler, 0.2),
    },

    {
      name: "Network Partition",
      action: (kernel, chaos) => chaos.simulateNetworkPartition(kernel, 100),
    },
  ];
}