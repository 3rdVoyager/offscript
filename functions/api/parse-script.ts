import {
  MAX_SOURCE_CHARACTERS,
  PARSER_MODEL,
  SCRIPT_JSON_SCHEMA,
  parseModelResponse,
  validateParsedScript,
} from '../lib/script-parser';

interface Env {
  AI: Ai;
}

const MAX_REQUEST_BYTES = 80_000;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  
  const contentLength = Number(context.request.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonError('The script is too large to parse.', 413);
  }

  if (!context.request.headers.get('content-type')?.includes('application/json')) {
    return jsonError('Send script text as JSON.', 415);
  }

  let body: unknown;
  try {
    body = await context.request.json<unknown>();
  } catch {
    return jsonError('Send valid JSON containing script text.', 400);
  }

  const text = getSourceText(body);
  if (!text) {
    return jsonError('Provide script text to parse.', 400);
  }

  if (text.length > MAX_SOURCE_CHARACTERS) {
    return jsonError('The script is too large to parse.', 413);
  }

  try {
    const modelResponse = await context.env.AI.run(PARSER_MODEL, {
      messages: [
        {
          role: 'system',
          content: [
            'Convert the supplied play or script into the requested JSON schema.',
            'Return only the JSON object. Do not invent dialogue or characters.',
            'Preserve the source order and wording as closely as possible.',
            'Use one act and scene when the source has no explicit structure.',
            'Use type "line" for spoken dialogue and type "direction" for stage directions.',
            'For spoken lines, put the speaker name in characters as a one-item array.',
            'Use an empty string for notes when there are no notes.',
          ].join(' '),
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: SCRIPT_JSON_SCHEMA,
      },
    });

    const script = validateParsedScript(parseModelResponse(modelResponse));
    return Response.json({ script }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'script_parse_failed',
        reason: error instanceof Error ? error.message : 'unknown_error',
      }),
    );

    return jsonError('The script could not be parsed. Check the text and try again.', 502);
  }
};

function getSourceText(body: unknown): string | null {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    !('text' in body) ||
    typeof body.text !== 'string'
  ) {
    return null;
  }

  const text = body.text.trim();
  return text || null;
}

function jsonError(message: string, status: number): Response {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}
