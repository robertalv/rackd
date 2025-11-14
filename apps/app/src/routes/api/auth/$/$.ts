import { createFileRoute } from '@tanstack/react-router'
import { reactStartHandler } from '@convex-dev/better-auth/react-start'

export const Route = createFileRoute('/api/auth/$/$')({
  beforeLoad: ({ params }) => {
    return params;
  },
  server: {
    handlers: {
      GET: ({ request }) => { 
        return reactStartHandler(request)
      },
      POST: ({ request }) => {
        return reactStartHandler(request)
      },
    },
  },
})
