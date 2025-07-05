#!/bin/bash

# Script to manage EGX Pilot Advisor development servers
# يديير خوادم التطوير بطريقة ذكية

PROJECT_ROOT="/home/ya3qoup/projects/production/egx/egx-pilot-advisor"
BACKEND_PORT=3001
FRONTEND_PORT=8080

echo "🚀 EGX Pilot Advisor Development Server Manager"
echo "==============================================="

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    echo "🔍 Checking port $port..."
    
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "⚡ Found processes on port $port: $pids"
        for pid in $pids; do
            echo "   🔫 Killing process $pid"
            kill -9 $pid 2>/dev/null
        done
        sleep 2
        
        # Verify the port is free
        local remaining=$(lsof -ti:$port 2>/dev/null)
        if [ -z "$remaining" ]; then
            echo "✅ Port $port is now free"
        else
            echo "❌ Failed to free port $port"
            return 1
        fi
    else
        echo "✅ Port $port is already free"
    fi
}

# Function to start backend
start_backend() {
    echo ""
    echo "🔧 Starting Backend Server..."
    echo "----------------------------"
    
    cd "$PROJECT_ROOT/backend"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    # Start the backend in the background
    echo "🚀 Starting backend on port $BACKEND_PORT..."
    nohup npm run dev > /tmp/egx-backend.log 2>&1 &
    echo $! > /tmp/egx-backend.pid
    
    # Wait and check if it started successfully
    sleep 5
    
    if curl -s "http://localhost:$BACKEND_PORT/health" > /dev/null; then
        echo "✅ Backend started successfully on port $BACKEND_PORT"
        echo "📄 Logs: tail -f /tmp/egx-backend.log"
        return 0
    else
        echo "❌ Backend failed to start. Check logs: tail -f /tmp/egx-backend.log"
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo ""
    echo "🎨 Starting Frontend Server..."
    echo "-----------------------------"
    
    cd "$PROJECT_ROOT"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Start the frontend in the background
    echo "🚀 Starting frontend on port $FRONTEND_PORT..."
    nohup npm run dev > /tmp/egx-frontend.log 2>&1 &
    echo $! > /tmp/egx-frontend.pid
    
    # Wait and check if it started successfully
    sleep 5
    
    if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null; then
        echo "✅ Frontend started successfully on port $FRONTEND_PORT"
        echo "📄 Logs: tail -f /tmp/egx-frontend.log"
        return 0
    else
        echo "❌ Frontend failed to start. Check logs: tail -f /tmp/egx-frontend.log"
        return 1
    fi
}

# Function to stop all services
stop_all() {
    echo ""
    echo "🛑 Stopping All Services..."
    echo "--------------------------"
    
    # Stop by PID files
    if [ -f "/tmp/egx-backend.pid" ]; then
        local backend_pid=$(cat /tmp/egx-backend.pid)
        echo "🔫 Stopping backend (PID: $backend_pid)"
        kill -15 $backend_pid 2>/dev/null || kill -9 $backend_pid 2>/dev/null
        rm -f /tmp/egx-backend.pid
    fi
    
    if [ -f "/tmp/egx-frontend.pid" ]; then
        local frontend_pid=$(cat /tmp/egx-frontend.pid)
        echo "🔫 Stopping frontend (PID: $frontend_pid)"
        kill -15 $frontend_pid 2>/dev/null || kill -9 $frontend_pid 2>/dev/null
        rm -f /tmp/egx-frontend.pid
    fi
    
    # Force kill any remaining processes on the ports
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    # Clean up any remaining Node processes related to the project
    pkill -f "egx-pilot-advisor" 2>/dev/null || true
    
    echo "✅ All services stopped"
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Service Status"
    echo "----------------"
    
    # Check backend
    if curl -s "http://localhost:$BACKEND_PORT/health" > /dev/null; then
        echo "✅ Backend: Running on port $BACKEND_PORT"
    else
        echo "❌ Backend: Not running"
    fi
    
    # Check frontend
    if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null; then
        echo "✅ Frontend: Running on port $FRONTEND_PORT"
    else
        echo "❌ Frontend: Not running"
    fi
    
    # Show recent logs
    echo ""
    echo "📄 Recent Backend Logs:"
    if [ -f "/tmp/egx-backend.log" ]; then
        tail -5 /tmp/egx-backend.log
    else
        echo "   No backend logs found"
    fi
    
    echo ""
    echo "📄 Recent Frontend Logs:"
    if [ -f "/tmp/egx-frontend.log" ]; then
        tail -5 /tmp/egx-frontend.log
    else
        echo "   No frontend logs found"
    fi
}

# Function to restart all services
restart_all() {
    echo "🔄 Restarting All Services..."
    echo "============================"
    
    stop_all
    sleep 3
    
    if start_backend && start_frontend; then
        echo ""
        echo "🎉 All services restarted successfully!"
        echo "🌐 Frontend: http://localhost:$FRONTEND_PORT"
        echo "🔗 Backend API: http://localhost:$BACKEND_PORT"
        echo "💡 Use './egx.sh status' to check status"
        echo "💡 Use './egx.sh logs' to follow logs"
    else
        echo ""
        echo "❌ Failed to restart some services. Check logs for details."
    fi
}

# Function to follow logs
follow_logs() {
    echo "📄 Following logs (Ctrl+C to exit)..."
    echo "====================================="
    
    if [ -f "/tmp/egx-backend.log" ] && [ -f "/tmp/egx-frontend.log" ]; then
        tail -f /tmp/egx-backend.log /tmp/egx-frontend.log
    elif [ -f "/tmp/egx-backend.log" ]; then
        tail -f /tmp/egx-backend.log
    elif [ -f "/tmp/egx-frontend.log" ]; then
        tail -f /tmp/egx-frontend.log
    else
        echo "No log files found"
    fi
}

# Main script logic
case "${1:-start}" in
    "start")
        restart_all
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        restart_all
        ;;
    "status")
        show_status
        ;;
    "logs")
        follow_logs
        ;;
    "backend")
        kill_port $BACKEND_PORT
        start_backend
        ;;
    "frontend")
        kill_port $FRONTEND_PORT
        start_frontend
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|backend|frontend}"
        echo ""
        echo "Commands:"
        echo "  start     - Start both backend and frontend (default)"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  status    - Show service status"
        echo "  logs      - Follow service logs"
        echo "  backend   - Start only backend"
        echo "  frontend  - Start only frontend"
        exit 1
        ;;
esac
