// Netlify Function wrapper for TanStack Start
// The dist/server files are copied to netlify/functions/server/ during build
import serverEntry from './server/server.js';

export const handler = async (event, context) => {
  try {
    // Verify serverEntry is loaded correctly
    if (!serverEntry || typeof serverEntry.fetch !== 'function') {
      console.error('serverEntry:', typeof serverEntry, serverEntry);
      throw new Error('serverEntry.fetch is not a function');
    }

    // Convert Netlify event to Request
    const protocol = event.headers['x-forwarded-proto'] || 'https';
    const host = event.headers.host || event.headers[':authority'] || 'localhost';
    const path = event.path || event.rawPath || '/';
    const queryString = event.rawQuery ? `?${event.rawQuery}` : '';
    const url = `${protocol}://${host}${path}${queryString}`;
    
    const request = new Request(url, {
      method: event.httpMethod || 'GET',
      headers: new Headers(event.headers),
      body: event.body && event.body !== 'null' ? event.body : undefined,
    });

    // Call TanStack Start handler
    const response = await serverEntry.fetch(request, {
      waitUntil: async (promise) => {
        // Netlify doesn't support waitUntil, but we can await the promise
        await promise;
      },
      passThrough: () => {},
    });

    // Convert Response to Netlify format
    const body = await response.text();
    const headers = {};
    response.headers.forEach((value, key) => {
      // Skip hop-by-hop headers
      if (!['connection', 'keep-alive', 'transfer-encoding'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    return {
      statusCode: response.status,
      headers,
      body,
    };
  } catch (error) {
    console.error('Netlify Function error:', error);
    console.error('Error stack:', error.stack);
    console.error('Event:', JSON.stringify(event, null, 2));
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};

