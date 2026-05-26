const REQUIRED_FIELDS = ['id', 'name', 'description', 'route'];
const VALID_STATUSES = ['complete', 'partial', 'shell'];

export function validateManifest(manifest) {
  const errors = [];
  const warnings = [];
  let isShell = false;

  if (!manifest || typeof manifest !== 'object') {
    return {
      valid: false,
      errors: ['Manifest must be a non-null object'],
      warnings: [],
      isShell: true,
    };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (manifest.id !== undefined) {
    if (typeof manifest.id !== 'string') {
      errors.push('Field "id" must be a string');
    } else if (!/^[a-z0-9-]+$/.test(manifest.id)) {
      errors.push('Field "id" must contain only lowercase letters, numbers, and hyphens');
    }
  }

  if (manifest.name !== undefined && typeof manifest.name !== 'string') {
    errors.push('Field "name" must be a string');
  }

  if (manifest.description !== undefined && typeof manifest.description !== 'string') {
    errors.push('Field "description" must be a string');
  }

  if (manifest.route !== undefined) {
    if (typeof manifest.route !== 'string') {
      errors.push('Field "route" must be a string');
    } else if (!manifest.route.startsWith('/')) {
      errors.push('Field "route" must start with "/"');
    }
  }

  if (manifest.status !== undefined && !VALID_STATUSES.includes(manifest.status)) {
    warnings.push(`Invalid status "${manifest.status}". Expected one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (manifest.features !== undefined && !Array.isArray(manifest.features)) {
    warnings.push('Field "features" should be an array');
  }

  const hasServices = manifest.hasServices === true;
  const hasComponents = manifest.hasComponents === true;
  const hasAssets = manifest.hasAssets === true;

  if (!hasServices && !hasComponents && !hasAssets) {
    isShell = true;
    warnings.push('App appears to be a shell (no services, components, or assets)');
  } else if (!hasServices || !hasComponents) {
    warnings.push('App may be partially implemented (missing services or components)');
  }

  if (manifest.status === 'shell') {
    isShell = true;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    isShell,
  };
}

export async function validateAppDir(appId) {
  try {
    const mod = await import(`../apps/${appId}/manifest.js`);
    const manifest = mod.appManifest || mod.default;
    if (!manifest) {
      return {
        valid: false,
        errors: [`No manifest found in src/apps/${appId}/manifest.js`],
        warnings: [],
        isShell: true,
      };
    }
    return validateManifest(manifest);
  } catch (err) {
    return {
      valid: false,
      errors: [`Failed to load manifest: ${err.message}`],
      warnings: [],
      isShell: true,
    };
  }
}

export default { validateManifest, validateAppDir };
