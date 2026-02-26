import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Enterprise Gateway: Runs on port 5001 (or same as HTTP)
 * Default namespace for telemetry feeds and IoT node handshakes.
 */
@WebSocketGateway({
    cors: { origin: '*' },
})
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients = new Map<string, string>(); // socketId -> nodeId or userId

    handleConnection(client: Socket) {
        console.log(`[Telemetry] Client connected: ${client.id}`);
        this.server.emit('system_status', { active_connections: this.connectedClients.size + 1 });
    }

    handleDisconnect(client: Socket) {
        console.log(`[Telemetry] Client disconnected: ${client.id}`);
        const nodeId = this.connectedClients.get(client.id);
        this.connectedClients.delete(client.id);

        // Announce disconnect to node's specific room if needed
        if (nodeId) {
            this.server.to(`node_${nodeId}`).emit('node_status', { status: 'offline', timestamp: new Date() });
        }
        this.server.emit('system_status', { active_connections: this.connectedClients.size });
    }

    @SubscribeMessage('subscribe_node')
    handleSubscribeToNode(
        @MessageBody() data: { nodeId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const room = `node_${data.nodeId}`;
        client.join(room);
        this.connectedClients.set(client.id, data.nodeId);

        console.log(`[Telemetry] Client ${client.id} subscribed to ${room}`);

        // Send immediate confirmation back to subscriber
        return { event: 'subscribed', data: { nodeId: data.nodeId, status: 'listening' } };
    }

    /**
     * Called by internal services (e.g. Kafka consumer) to broadcast
     * parsed IoT sensor data down to connected frontend clients.
     */
    public broadcastTelemetryUpdate(nodeId: string, telemetryPayload: any) {
        this.server.to(`node_${nodeId}`).emit('telemetry_update', {
            nodeId,
            timestamp: new Date().toISOString(),
            data: telemetryPayload,
        });
    }

    /**
     * Alert emission for high-priority pathogen spread warnings
     */
    public broadcastCriticalAlert(regionId: string, alertData: any) {
        // Broadcast to the whole system or specific regional namespaces
        this.server.emit('alert_critical', {
            regionId,
            priority: 'CRITICAL',
            payload: alertData,
            timestamp: new Date().toISOString(),
        });
    }
}
