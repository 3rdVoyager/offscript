import {
  getScriptValidationError,
  normalizeScript,
  type Script,
} from '../../src/scripts/script-schema';

export const MAX_SOURCE_CHARACTERS = 50_000;
export const PARSER_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export const SCRIPT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    schemaVersion: { type: 'number', enum: [1] },
    type: { type: 'string', enum: ['play'] },
    title: { type: 'string' },
    notes: { type: 'string' },
    acts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          scenes: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: { type: 'string' },
                lines: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      type: { type: 'string', enum: ['line', 'direction'] },
                      text: { type: 'string' },
                      characters: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                    required: ['type', 'text'],
                  },
                },
              },
              required: ['title', 'lines'],
            },
          },
        },
        required: ['title', 'scenes'],
      },
    },
  },
  required: ['schemaVersion', 'type', 'title', 'acts'],
} as const;

export function validateParsedScript(value: unknown): Script {
  const validationError = getScriptValidationError(value);
  if (validationError) {
    throw new Error(validationError);
  }

  return normalizeScript(value as Script);
}

export function parseModelResponse(value: unknown): unknown {
  if (isRecord(value) && 'response' in value) {
    return parseJsonValue(value.response);
  }

  return parseJsonValue(value);
}

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const cleaned = value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  return JSON.parse(cleaned);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
