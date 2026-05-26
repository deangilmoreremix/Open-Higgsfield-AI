import {
    generateImage as muapiGenerateImage,
    generateVideo as muapiGenerateVideo,
    generateI2I as muapiGenerateI2I,
    generateI2V as muapiGenerateI2V,
    processV2V as muapiProcessV2V,
    processLipSync as muapiProcessLipSync,
    generateVideoEffect as muapiGenerateVideoEffect,
    generateAudio as muapiGenerateAudio,
    generateAvatar as muapiGenerateAvatar,
    uploadFile as muapiUploadFile,
    getUserBalance as muapiGetUserBalance,
    getTemplateWorkflows as muapiGetTemplateWorkflows,
    getUserWorkflows as muapiGetUserWorkflows,
    getPublishedWorkflows as muapiGetPublishedWorkflows,
    getTemplateAgents as muapiGetTemplateAgents,
    getUserAgents as muapiGetUserAgents,
    getPublishedAgents as muapiGetPublishedAgents,
    getUserConversations as muapiGetUserConversations,
    createWorkflow as muapiCreateWorkflow,
    updateWorkflowName as muapiUpdateWorkflowName,
    deleteWorkflow as muapiDeleteWorkflow,
    getWorkflowInputs as muapiGetWorkflowInputs,
    executeWorkflow as muapiExecuteWorkflow,
    getAllNodeSchemas as muapiGetAllNodeSchemas,
    getWorkflowData as muapiGetWorkflowData,
    getNodeSchemas as muapiGetNodeSchemas,
    runSingleNode as muapiRunSingleNode,
    deleteNodeRun as muapiDeleteNodeRun,
    getNodeStatus as muapiGetNodeStatus,
    calculateDynamicCost as muapiCalculateDynamicCost,
    registerAppInterest as muapiRegisterAppInterest,
    getAppInterests as muapiGetAppInterests,
} from '../../../src/lib/muapi.js';

export async function generateImage(apiKey, params) {
    return muapiGenerateImage(apiKey, params);
}

export async function generateVideo(apiKey, params) {
    return muapiGenerateVideo(apiKey, params);
}

export async function generateI2I(apiKey, params) {
    return muapiGenerateI2I(apiKey, params);
}

export async function generateI2V(apiKey, params) {
    return muapiGenerateI2V(apiKey, params);
}

export async function generateV2V(apiKey, params) {
    return muapiProcessV2V(apiKey, params);
}

export async function processLipSync(apiKey, params) {
    return muapiProcessLipSync(apiKey, params);
}

export async function generateVideoEffect(apiKey, params) {
    return muapiGenerateVideoEffect({ ...params, apiKey });
}

export async function generateAudio(apiKey, params) {
    return muapiGenerateAudio({ ...params, apiKey });
}

export async function generateAvatar(apiKey, params) {
    return muapiGenerateAvatar({ ...params, apiKey });
}

export function uploadFile(apiKey, file, onProgress) {
    return muapiUploadFile(apiKey, file, onProgress);
}

export async function getUserBalance(apiKey) {
    return muapiGetUserBalance(apiKey);
}

export async function getTemplateWorkflows(apiKey) {
    return muapiGetTemplateWorkflows(apiKey);
}

export async function getUserWorkflows(apiKey) {
    return muapiGetUserWorkflows(apiKey);
}

export async function getPublishedWorkflows(apiKey) {
    return muapiGetPublishedWorkflows(apiKey);
}

export async function getTemplateAgents(apiKey) {
    return muapiGetTemplateAgents(apiKey);
}

export async function getUserAgents(apiKey) {
    return muapiGetUserAgents(apiKey);
}

export async function getPublishedAgents(apiKey) {
    return muapiGetPublishedAgents(apiKey);
}

export async function getUserConversations(apiKey) {
    return muapiGetUserConversations(apiKey);
}

export async function createWorkflow(apiKey, payload) {
    return muapiCreateWorkflow(apiKey, payload);
}

export async function updateWorkflowName(apiKey, workflowId, name) {
    return muapiUpdateWorkflowName(apiKey, workflowId, name);
}

export async function deleteWorkflow(apiKey, workflowId) {
    return muapiDeleteWorkflow(apiKey, workflowId);
}

export async function getWorkflowInputs(apiKey, workflowId) {
    return muapiGetWorkflowInputs(apiKey, workflowId);
}

export async function executeWorkflow(apiKey, workflowId, inputs) {
    return muapiExecuteWorkflow(apiKey, workflowId, inputs);
}

export async function getAllNodeSchemas(apiKey, workflowId) {
    return muapiGetAllNodeSchemas(apiKey, workflowId);
}

export async function getWorkflowData(apiKey, workflowId) {
    return muapiGetWorkflowData(apiKey, workflowId);
}

export async function getNodeSchemas(apiKey, workflowId) {
    return muapiGetNodeSchemas(apiKey, workflowId);
}

export async function runSingleNode(apiKey, workflowId, nodeId, payload) {
    return muapiRunSingleNode(apiKey, workflowId, nodeId, payload);
}

export async function deleteNodeRun(apiKey, nodeRunId) {
    return muapiDeleteNodeRun(apiKey, nodeRunId);
}

export async function getNodeStatus(apiKey, runId) {
    return muapiGetNodeStatus(apiKey, runId);
}

export async function calculateDynamicCost(apiKey, taskName, payload) {
    return muapiCalculateDynamicCost(apiKey, taskName, payload);
}

export async function registerAppInterest(apiKey, appName) {
    return muapiRegisterAppInterest(apiKey, appName);
}

export async function getAppInterests(apiKey) {
    return muapiGetAppInterests(apiKey);
}
