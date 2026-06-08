from typing import Dict, List
from fastapi import WebSocket
import asyncio
import json


class WebSocketManager:
    """
    Manages WebSocket connections keyed by user_id.
    Allows broadcasting order status updates to specific users.
    """

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
            except ValueError:
                pass
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_to_user(self, user_id: str, message: dict):
        """Send a JSON message to all connections for a user."""
        if user_id in self.active_connections:
            dead = []
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.disconnect(ws, user_id)

    async def broadcast_to_canteen_owner(self, owner_id: str, message: dict):
        """Notify canteen owner about new/updated orders."""
        await self.send_to_user(owner_id, message)

    def get_connected_users(self) -> List[str]:
        return list(self.active_connections.keys())


# Global singleton
ws_manager = WebSocketManager()
