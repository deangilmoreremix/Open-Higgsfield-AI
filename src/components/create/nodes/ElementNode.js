/**
 * Elements System - Reusable Media Libraries
 * Characters, Locations, Props, Vehicles with AI consistency
 */

import { useState, useEffect, useCallback } from 'react';

const ELEMENT_CATEGORIES = [
  {
    id: 'characters',
    name: 'Characters',
    icon: '👥',
    angles: ['front', 'profile', 'back', 'detail', 'close-up', 'action', 'expression']
  },
  {
    id: 'locations',
    name: 'Locations',
    icon: '🏞️',
    angles: ['wide', 'medium', 'detail', 'aerial', 'interior', 'exterior', 'establishing']
  },
  {
    id: 'props',
    name: 'Props',
    icon: '🎭',
    angles: ['front', 'side', 'top', 'detail', 'in-use', 'collection', 'context']
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: '🚗',
    angles: ['front', 'side', 'rear', 'interior', 'action', 'detail', 'aerial']
  }
];

export function ElementsSystem() {
  const [elements, setElements] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('characters');
  const [selectedElement, setSelectedElement] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadElements();
  }, []);

  const loadElements = async () => {
    try {
      const response = await fetch('/api/elements');
      const data = await response.json();
      setElements(data);
    } catch (error) {
      console.error('Failed to load elements:', error);
    }
  };

  const createElement = async (category, name, description, referenceImage = null) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name,
          description,
          referenceImage
        })
      });

      const newElement = await response.json();

      // Generate consistent reference panels
      await generateReferencePanels(newElement);

      await loadElements();
      showToast(`Element "${name}" created successfully!`);

    } catch (error) {
      console.error('Failed to create element:', error);
      showToast('Failed to create element');
    } finally {
      setIsCreating(false);
    }
  };

  const generateReferencePanels = async (element) => {
    const category = ELEMENT_CATEGORIES.find(c => c.id === element.category);
    if (!category) return;

    const panels = [];

    for (const angle of category.angles) {
      try {
        const response = await fetch('/api/elements/generate-panel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elementId: element.id,
            angle,
            category: element.category,
            description: element.description,
            referenceImage: element.referenceImage
          })
        });

        const result = await response.json();
        panels.push({
          id: `${element.id}_${angle}`,
          angle,
          imageUrl: result.imageUrl,
          generatedAt: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Failed to generate ${angle} panel:`, error);
      }
    }

    // Update element with generated panels
    await fetch(`/api/elements/${element.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ panels })
    });
  };

  const regeneratePanel = async (elementId, panelId) => {
    try {
      const response = await fetch(`/api/elements/${elementId}/regenerate-panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelId })
      });

      const result = await response.json();

      // Update local state
      setElements(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory].map(el =>
          el.id === elementId
            ? {
                ...el,
                panels: el.panels.map(panel =>
                  panel.id === panelId
                    ? { ...panel, imageUrl: result.imageUrl, generatedAt: new Date().toISOString() }
                    : panel
                )
              }
            : el
        )
      }));

      showToast('Panel regenerated successfully!');

    } catch (error) {
      console.error('Failed to regenerate panel:', error);
      showToast('Failed to regenerate panel');
    }
  };

  const deleteElement = async (elementId) => {
    if (!confirm('Are you sure you want to delete this element?')) return;

    try {
      await fetch(`/api/elements/${elementId}`, { method: 'DELETE' });
      await loadElements();
      setSelectedElement(null);
      showToast('Element deleted');
    } catch (error) {
      console.error('Failed to delete element:', error);
      showToast('Failed to delete element');
    }
  };

  return (
    <div className="elements-system">
      <div className="elements-header">
        <h2>🎭 Elements Library</h2>
        <p>Reusable media libraries for consistent character and prop generation</p>
      </div>

      <div className="elements-layout">
        <div className="categories-sidebar">
          {ELEMENT_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedElement(null);
              }}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-count">
                {elements[category.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="elements-content">
          <div className="content-header">
            <h3>{ELEMENT_CATEGORIES.find(c => c.id === selectedCategory)?.name}</h3>
            <button
              className="create-element-btn"
              onClick={() => setIsCreating(true)}
            >
              + Create Element
            </button>
          </div>

          <div className="elements-grid">
            {elements[selectedCategory]?.map(element => (
              <div
                key={element.id}
                className={`element-card ${selectedElement?.id === element.id ? 'selected' : ''}`}
                onClick={() => setSelectedElement(element)}
              >
                <div className="element-thumbnail">
                  {element.referenceImage && (
                    <img src={element.referenceImage} alt={element.name} />
                  )}
                  {!element.referenceImage && element.panels?.[0] && (
                    <img src={element.panels[0].imageUrl} alt={element.name} />
                  )}
                </div>
                <div className="element-info">
                  <h4>{element.name}</h4>
                  <p>{element.description}</p>
                  <div className="element-meta">
                    <span>{element.panels?.length || 0} panels</span>
                    <span>{new Date(element.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedElement && (
          <div className="element-detail-panel">
            <div className="panel-header">
              <h3>{selectedElement.name}</h3>
              <div className="panel-actions">
                <button onClick={() => regeneratePanel(selectedElement.id)}>
                  🔄 Regenerate All
                </button>
                <button onClick={() => deleteElement(selectedElement.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>

            <div className="element-description">
              <p>{selectedElement.description}</p>
            </div>

            <div className="reference-panels">
              <h4>Reference Panels ({selectedElement.panels?.length || 0})</h4>
              <div className="panels-grid">
                {selectedElement.panels?.map(panel => (
                  <div key={panel.id} className="panel-item">
                    <div className="panel-image">
                      <img src={panel.imageUrl} alt={`${selectedElement.name} ${panel.angle}`} />
                    </div>
                    <div className="panel-info">
                      <span className="panel-angle">{panel.angle}</span>
                      <button
                        className="regenerate-panel-btn"
                        onClick={() => regeneratePanel(selectedElement.id, panel.id)}
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="usage-section">
              <h4>Usage in Prompts</h4>
              <div className="usage-code">
                <code>Type @{selectedElement.name.toLowerCase()} in any prompt</code>
              </div>
              <p>This will automatically include all reference images for consistency.</p>
            </div>
          </div>
        )}
      </div>

      {isCreating && (
        <CreateElementModal
          category={selectedCategory}
          onClose={() => setIsCreating(false)}
          onCreate={createElement}
        />
      )}
    </div>
  );
}

function CreateElementModal({ category, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      showToast('Please fill in all required fields');
      return;
    }

    onCreate(category, name, description, referenceImage);
    onClose();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setReferenceImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New Element</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Category</label>
              <select value={category} disabled>
                {ELEMENT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Hero Character, Mountain Lake, Magic Sword"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the element in detail for AI generation..."
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label>Reference Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {referenceImage && (
                <div className="image-preview">
                  <img src={referenceImage} alt="Reference" />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Create Element</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// CSS Styles
const elementsStyles = `
.elements-system {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.elements-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.elements-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.elements-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.elements-layout {
  flex: 1;
  display: flex;
}

.categories-sidebar {
  width: 200px;
  border-right: 1px solid var(--border);
  background: var(--bg-secondary);
  padding: 16px 0;
}

.category-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.category-btn:hover {
  background: var(--bg);
  color: var(--text);
}

.category-btn.active {
  background: var(--primary-alpha);
  color: var(--primary);
  border-right: 2px solid var(--primary);
}

.category-icon {
  font-size: 18px;
}

.category-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.category-count {
  font-size: 12px;
  background: var(--border);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.elements-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.content-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.create-element-btn {
  padding: 8px 16px;
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.create-element-btn:hover {
  background: var(--primary-hover);
}

.elements-grid {
  flex: 1;
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  overflow-y: auto;
}

.element-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  cursor: pointer;
  transition: all 0.15s ease;
  overflow: hidden;
}

.element-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.element-card.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-alpha);
}

.element-thumbnail {
  height: 160px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.element-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.element-info {
  padding: 16px;
}

.element-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.element-info p {
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
}

.element-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
}

.element-detail-panel {
  width: 350px;
  border-left: 1px solid var(--border);
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-actions button {
  padding: 6px 12px;
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.panel-actions button:hover {
  background: var(--bg-secondary);
}

.element-description {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
}

.element-description p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.reference-panels {
  flex: 1;
  padding: 16px 24px;
  overflow-y: auto;
}

.reference-panels h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.panels-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.panel-item {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.panel-image {
  height: 120px;
  overflow: hidden;
}

.panel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.panel-info {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-angle {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  text-transform: capitalize;
}

.regenerate-panel-btn {
  padding: 4px;
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.regenerate-panel-btn:hover {
  background: var(--primary-alpha);
  border-color: var(--primary);
}

.usage-section {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
}

.usage-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.usage-code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.usage-code code {
  color: var(--primary);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.usage-section p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.45);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.modal-header h3 {
  margin: 0;
  color: var(--text);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.modal-close:hover {
  background: var(--bg);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.image-preview {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.image-preview img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
}

.modal-footer button {
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s ease;
}

.primary-btn {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.primary-btn:hover {
  background: var(--primary-hover);
}
`;

export default ElementsSystem;</content>
<parameter name="filePath">src/components/elements/ElementsSystem.js