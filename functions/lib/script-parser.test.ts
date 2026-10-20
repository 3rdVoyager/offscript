import { describe, expect, it } from 'vitest';
import {
  parseModelResponse,
  validateParsedScript,
} from './script-parser';

describe('script parser contract', () => {
  it('accepts a structured Workers AI response and normalizes it', () => {
    const response = parseModelResponse({
      response: JSON.stringify({
        schemaVersion: 1,
        type: 'play',
        title: 'A Short Play',
        acts: [
          {
            title: 'Act One',
            scenes: [
              {
                title: 'Scene One',
                lines: [
                  {
                    type: 'line',
                    text: 'Hello.',
                    characters: ['  Alex  '],
                  },
                ],
              },
            ],
          },
        ],
      }),
    });

    expect(validateParsedScript(response)).toMatchObject({
      title: 'A Short Play',
      acts: [
        {
          title: 'Act One',
          scenes: [
            {
              lines: [{ characters: ['Alex'], progress: 0 }],
            },
          ],
        },
      ],
    });
  });

  it('rejects spoken lines without a character', () => {
    expect(() =>
      validateParsedScript({
        schemaVersion: 1,
        type: 'play',
        title: 'Incomplete Play',
        acts: [
          {
            title: 'Act One',
            scenes: [
              {
                title: 'Scene One',
                lines: [{ type: 'line', text: 'Hello.' }],
              },
            ],
          },
        ],
      }),
    ).toThrow('Each spoken line needs at least one valid character.');
  });

  it('removes a markdown code fence from a JSON response', () => {
    expect(parseModelResponse('```json\n{"title":"Play"}\n```')).toEqual({
      title: 'Play',
    });
  });
});
