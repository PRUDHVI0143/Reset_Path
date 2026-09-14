const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function connectResearchStream(id: string, onMessage: (data: any) => void) {
  const ws = new WebSocket(`${WS_BASE_URL}/research/${id}/stream`);

  ws.onopen = () => {
    console.log(`WebSocket connected to /research/${id}/stream`);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error("Failed to parse websocket message", e);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket closed");
  };

  return ws;
}
