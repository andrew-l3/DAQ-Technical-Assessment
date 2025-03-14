import net from "net";
import { WebSocket, WebSocketServer } from "ws";

interface VehicleData {
  battery_temperature: number | string;
  timestamp: number;
}

const TCP_PORT = 12000;
const WS_PORT = 8080;
const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: WS_PORT });

tcpServer.on("connection", (socket) => {
  console.log("TCP client connected");

  let startTime: number = 0;
  let invalidTemps: Array<number> = []
  socket.on("data", (msg) => {
    const message: string = msg.toString();
    const temp: number = Number(JSON.parse(message).battery_temperature);
    const time: number = Number(JSON.parse(message).timestamp);
    
    console.log(`Received: ${message}`);
    if (isNaN(temp)) return 1;

    if (startTime === 0) startTime = time;
    if (temp < 20 || temp > 80) invalidTemps.push(temp);

    let newMessage = JSON.parse(message);
    newMessage.status = 0;
    newMessage.delta = 0;

    if (time - startTime > 5000) {
      if (invalidTemps.length >= 3) {
        const unders = invalidTemps.filter((val) => val < 20).sort((x, y) => x - y).toString()
        const overs = invalidTemps.filter((val) => val > 80).sort((x, y) => x - y).toString()
        console.log(`WARNING: (${invalidTemps.length}) TEMP RANGE BREACHED {LOW: `
           + `(${unders}), HIGH: (${overs}), BETWEEN (${startTime} - ${time})}`);
      }
      startTime = time;
      invalidTemps = []
      newMessage.status = 1;
    }
    
    // Send JSON over WS to frontend clients
    websocketServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(newMessage));
      }
    });
  });

  socket.on("end", () => {
    console.log("Closing connection with the TCP client");
  });

  socket.on("error", (err) => {
    console.log("TCP client error: ", err);
  });
});

websocketServer.on("listening", () =>
  console.log(`Websocket server started on port ${WS_PORT}`)
);

websocketServer.on("connection", async (ws: WebSocket) => {
  console.log("Frontend websocket client connected");
  ws.on("error", console.error);
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});
