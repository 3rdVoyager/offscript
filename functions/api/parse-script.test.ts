import { describe, expect, it } from 'vitest';
import { onRequestPost } from './parse-script';

const validScript = {
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
              characters: ['Alex'],
            },
          ],
        },
      ],
    },
  ],
};

describe('POST /api/parse-script', () => {
  it('rejects malformed JSON with a client error', async () => {
    const response = await call(
      new Request('https://example.test/api/parse-script', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Send valid JSON containing script text.',
    });
  });

  it('validates and returns the structured model result', async () => {
    const response = await call(
      new Request('https://example.test/api/parse-script', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: 'Alex: Hello.' }),
      }),
      {
        run: async () => ({ response: JSON.stringify(validScript) }),
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      script: {
        title: 'A Short Play',
        acts: [
          {
            scenes: [
              {
                lines: [{ progress: 0 }],
              },
            ],
          },
        ],
      },
    });
  });
});

async function call(
  request: Request,
  ai: { run: (...args: never[]) => Promise<unknown> } = {
    run: async () => ({ response: JSON.stringify(validScript) }),
  },
): Promise<Response> {
  const context = {
    request,
    env: { AI: ai },
  } as unknown as Parameters<typeof onRequestPost>[0];

  return onRequestPost(context);
}
