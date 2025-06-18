class Network {
    constructor() {
        this.devices = {};
        this.connections = [];
        this.attacker = null;
        this.selectedTarget = null;
        this.initNetwork();
    }

    initNetwork() {
        // Initial devices with full metadata
        this.addDevice('attacker', { 
            name: 'LocalHost', 
            ip: '10.0.0.1', 
            os: 'Kali Linux', 
            security: 'Offensive Toolkit',
            notes: 'Primary attack platform'
        }, 50, window.innerHeight / 2 - 40);
    
        this.addDevice('device1', { 
            name: 'Router', 
            ip: '192.168.1.1', 
            os: 'Cisco 3199 FPro Router', 
            security: 'Firewall Enabled',
            notes: 'Network gateway device'
        }, 200, 200);
    
        this.addDevice('device2', { 
            name: 'Workstation-1', 
            ip: '192.168.1.10', 
            os: 'Windows 10 Pro', 
            security: 'AV Disabled',
            notes: 'User: jsmith, Last login: today'
        }, 400, 100);
    
        this.addDevice('device3', { 
            name: 'Server-1', 
            ip: '192.168.1.20', 
            os: 'Windows Server 2019', 
            security: 'Firewall Enabled, IDS Active',
            notes: 'Domain controller, Critical asset'
        }, 400, 300);
    
        this.attacker = this.devices['attacker'];
    }

    addDevice(id, metadata, x, y) {
        if (this.devices[id]) return;

        const device = document.createElement('div');
        device.className = 'device';
        device.id = id;
        device.textContent = metadata.name;
        device.style.left = `${x}px`;
        device.style.top = `${y}px`;

        device.addEventListener('click', () => this.selectDevice(id));

        document.querySelector('.network-container').appendChild(device);
        
        this.devices[id] = {
            element: device,
            metadata: metadata,
            status: 'clean',
            connections: []
        };

        return device;
    }

    selectDevice(id) {
        if (id === 'attacker') {
            // Set as attacker
            if (this.attacker) {
                this.attacker.element.style.outline = '';
            }
            this.attacker = this.devices[id];
            this.attacker.element.style.outline = '3px solid red';
            this.updateDeviceInfo(id);
            CommandProcessor.logCommand(`[INFO] Attacker set to ${this.devices[id].metadata.name}`);
        } else {
            // Set as target
            if (this.selectedTarget) {
                this.selectedTarget.element.classList.remove('selected');
            }
            this.selectedTarget = this.devices[id];
            this.selectedTarget.element.classList.add('selected');
            this.updateDeviceInfo(id);
            CommandProcessor.logCommand(`[INFO] Target set to ${this.devices[id].metadata.name}`);
        }
    }

    updateDeviceInfo(id) {
        const infoPanel = document.getElementById('device-info');
        const device = this.devices[id];
        
        if (device) {
            infoPanel.innerHTML = `
                <strong>${device.metadata.name}</strong><br>
                ID: ${id}<br>
                IP: ${device.metadata.ip}<br>
                OS: ${device.metadata.os}<br>
                Security: ${device.metadata.security}<br>
                Status: ${device.status}<br>
                Connections: ${device.connections.length}<br>
                ${device.metadata.notes ? `Notes: ${device.metadata.notes}<br>` : ''}
            `;
        } else {
            infoPanel.innerHTML = "Select a device to view details.";
        }
    }

    createConnection(fromId, toId, attackType) {
        if (!this.devices[fromId] || !this.devices[toId]) {
            CommandProcessor.logCommand("[ERROR] Invalid connection target.");
            return;
        }

        const from = this.devices[fromId].element;
        const to = this.devices[toId].element;
        const container = document.querySelector('.network-container');

        // Check if connection already exists
        const existingConnection = this.connections.find(conn => 
            (conn.from === fromId && conn.to === toId) || 
            (conn.from === toId && conn.to === fromId)
        );

        if (existingConnection) {
            CommandProcessor.logCommand(`[INFO] Connection already exists between ${fromId} and ${toId}`);
            return;
        }

        const line = document.createElement('div');
        line.className = `connection ${attackType.replace(' ', '-').toLowerCase()}`;
        
        // Store connection data
        line.dataset.from = fromId;
        line.dataset.to = toId;
        line.dataset.attackType = attackType;

        container.appendChild(line);
        this.updateConnectionPosition(line, from, to);

        // Add data flow animation
        const dataFlow = document.createElement('div');
        dataFlow.className = 'data-flow';
        dataFlow.style.height = '100%';
        dataFlow.style.width = '100%';
        line.appendChild(dataFlow);

        // Store connection info
        this.connections.push({
            from: fromId,
            to: toId,
            attackType: attackType,
            element: line
        });

        // Update device connections
        this.devices[fromId].connections.push(toId);
        this.devices[toId].connections.push(fromId);

        // Update UI
        this.updateNetworkLinks();
        CommandProcessor.logCommand(`[SUCCESS] ${attackType} connection established between ${fromId} and ${toId}`);
    }

    updateConnectionPosition(line, from, to) {
        const container = document.querySelector('.network-container');
        const fromRect = from.getBoundingClientRect();
        const toRect = to.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
        const x2 = toRect.left + toRect.width / 2 - containerRect.left;
        const y2 = toRect.top + toRect.height / 2 - containerRect.top;

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        line.style.width = `${length}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.top = `${y1}px`;
        line.style.left = `${x1}px`;
    }

    removeConnection(fromId, toId) {
        const connectionIndex = this.connections.findIndex(conn => 
            (conn.from === fromId && conn.to === toId) || 
            (conn.from === toId && conn.to === fromId)
        );

        if (connectionIndex !== -1) {
            const connection = this.connections[connectionIndex];
            connection.element.remove();
            this.connections.splice(connectionIndex, 1);

            // Remove from device connections
            const fromDevice = this.devices[fromId];
            const toDevice = this.devices[toId];
            
            if (fromDevice) {
                fromDevice.connections = fromDevice.connections.filter(id => id !== toId);
            }
            
            if (toDevice) {
                toDevice.connections = toDevice.connections.filter(id => id !== fromId);
            }

            this.updateNetworkLinks();
            CommandProcessor.logCommand(`[SUCCESS] Connection removed between ${fromId} and ${toId}`);
            return true;
        }

        CommandProcessor.logCommand(`[ERROR] No connection found between ${fromId} and ${toId}`);
        return false;
    }

    removeAllConnections(deviceId) {
        const device = this.devices[deviceId];
        if (!device) return;

        let removedCount = 0;
        
        // Create a copy of connections array to avoid modification during iteration
        const connectionsToRemove = [...device.connections];
        
        connectionsToRemove.forEach(connectedDeviceId => {
            if (this.removeConnection(deviceId, connectedDeviceId)) {
                removedCount++;
            }
        });

        if (removedCount > 0) {
            CommandProcessor.logCommand(`[SUCCESS] Removed all ${removedCount} connections from ${deviceId}`);
        } else {
            CommandProcessor.logCommand(`[INFO] No connections found for ${deviceId}`);
        }
    }

    updateNetworkLinks() {
        const linksList = document.getElementById('network-links');
        linksList.innerHTML = '';

        const uniqueConnections = new Set();
        
        this.connections.forEach(connection => {
            const connectionText = `${connection.from} → ${connection.to} (${connection.attackType})`;
            uniqueConnections.add(connectionText);
        });

        uniqueConnections.forEach(connectionText => {
            const li = document.createElement('li');
            li.textContent = connectionText;
            linksList.appendChild(li);
        });
    }

    updateDeviceStatus() {
        const statusList = document.getElementById('device-status-list');
        statusList.innerHTML = '';

        for (const [id, device] of Object.entries(this.devices)) {
            if (device.status !== 'clean') {
                const li = document.createElement('li');
                li.textContent = `${id} - ${device.metadata.name} (${device.status})`;
                statusList.appendChild(li);
            }
        }
    }

    attackTarget(attackType) {
        if (!this.selectedTarget) {
            CommandProcessor.logCommand("[ERROR] No target selected.");
            return;
        }

        const targetId = this.selectedTarget.element.id;
        const attackerId = this.attacker.element.id;

        // Special case for session injection
        if (attackType === 'session injection') {
            this.handleSessionInjection(targetId);
            return;
        }

        // Special case for reflective injection
        if (attackType === 'reflective injection') {
            this.handleReflectiveInjection(targetId);
            return;
        }

        // Create the attack connection
        this.createConnection(attackerId, targetId, attackType);

        // Update device status
        this.devices[targetId].status = 'Limited';
        this.devices[targetId].element.classList.add('limited-compromise');
        
        // Reveal connected devices
        this.revealConnectedDevices(targetId);

        this.updateDeviceStatus();
    }

    handleSessionInjection(targetId) {
        CommandProcessor.logCommand(`[INFO] Executing Session Injection on ${targetId}`);
        
        // Reset previous attacker
        this.attacker.element.classList.remove('attacker');
        this.attacker.element.style.outline = '';
        
        // Set new attacker
        this.attacker = this.devices[targetId];
        this.attacker.element.classList.add('attacker');
        this.attacker.element.style.outline = '3px solid red';
        
        // Mark as compromised
        this.devices[targetId].status = 'Fully Compromised';
        this.devices[targetId].element.classList.remove('limited-compromise');
        this.devices[targetId].element.classList.add('fully-compromised');
        
        this.updateDeviceStatus();
    }

    handleReflectiveInjection(targetId) {
        const currentAttackerId = this.attacker.element.id;
        const localHostAttacker = this.devices['attacker'];
        
        // Create initial attack connection
        this.createConnection(currentAttackerId, targetId, 'reflective injection');
        
        // Set timeout for the callback phase
        setTimeout(() => {
            // Remove the original attack connection
            this.removeConnection(currentAttackerId, targetId);
            
            // Create new callback connection to LocalHost
            this.createConnection(targetId, 'attacker', 'injected callback');
            
            // Mark target as compromised
            this.devices[targetId].status = 'Fully Compromised';
            this.devices[targetId].element.classList.remove('limited-compromise');
            this.devices[targetId].element.classList.add('fully-compromised');
            
            this.updateDeviceStatus();
            CommandProcessor.logCommand(`[SUCCESS] Reflective injection completed! ${targetId} is now calling back to LocalHost`);
            
            // Special visual effect for the callback
            const callbackElement = this.devices[targetId].element;
            callbackElement.classList.add('warning');
            setTimeout(() => {
                callbackElement.classList.remove('warning');
            }, 3000);
            
        }, 2000); // 2 second delay between phases
    }

    revealConnectedDevices(deviceId) {
        const deviceExpansion = {
            "device1": ["device4", "device5"],
            "device2": ["device6", "device7"],
            "device3": ["device8", "device9"],
            "device4": ["device10"],
            "device5": ["device11", "device12"],
        };
    
        if (deviceExpansion[deviceId]) {
            deviceExpansion[deviceId].forEach(newDeviceId => {
                if (!this.devices[newDeviceId]) {
                    const position = this.findValidPosition();
                    
                    const metadata = {
                        "device4": { name: "Workstation-2", ip: "192.168.1.11", os: "Windows 10", security: "AV Disabled" },
                        "device5": { name: "Workstation-3", ip: "192.168.1.12", os: "Windows 10", security: "AV Disabled" },
                        "device6": { name: "Server-2", ip: "192.168.1.21", os: "Windows Server 2019", security: "Firewall Enabled" },
                        "device7": { name: "Database", ip: "192.168.1.22", os: "SQL Server 2019", security: "Firewall Enabled" },
                        "device8": { name: "Mail Server", ip: "192.168.1.23", os: "Exchange Server", security: "Firewall Enabled" },
                        "device9": { name: "File Server", ip: "192.168.1.24", os: "Windows Server 2019", security: "Firewall Enabled" },
                        "device10": { name: "Printer", ip: "192.168.1.25", os: "HP Enterprise", security: "No Protection" },
                        "device11": { name: "Switch", ip: "192.168.1.26", os: "Cisco Switch", security: "Basic Firewall" },
                        "device12": { name: "VoIP", ip: "192.168.1.27", os: "Cisco VoIP", security: "No Protection" }
                    };
                    
                    this.addDevice(newDeviceId, metadata[newDeviceId] || {
                        name: `Device-${newDeviceId.replace('device', '')}`,
                        ip: `192.168.1.${Math.floor(10 + Math.random() * 240)}`,
                        os: Math.random() > 0.5 ? 'Windows' : 'Linux',
                        security: Math.random() > 0.7 ? 'Protected' : 'Vulnerable'
                    }, position.x, position.y);
                    
                    CommandProcessor.logCommand(`[INFO] Discovered new device: ${newDeviceId}`);
                }
            });
        }
    }
    
    findValidPosition() {
        const existingDevices = Object.values(this.devices);
        const padding = 100;
        const maxAttempts = 50;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = 300 + Math.random() * (window.innerWidth - 400);
            const y = 50 + Math.random() * (window.innerHeight - 200);
            
            let validPosition = true;
            
            // Check against all existing devices
            for (const device of existingDevices) {
                const rect = device.element.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(rect.left + rect.width/2 - x, 2) + 
                    Math.pow(rect.top + rect.height/2 - y, 2)
                );
                
                if (distance < padding) {
                    validPosition = false;
                    break;
                }
            }
            
            // Also check against attacker (LocalHost)
            const attackerRect = this.devices['attacker'].element.getBoundingClientRect();
            const attackerDistance = Math.sqrt(
                Math.pow(attackerRect.left + attackerRect.width/2 - x, 2) + 
                Math.pow(attackerRect.top + attackerRect.height/2 - y, 2)
            );
            
            if (attackerDistance < padding) {
                validPosition = false;
            }
            
            if (validPosition) {
                return { x, y };
            }
        }
        
        // Fallback position if no valid position found
        return { x: 400, y: 200 };
    }

    escalateDevice(deviceId) {
        const device = this.devices[deviceId];
        if (!device) {
            CommandProcessor.logCommand(`[ERROR] Device ${deviceId} not found.`);
            return;
        }

        if (device.status === 'Limited') {
            device.status = 'Fully Compromised';
            device.element.classList.remove('limited-compromise');
            device.element.classList.add('fully-compromised');
            CommandProcessor.logCommand(`[SUCCESS] ${deviceId} escalated to Fully Compromised.`);
            this.updateDeviceStatus();
        } else {
            CommandProcessor.logCommand(`[ERROR] ${deviceId} is not in a Limited state or is already escalated.`);
        }
    }
}