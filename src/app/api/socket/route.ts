// This file is for documentation - Socket.io is handled by custom server
// The actual Socket.io setup is in server.js and src/lib/socket-server.ts

export async function GET() {
  return new Response("Socket.io endpoint - use WebSocket connection", {
    status: 200,
  });
}

