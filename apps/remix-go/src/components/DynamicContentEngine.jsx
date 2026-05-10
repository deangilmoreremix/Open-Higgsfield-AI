import React, { useState, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import {
  UserPlus, Eye, MousePointer, Clock, MapPin, Mobile, ExternalLink,
  Code, Flag, Columns, MessageSquare, Bell, AlignLeft, Share, Envelope,
  Download, Upload, Plus, ToggleLeft, ToggleRight, Copy, Trash2, Play,
  Info, TrendingUp
} from 'lucide-react';

const triggers = [
  { id: 'first_visit', name: 'First Visit', icon: 'fa-user-plus' },
  { id: 'page_visit', name: 'Page Visit', icon: 'fa-eye' },
  { id: 'user_action', name: 'User Action', icon: 'fa-mouse-pointer' },
  { id: 'time_based', name: 'Time Based', icon: 'fa-clock' },
  { id: 'geolocation', name: 'Geolocation', icon: 'fa-map-marker' },
  { id: 'device_type', name: 'Device Type', icon: 'fa-mobile' },
  { id: 'referrer', name: 'Referrer Source', icon: 'fa-external-link' },
  { id: 'custom_event', name: 'Custom Event', icon: 'fa-code' }
];

const contentTypes = [
  { id: 'banner', name: 'Banner', icon: 'fa-flag' },
  { id: 'modal', name: 'Modal Popup', icon: 'fa-window-maximize' },
  { id: 'sidebar', name: 'Sidebar', icon: 'fa-columns' },
  { id: 'tooltip', name: 'Tooltip', icon: 'fa-comment' },
  { id: 'notification', name: 'Notification', icon: 'fa-bell' },
  { id: 'inline', name: 'Inline Content', icon: 'fa-paragraph' },
  { id: 'redirect', name: 'Page Redirect', icon: 'fa-share' },
  { id: 'email', name: 'Email Trigger', icon: 'fa-envelope' }
];

const conditionTypes = [
  { id: 'user_property', name: 'User Property', icon: 'fa-user' },
  { id: 'page_property', name: 'Page Property', icon: 'fa-file' },
  { id: 'time_condition', name: 'Time Condition', icon: 'fa-clock' },
  { id: 'behavior', name: 'User Behavior', icon: 'fa-chart-line' },
  { id: 'geolocation', name: 'Geolocation', icon: 'fa-map-marker' },
  { id: 'device', name: 'Device Info', icon: 'fa-mobile' },
  { id: 'referrer', name: 'Referrer', icon: 'fa-external-link' },
  { id: 'custom', name: 'Custom Condition', icon: 'fa-code' }
];

const operators = [
  { id: 'equals', name: 'Equals', symbol: '=' },
  { id: 'not_equals', name: 'Not Equals', symbol: '≠' },
  { id: 'greater_than', name: 'Greater Than', symbol: '>' },
  { id: 'less_than', name: 'Less Than', symbol: '<' },
  { id: 'contains', name: 'Contains', symbol: '⊃' },
  { id: 'not_contains', name: 'Not Contains', symbol: '⊄' },
  { id: 'between', name: 'Between', symbol: '↔' },
  { id: 'regex', name: 'Regex Match', symbol: '≈' }
];

const iconMap = {
  'fa-user-plus': UserPlus,
  'fa-eye': Eye,
  'fa-mouse-pointer': MousePointer,
  'fa-clock': Clock,
  'fa-map-marker': MapPin,
  'fa-mobile': Mobile,
  'fa-external-link': ExternalLink,
  'fa-code': Code,
  'fa-flag': Flag,
  'fa-window-maximize': Columns,
  'fa-columns': Columns,
  'fa-comment': MessageSquare,
  'fa-bell': Bell,
  'fa-paragraph': AlignLeft,
  'fa-share': Share,
  'fa-envelope': Envelope,
  'fa-user': UserPlus,
  'fa-file': Eye,
  'fa-chart-line': TrendingUp,
  'fa-toggle-on': ToggleRight,
  'fa-toggle-off': ToggleLeft,
  'fa-copy': Copy,
  'fa-trash': Trash2,
  'fa-plus': Plus,
  'fa-download': Download,
  'fa-upload': Upload,
  'fa-play': Play,
  'fa-info-circle': Info
};

function DynamicContentEngine({ onRuleSave }) {
  const [contentRules, setContentRules] = useState([
    {
      id: 'rule_1',
      name: 'New User Welcome',
      trigger: 'first_visit',
      conditions: [
        { type: 'user_property', property: 'loginCount', operator: 'equals', value: '1' }
      ],
      content: {
        type: 'banner',
        title: 'Welcome to Our Platform!',
        message: 'Discover amazing features tailored just for you.',
        cta: { text: 'Explore Features', url: '/features' }
      },
      priority: 10,
      active: true,
      schedule: { start: null, end: null, timezone: 'UTC' }
    },
    {
      id: 'rule_2',
      name: 'Returning User Offer',
      trigger: 'page_visit',
      conditions: [
        { type: 'user_property', property: 'loginCount', operator: 'greater_than', value: '5' },
        { type: 'time_condition', property: 'lastLogin', operator: 'greater_than', value: '7_days' }
      ],
      content: {
        type: 'modal',
        title: 'We Missed You!',
        message: 'Here\'s a special offer for returning users.',
        cta: { text: 'Claim Offer', url: '/offers' }
      },
      priority: 8,
      active: true,
      schedule: { start: null, end: null, timezone: 'UTC' }
    }
  ]);

  const [selectedRuleIndex, setSelectedRuleIndex] = useState(-1);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: 'page_visit',
    conditions: [],
    content: { type: 'banner', title: '', message: '', cta: { text: '', url: '' } },
    priority: 5,
    active: true,
    schedule: { start: null, end: null, timezone: 'UTC' }
  });

  const [previewUser, setPreviewUser] = useState({
    properties: {
      loginCount: 1,
      userType: 'new',
      location: 'US',
      interests: ['technology', 'business'],
      lastLogin: new Date(Date.now() - 86400000).toISOString()
    },
    behavior: {
      pageViews: 5,
      timeSpent: 120,
      actions: ['signup', 'view_features']
    }
  });

  const [previewResults, setPreviewResults] = useState(null);

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={14} /> : null;
  };

  const selectRule = useCallback((index) => {
    setSelectedRuleIndex(index);
    setIsCreatingRule(false);
  }, []);

  const startCreatingRule = useCallback(() => {
    setIsCreatingRule(true);
    setSelectedRuleIndex(-1);
    setNewRule({
      name: '',
      trigger: 'page_visit',
      conditions: [],
      content: { type: 'banner', title: '', message: '', cta: { text: '', url: '' } },
      priority: 5,
      active: true,
      schedule: { start: null, end: null, timezone: 'UTC' }
    });
  }, []);

  const cancelCreatingRule = useCallback(() => {
    setIsCreatingRule(false);
  }, []);

  const saveNewRule = useCallback(() => {
    const rule = { ...newRule, id: `rule_${Date.now()}` };
    setContentRules(prev => [...prev, rule]);
    setIsCreatingRule(false);
    setSelectedRuleIndex(contentRules.length);
  }, [newRule, contentRules.length]);

  const updateRule = useCallback((index, field, value) => {
    setContentRules(prev => prev.map((rule, i) => {
      if (i !== index) return rule;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...rule,
          [parent]: { ...rule[parent], [child]: value }
        };
      }
      return { ...rule, [field]: value };
    }));
  }, []);

  const updateNewRule = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewRule(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setNewRule(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const addCondition = useCallback((ruleIndex, isNewRule = false) => {
    const newCondition = { type: 'user_property', property: '', operator: 'equals', value: '' };
    if (isNewRule) {
      setNewRule(prev => ({ ...prev, conditions: [...prev.conditions, newCondition] }));
    } else {
      setContentRules(prev => prev.map((rule, i) => {
        if (i !== ruleIndex) return rule;
        return { ...rule, conditions: [...rule.conditions, newCondition] };
      }));
    }
  }, []);

  const removeCondition = useCallback((ruleIndex, conditionIndex, isNewRule = false) => {
    if (isNewRule) {
      setNewRule(prev => ({
        ...prev,
        conditions: prev.conditions.filter((_, i) => i !== conditionIndex)
      }));
    } else {
      setContentRules(prev => prev.map((rule, i) => {
        if (i !== ruleIndex) return rule;
        return { ...rule, conditions: rule.conditions.filter((_, j) => j !== conditionIndex) };
      }));
    }
  }, []);

  const updateCondition = useCallback((ruleIndex, conditionIndex, field, value, isNewRule = false) => {
    if (isNewRule) {
      setNewRule(prev => ({
        ...prev,
        conditions: prev.conditions.map((cond, i) =>
          i === conditionIndex ? { ...cond, [field]: value } : cond
        )
      }));
    } else {
      setContentRules(prev => prev.map((rule, i) => {
        if (i !== ruleIndex) return rule;
        return {
          ...rule,
          conditions: rule.conditions.map((cond, j) =>
            j === conditionIndex ? { ...cond, [field]: value } : cond
          )
        };
      }));
    }
  }, []);

  const deleteRule = useCallback((index) => {
    setContentRules(prev => prev.filter((_, i) => i !== index));
    setSelectedRuleIndex(prev => {
      if (prev === index) return -1;
      if (prev > index) return prev - 1;
      return prev;
    });
  }, []);

  const duplicateRule = useCallback((index) => {
    const rule = contentRules[index];
    const newRule = { ...rule, id: `rule_${Date.now()}`, name: `${rule.name} (Copy)` };
    setContentRules(prev => {
      const newRules = [...prev];
      newRules.splice(index + 1, 0, newRule);
      return newRules;
    });
    setSelectedRuleIndex(index + 1);
  }, [contentRules]);

  const compareValues = useCallback((actual, operator, expected) => {
    switch (operator) {
      case 'equals': return actual == expected;
      case 'not_equals': return actual != expected;
      case 'greater_than': return parseFloat(actual) > parseFloat(expected);
      case 'less_than': return parseFloat(actual) < parseFloat(expected);
      case 'contains': return String(actual).toLowerCase().includes(String(expected).toLowerCase());
      case 'not_contains': return !String(actual).toLowerCase().includes(String(expected).toLowerCase());
      case 'between': {
        const [min, max] = expected.split('-').map(v => parseFloat(v));
        const val = parseFloat(actual);
        return val >= min && val <= max;
      }
      case 'regex':
        try { return new RegExp(expected).test(String(actual)); }
        catch { return false; }
      default: return true;
    }
  }, []);

  const evaluateCondition = useCallback((condition, user) => {
    const { type, property, operator, value } = condition;
    let actualValue;

    switch (type) {
      case 'user_property': actualValue = user.properties[property]; break;
      case 'page_property': actualValue = window.location.pathname; break;
      case 'time_condition':
        if (property === 'lastLogin') {
          const lastLogin = new Date(user.properties.lastLogin);
          const daysSince = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
          actualValue = Math.floor(daysSince);
        } else if (property === 'current_time') {
          const now = new Date();
          actualValue = now.getHours() * 100 + now.getMinutes();
        }
        break;
      case 'geolocation': actualValue = user.properties.location; break;
      default: return true;
    }

    return compareValues(actualValue, operator, value);
  }, [compareValues]);

  const runPreview = useCallback(() => {
    const matchingRules = contentRules.filter(rule => {
      if (!rule.active) return false;
      if (rule.schedule.start || rule.schedule.end) {
        const now = new Date();
        if (rule.schedule.start && new Date(rule.schedule.start) > now) return false;
        if (rule.schedule.end && new Date(rule.schedule.end) < now) return false;
      }
      return rule.conditions.every(condition => evaluateCondition(condition, previewUser));
    });

    setPreviewResults({
      user: previewUser,
      matchingRules,
      triggeredContent: matchingRules.map(rule => ({
        ruleId: rule.id,
        ruleName: rule.name,
        content: rule.content,
        priority: rule.priority
      })).sort((a, b) => b.priority - a.priority)
    });
  }, [contentRules, previewUser, evaluateCondition]);

  const updatePreviewUser = useCallback((section, field, value) => {
    setPreviewUser(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  }, []);

  const exportRules = useCallback(() => {
    const data = JSON.stringify(contentRules, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dynamic-content-rules.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [contentRules]);

  const importRules = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rules = JSON.parse(e.target.result);
          setContentRules(rules);
          setSelectedRuleIndex(-1);
        } catch (error) {
          console.error('Invalid rules file:', error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-5 bg-white border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-semibold m-0">Dynamic Content Engine</h2>
        <div className="flex gap-2">
          <button onClick={exportRules} className="px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Download size={16} /> Export Rules
          </button>
          <label className="px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload size={16} /> Import Rules
            <input type="file" accept=".json" onChange={importRules} className="hidden" />
          </label>
          <button onClick={startCreatingRule} className="px-4 py-2 bg-blue-500 text-white border border-blue-500 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-600 transition-colors">
            <Plus size={16} /> Create Rule
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="m-0 text-base font-semibold">Content Rules ({contentRules.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contentRules.map((rule, index) => (
              <div
                key={rule.id}
                className={clsx(
                  'p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50',
                  selectedRuleIndex === index && 'bg-blue-50 border-l-4 border-l-blue-500',
                  !rule.active && 'opacity-60'
                )}
                onClick={() => selectRule(index)}
              >
                <div className="font-medium mb-2">{rule.name}</div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    {getIcon(triggers.find(t => t.id === rule.trigger)?.icon)}
                    {triggers.find(t => t.id === rule.trigger)?.name}
                  </span>
                  <span>{rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}</span>
                  <span>Priority: {rule.priority}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <button
                    className="p-1.5 border-none bg-none text-gray-600 cursor-pointer rounded hover:bg-gray-200 transition-colors"
                    onClick={(e) => { e.stopPropagation(); updateRule(index, 'active', !rule.active); }}
                    title={rule.active ? 'Deactivate' : 'Activate'}
                  >
                    {rule.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                  <button
                    className="p-1.5 border-none bg-none text-gray-600 cursor-pointer rounded hover:bg-gray-200 transition-colors"
                    onClick={(e) => { e.stopPropagation(); duplicateRule(index); }}
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="p-1.5 border-none bg-none text-gray-600 cursor-pointer rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); deleteRule(index); }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {isCreatingRule && <RuleEditor isNewRule={true} rule={newRule} onUpdate={updateNewRule} onAddCondition={() => addCondition(0, true)} onRemoveCondition={(i) => removeCondition(0, i, true)} onUpdateCondition={(i, f, v) => updateCondition(0, i, f, v, true)} onSave={saveNewRule} onCancel={cancelCreatingRule} />}
        </div>

        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
          {selectedRuleIndex >= 0 && !isCreatingRule && (
            <RuleEditor
              isNewRule={false}
              rule={contentRules[selectedRuleIndex]}
              ruleIndex={selectedRuleIndex}
              onUpdate={(f, v) => updateRule(selectedRuleIndex, f, v)}
              onAddCondition={() => addCondition(selectedRuleIndex)}
              onRemoveCondition={(i) => removeCondition(selectedRuleIndex, i)}
              onUpdateCondition={(i, f, v) => updateCondition(selectedRuleIndex, i, f, v)}
            />
          )}
        </div>

        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="m-0 text-lg font-semibold">Live Preview</h3>
            <button onClick={runPreview} className="px-4 py-2 bg-green-500 text-white border-none rounded-lg text-sm flex items-center gap-2 hover:bg-green-600 transition-colors">
              <Play size={16} /> Run Preview
            </button>
          </div>

          <div className="p-5 border-b border-gray-200">
            <h4 className="m-0 mb-4 text-base font-semibold">Test User Profile</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 uppercase">Login Count</label>
                <input
                  type="number"
                  value={previewUser.properties.loginCount}
                  onChange={(e) => updatePreviewUser('properties', 'loginCount', parseInt(e.target.value))}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 uppercase">User Type</label>
                <select
                  value={previewUser.properties.userType}
                  onChange={(e) => updatePreviewUser('properties', 'userType', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="new">New User</option>
                  <option value="returning">Returning</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 uppercase">Location</label>
                <input
                  type="text"
                  value={previewUser.properties.location}
                  onChange={(e) => updatePreviewUser('properties', 'location', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>

          {previewResults && (
            <div className="p-5">
              <h4 className="m-0 mb-4 text-base font-semibold">Preview Results</h4>
              <div className="grid gap-3">
                {previewResults.triggeredContent.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <Info size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No content rules matched for this user profile.</p>
                  </div>
                ) : (
                  previewResults.triggeredContent.map((content, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium mb-1">{content.ruleName}</div>
                      <div className="text-sm text-gray-700 mb-2">
                        {content.content.title && <strong>{content.content.title}</strong>}
                        {content.content.message && <span> - {content.content.message}</span>}
                      </div>
                      <div className="text-xs text-gray-600">Priority: {content.priority}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RuleEditor({ isNewRule, rule, ruleIndex, onUpdate, onAddCondition, onRemoveCondition, onUpdateCondition, onSave, onCancel }) {
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={14} /> : null;
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold m-0">{isNewRule ? 'Create New Rule' : `Edit: ${rule.name}`}</h3>
        {isNewRule && (
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 border border-gray-300 bg-white text-gray-600 rounded text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={onSave} className="px-3 py-1.5 bg-blue-500 text-white border-none rounded text-sm hover:bg-blue-600">Save Rule</button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Rule Name</label>
          <input
            type="text"
            value={rule.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Enter rule name"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Trigger</label>
            <select
              value={rule.trigger}
              onChange={(e) => onUpdate('trigger', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            >
              {triggers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Priority</label>
            <input
              type="number"
              min="1"
              max="100"
              value={rule.priority}
              onChange={(e) => onUpdate('priority', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={rule.active}
            onChange={(e) => onUpdate('active', e.target.checked)}
          />
          Rule is active
        </label>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-base font-semibold m-0">Conditions</h4>
            <button onClick={onAddCondition} className="px-3 py-1.5 bg-blue-500 text-white border-none rounded text-sm hover:bg-blue-600">
              Add Condition
            </button>
          </div>
          <div className="space-y-2">
            {rule.conditions.map((condition, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <select
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                  value={condition.type}
                  onChange={(e) => onUpdateCondition(i, 'type', e.target.value)}
                >
                  {conditionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input
                  type="text"
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                  placeholder="Property"
                  value={condition.property}
                  onChange={(e) => onUpdateCondition(i, 'property', e.target.value)}
                />
                <select
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                  value={condition.operator}
                  onChange={(e) => onUpdateCondition(i, 'operator', e.target.value)}
                >
                  {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
                <input
                  type="text"
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => onUpdateCondition(i, 'value', e.target.value)}
                />
                <button
                  onClick={() => onRemoveCondition(i)}
                  className="px-2 py-1.5 bg-red-500 text-white border-none rounded text-xs hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold m-0 mb-3">Content</h4>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Content Type</label>
              <select
                value={rule.content.type}
                onChange={(e) => onUpdate('content.type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                {contentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Title</label>
              <input
                type="text"
                value={rule.content.title || ''}
                onChange={(e) => onUpdate('content.title', e.target.value)}
                placeholder="Content title"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">Message</label>
              <textarea
                value={rule.content.message || ''}
                onChange={(e) => onUpdate('content.message', e.target.value)}
                placeholder="Content message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-vertical"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">CTA Text</label>
                <input
                  type="text"
                  value={rule.content.cta?.text || ''}
                  onChange={(e) => onUpdate('content.cta.text', e.target.value)}
                  placeholder="Button text"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 uppercase">CTA URL</label>
                <input
                  type="url"
                  value={rule.content.cta?.url || ''}
                  onChange={(e) => onUpdate('content.cta.url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-base font-semibold m-0 mb-3">Preview</h4>
          <div>
            {rule.content.title && <h5 className="m-0 mb-2">{rule.content.title}</h5>}
            {rule.content.message && <p className="m-0 mb-2 text-sm">{rule.content.message}</p>}
            {rule.content.cta?.text && (
              <button className="px-4 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 transition-colors">
                {rule.content.cta.text}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default observer(DynamicContentEngine);
