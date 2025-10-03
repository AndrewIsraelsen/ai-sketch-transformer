// WebSocket and collaboration functionality
const socket = io('http://localhost:5000');
let currentProjectId = null;
let activeCursors = new Map();

// Initialize collaboration
function initCollaboration(projectId) {
    currentProjectId = projectId;
    socket.emit('join-project', projectId);

    // Listen for other users' actions
    socket.on('user-joined', (data) => {
        showNotification(`User joined (${data.userCount} online)`);
    });

    socket.on('user-left', (data) => {
        removeCursor(data.userId);
        showNotification(`User left (${data.userCount} online)`);
    });

    socket.on('room-users', (data) => {
        updateUserCount(data.userCount);
    });

    // Handle drawing from other users
    socket.on('draw', (data) => {
        if (data.userId !== socket.id) {
            applyRemoteDraw(data);
        }
    });

    // Handle layer updates
    socket.on('layer-update', (data) => {
        if (data.userId !== socket.id) {
            updateRemoteLayer(data);
        }
    });

    // Handle tool changes
    socket.on('tool-change', (data) => {
        if (data.userId !== socket.id) {
            showUserTool(data.userId, data.tool);
        }
    });

    // Handle canvas clear
    socket.on('clear-canvas', (data) => {
        if (data.userId !== socket.id) {
            clearCanvas();
        }
    });

    // Handle AI effects
    socket.on('apply-effect', (data) => {
        if (data.userId !== socket.id) {
            applyAIStyle(data.effect);
        }
    });

    // Handle cursor movement
    socket.on('cursor-move', (data) => {
        updateCursor(data.userId, data.x, data.y);
    });
}

// Emit drawing action
function emitDraw(drawData) {
    if (currentProjectId) {
        socket.emit('draw', {
            projectId: currentProjectId,
            userId: socket.id,
            ...drawData
        });
    }
}

// Emit layer update
function emitLayerUpdate(layerData) {
    if (currentProjectId) {
        socket.emit('layer-update', {
            projectId: currentProjectId,
            userId: socket.id,
            ...layerData
        });
    }
}

// Emit tool change
function emitToolChange(tool) {
    if (currentProjectId) {
        socket.emit('tool-change', {
            projectId: currentProjectId,
            userId: socket.id,
            tool
        });
    }
}

// Emit canvas clear
function emitClearCanvas() {
    if (currentProjectId) {
        socket.emit('clear-canvas', {
            projectId: currentProjectId,
            userId: socket.id
        });
    }
}

// Emit AI effect
function emitApplyEffect(effect) {
    if (currentProjectId) {
        socket.emit('apply-effect', {
            projectId: currentProjectId,
            userId: socket.id,
            effect
        });
    }
}

// Emit cursor movement
function emitCursorMove(x, y) {
    if (currentProjectId) {
        socket.emit('cursor-move', {
            projectId: currentProjectId,
            x,
            y
        });
    }
}

// Apply remote drawing
function applyRemoteDraw(data) {
    const ctx = layers[data.layerIndex || 0].canvas.getContext('2d');
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = data.opacity / 100;

    ctx.beginPath();
    ctx.moveTo(data.lastX, data.lastY);
    ctx.lineTo(data.x, data.y);
    ctx.stroke();

    renderLayers();
}

// Update remote layer
function updateRemoteLayer(data) {
    if (data.layerIndex < layers.length) {
        const layer = layers[data.layerIndex];
        if (data.visible !== undefined) layer.visible = data.visible;
        if (data.opacity !== undefined) layer.opacity = data.opacity;
        if (data.imageData) {
            const img = new Image();
            img.onload = () => {
                const ctx = layer.canvas.getContext('2d');
                ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                ctx.drawImage(img, 0, 0);
                renderLayers();
            };
            img.src = data.imageData;
        }
        updateLayersList();
        renderLayers();
    }
}

// Update cursor position
function updateCursor(userId, x, y) {
    let cursor = activeCursors.get(userId);

    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'remote-cursor';
        cursor.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            border: 2px solid ${getRandomColor()};
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            transition: all 0.1s;
            z-index: 1000;
        `;
        document.body.appendChild(cursor);
        activeCursors.set(userId, cursor);
    }

    const rect = drawCanvas.getBoundingClientRect();
    cursor.style.left = (rect.left + x) + 'px';
    cursor.style.top = (rect.top + y) + 'px';
}

// Remove cursor
function removeCursor(userId) {
    const cursor = activeCursors.get(userId);
    if (cursor) {
        cursor.remove();
        activeCursors.delete(userId);
    }
}

// Get random color for cursor
function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update user count
function updateUserCount(count) {
    let countEl = document.getElementById('user-count');
    if (!countEl) {
        countEl = document.createElement('div');
        countEl.id = 'user-count';
        countEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: white;
            padding: 10px 20px;
            border-radius: 25px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            font-weight: 600;
            color: #667eea;
            z-index: 1000;
        `;
        document.body.appendChild(countEl);
    }
    countEl.textContent = `👥 ${count} online`;
}

// Show user tool
function showUserTool(userId, tool) {
    showNotification(`User switched to ${tool}`);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
