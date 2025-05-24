export const NODE_METADATA_SCHEMAS = {
  "Input File": {
    file: {
      type: "string",
      required: true,
      description: "Path to the input EEG file"
    },
  },

  "Notch Filter": {
    frequency: {
      type: "number",
      required: true,
      min: 0,
      description: "Frequency (Hz) at which to apply notch filtering. Must be positive."
    },
    "include eog": {
      type: "boolean",
      required: true,
      default: true,
      description: "Whether to include EOG (eye movement) channels in the filter"
    },
  },

  "Plot Channels": {
    title: {
    type: "string",
    required: true,
    description: "Title of the plot window"
    },
    n_channels: {
      type: "integer",
      required: true,
      min: 1,
      description: "Number of EEG channels to plot"
    },
    block: {
      type: "boolean",
      required: true,
      default: true,
      description: "Whether to block execution until the plot is closed"
    },
  },

  "Output File": {
    path: {
      type: "string",
      required: true,
      description: "Path to save the processed EEG data (e.g. 'clean_subject1.edf')"
    },
  }
};

/**
 * Validates metadata for a node based on its Type
 * @param {string} type - Node type (e.g. "Input File")
 * @param {object} metadata - Metadata object
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validateMetadata(type, metadata) {
  const schema = NODE_METADATA_SCHEMAS[type];
  if (!schema) return { valid: true, errors: [] };

  const errors = [];

  for (const [key, config] of Object.entries(schema)) {
    const val = metadata[key];

    if (config.required && (val === undefined || val === '')) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }

    if (val !== undefined) {
      if (config.type === "string" && typeof val !== "string") {
        errors.push(`${key} must be a string`);
      } else if (config.type === "number" && (isNaN(val) || typeof Number(val) !== "number")) {
        errors.push(`${key} must be a number`);
      } else if (config.type === "integer" && (!Number.isInteger(+val) || +val < 0)) {
        errors.push(`${key} must be a positive integer`);
      } else if (config.type === "boolean" && typeof val !== "boolean") {
        errors.push(`${key} must be true or false`);
      }

      if (config.min !== undefined && +val < config.min) {
        errors.push(`${key} must be >= ${config.min}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
