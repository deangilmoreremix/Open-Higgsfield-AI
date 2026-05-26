export async function saveToLibrary(item) {
  const library = JSON.parse(localStorage.getItem('higgsfield_library') || '[]');
  const newItem = { ...item, id: 'lib_' + Date.now(), savedAt: new Date().toISOString() };
  library.push(newItem);
  localStorage.setItem('higgsfield_library', JSON.stringify(library));
  return newItem;
}