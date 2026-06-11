import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const WebSocketContext = createContext(null)

const SERVER_IP = import.meta.env.VITE_SERVER_IP || 'localhost'
const WS_URL = import.meta.env.VITE_WS_URL || `ws://${SERVER_IP}:8000`

export function WebSocketProvider({ children }) {
  const { user, token } = useAuth()
  const wsRef = useRef(null)
  const pingRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState([])

  const connect = useCallback(() => {
    if (!user || !token) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(`${WS_URL}/ws/${user.id}?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      // Keepalive ping every 25s
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping')
      }, 25000)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data === 'pong') return

        setNotifications((prev) => [{ ...data, id: Date.now() }, ...prev.slice(0, 49)])

        // Show toast based on type
        if (data.type === 'new_order') {
          toast.custom((t) => (
            <div className={`order-toast order-toast-new ${t.visible ? 'visible' : ''}`}>
              <span className="order-toast-icon">🛎️</span>
              <div>
                <strong>New Order!</strong>
                <p>{data.message}</p>
              </div>
            </div>
          ), { duration: 6000, position: 'top-right' })
        } else if (data.type === 'order_update') {
          const icons = {
            preparing: '👨‍🍳',
            ready_in_5: '🔔',
            completed: '✅',
            cancelled: '❌',
          }
          toast.custom((t) => (
            <div className={`order-toast ${data.status === 'ready_in_5' ? 'order-toast-ready' : 'order-toast-update'} ${t.visible ? 'visible' : ''}`}>
              <span className="order-toast-icon">{icons[data.status] || '📋'}</span>
              <div>
                <strong>{data.canteen_name}</strong>
                <p>{data.message}</p>
              </div>
            </div>
          ), { duration: data.status === 'ready_in_5' ? 10000 : 5000, position: 'top-right' })
        }
      } catch {}
    }

    ws.onerror = () => setConnected(false)
    ws.onclose = () => {
      setConnected(false)
      clearInterval(pingRef.current)
      // Auto-reconnect after 3s
      setTimeout(connect, 3000)
    }
  }, [user, token])

  const disconnect = useCallback(() => {
    clearInterval(pingRef.current)
    wsRef.current?.close()
    wsRef.current = null
    setConnected(false)
  }, [])

  useEffect(() => {
    if (user && token) {
      connect()
    } else {
      disconnect()
    }
    return disconnect
  }, [user, token])

  const clearNotifications = useCallback(() => setNotifications([]), [])

  return (
    <WebSocketContext.Provider value={{ connected, notifications, clearNotifications }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  return useContext(WebSocketContext)
}
