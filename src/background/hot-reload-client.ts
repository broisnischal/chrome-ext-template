const WS_URL = "ws://localhost:8080";

try {
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("[Hot Reload] Connected to server");
  };

  socket.onmessage = (event) => {
    if (event.data === "reload") {
      console.log("[Hot Reload] Reloading extension...");
      chrome.runtime.reload(); // Reloads the entire extension
    }
  };

  socket.onclose = () => {
    console.log("[Hot Reload] Disconnected from server");
  };
} catch (error) {
  console.log("[Hot Reload] Development server not running");
}
