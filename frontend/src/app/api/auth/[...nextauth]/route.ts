export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

export async function POST() {
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: { 'content-type': 'application/json' }
  });
}


