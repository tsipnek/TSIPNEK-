export const config = {
    runtime: 'edge',   // This tells Vercel: run this at the edge
  }
  
  export default async function handler(request) {
    // Just a simple response for now
    return new Response('Edge function working!', {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    })
  }
  