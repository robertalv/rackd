import { createFileRoute } from '@tanstack/react-router'
import { reactStartHandler } from '@convex-dev/better-auth/react-start'

export const Route = createFileRoute('/api/auth/$')({
  beforeLoad: ({ params }) => {
    console.log('[AUTH ROUTE SINGLE] beforeLoad - params:', params);
  },
  server: {
    handlers: {
      GET: ({ request, params }) => {
        const url = new URL(request.url);
        console.log('[AUTH ROUTE SINGLE] GET request:', url.pathname, request.method);
        console.log('[AUTH ROUTE SINGLE] Full URL:', request.url);
        console.log('[AUTH ROUTE SINGLE] Route params:', params);
        return reactStartHandler(request)
      },
      POST: ({ request, params }) => {
        const url = new URL(request.url);
        console.log('[AUTH ROUTE SINGLE] POST request:', url.pathname, request.method);
        console.log('[AUTH ROUTE SINGLE] Full URL:', request.url);
        console.log('[AUTH ROUTE SINGLE] Route params:', params);
        
        return reactStartHandler(request)
      },
    },
  },
})