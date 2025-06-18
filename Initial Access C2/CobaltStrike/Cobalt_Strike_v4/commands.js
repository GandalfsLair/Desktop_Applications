class CommandProcessor {
    static init(network) {
        this.network = network;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.setupCLI();
        this.setupHelp();
    }

    static setupCLI() {
        const cliInput = document.getElementById('cli');
        
        cliInput.addEventListener('keydown', (e) => {
            // Command history navigation
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.commandHistory.length > 0) {
                    if (this.historyIndex < this.commandHistory.length - 1) {
                        this.historyIndex++;
                    }
                    cliInput.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    cliInput.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
                } else {
                    this.historyIndex = -1;
                    cliInput.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autoCompleteCommand(cliInput);
            } else if (e.key === 'Enter') {
                const command = cliInput.value.trim();
                if (command) {
                    this.commandHistory.push(command);
                    this.historyIndex = -1;
                    this.processCommand(command);
                    cliInput.value = '';
                }
            }
        });

        // Input suggestions
        cliInput.addEventListener('input', () => {
            this.showCommandSuggestions(cliInput.value);
        });
    }

    static autoCompleteCommand(input) {
        const text = input.value.trim();
        if (!text) return;

        const commands = [
            'attack', 'scan', 'set attacker', 'set target', 
            'escalate', 'clear', 'clearall', 'help'
        ];
        
        const attackTypes = [
            'reverse shell', 'bind shell', 'exploit injection', 
            'buffer overflow', 'command injection', 'powershell attack',
            'reflective injection', 'session injection'
        ];

        // Check if we're completing an attack type
        if (text.startsWith('attack ')) {
            const partialType = text.substring(7).toLowerCase();
            const match = attackTypes.find(type => type.startsWith(partialType));
            
            if (match) {
                input.value = `attack ${match}`;
            } else if (attackTypes.some(type => type.includes(partialType))) {
                // Show possible completions if multiple match
                const matches = attackTypes.filter(type => type.includes(partialType));
                this.logCommand(`[INFO] Possible completions: ${matches.join(', ')}`);
            }
            return;
        }

        // Complete regular commands
        const match = commands.find(cmd => cmd.startsWith(text.toLowerCase()));
        if (match) {
            input.value = match + (match === 'attack' ? ' ' : '');
        } else if (commands.some(cmd => cmd.includes(text.toLowerCase()))) {
            // Show possible completions if multiple match
            const matches = commands.filter(cmd => cmd.includes(text.toLowerCase()));
            this.logCommand(`[INFO] Possible completions: ${matches.join(', ')}`);
        }
    }

    static showCommandSuggestions(partialCommand) {
        // Implemented in the command help section
    }

    static processCommand(command) {
        this.logCommand(`> ${command}`);
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        try {
            switch (cmd) {
                case 'attack':
                    this.handleAttackCommand(args);
                    break;
                case 'set':
                    this.handleSetCommand(args);
                    break;
                case 'scan':
                    this.handleScanCommand(args);
                    break;
                case 'escalate':
                    this.handleEscalateCommand(args);
                    break;
                case 'clear':
                    this.handleClearCommand(args);
                    break;
                case 'clearall':
                    this.handleClearAllCommand(args);
                    break;
                case 'help':
                    this.showHelp();
                    break;
                default:
                    this.logCommand("[ERROR] Unknown command. Type 'help' for available commands.");
            }
        } catch (error) {
            this.logCommand(`[ERROR] Command execution failed: ${error.message}`);
            console.error(error);
        }
    }

    static handleAttackCommand(args) {
        if (!args.length) {
            this.logCommand("[ERROR] Please specify an attack type.");
            return;
        }

        const attackType = args.join(' ').toLowerCase();
        const validAttacks = [
            'reverse shell', 'bind shell', 'exploit injection',
            'buffer overflow', 'command injection', 'powershell attack',
            'reflective injection', 'session injection'
        ];

        if (!validAttacks.includes(attackType)) {
            this.logCommand("[ERROR] Invalid attack type. Valid types are:");
            this.logCommand(`       ${validAttacks.join(', ')}`);
            return;
        }

        if (!this.network.selectedTarget) {
            this.logCommand("[ERROR] No target selected. Use 'set target [deviceId]' first.");
            return;
        }

        this.network.attackTarget(attackType);
    }

    static handleSetCommand(args) {
        if (args.length < 2) {
            this.logCommand("[ERROR] Usage: set [attacker|target] [deviceId]");
            return;
        }
    
        const type = args[0].toLowerCase();
        const deviceId = args[1];
    
        if (type === 'attacker') {
            if (deviceId === 'attacker') {
                // Reset to original attacker
                this.network.attacker.element.classList.remove('selected');
                this.network.attacker.element.style.outline = '';
                this.network.attacker = this.network.devices['attacker'];
                this.network.attacker.element.style.outline = '3px solid red';
                this.logCommand("[INFO] Attacker reset to LocalHost.");
            } else if (this.network.devices[deviceId]) {
                this.network.attacker.element.classList.remove('attacker');
                this.network.attacker.element.style.outline = '';
                this.network.attacker = this.network.devices[deviceId];
                this.network.attacker.element.classList.add('attacker');
                this.network.attacker.element.style.outline = '3px solid red';
                this.logCommand(`[INFO] Attacker set to ${deviceId}`);
            } else {
                this.logCommand(`[ERROR] Device ${deviceId} not found.`);
            }
        } else if (type === 'target') {
            if (this.network.devices[deviceId]) {
                if (this.network.selectedTarget) {
                    this.network.selectedTarget.element.classList.remove('selected');
                }
                this.network.selectedTarget = this.network.devices[deviceId];
                this.network.selectedTarget.element.classList.add('selected');
                this.logCommand(`[INFO] Target set to ${deviceId}`);
            } else {
                this.logCommand(`[ERROR] Device ${deviceId} not found.`);
            }
        } else {
            this.logCommand("[ERROR] Usage: set [attacker|target] [deviceId]");
        }
    }

    static handleScanCommand(args) {
        if (!args.length) {
            this.logCommand("[ERROR] Please specify a device ID to scan.");
            return;
        }

        const deviceId = args[0];
        if (this.network.devices[deviceId]) {
            this.network.updateDeviceInfo(deviceId);
            this.logCommand(`[INFO] Scanned ${deviceId} - Information displayed.`);
        } else {
            this.logCommand(`[ERROR] Device ${deviceId} not found.`);
        }
    }

    static handleEscalateCommand(args) {
        if (!args.length) {
            this.logCommand("[ERROR] Please specify a device ID to escalate.");
            return;
        }

        const deviceId = args[0];
        this.network.escalateDevice(deviceId);
    }

    static handleClearCommand(args) {
        if (args.length < 2) {
            this.logCommand("[ERROR] Usage: clear [deviceId1] [deviceId2]");
            return;
        }

        const deviceId1 = args[0];
        const deviceId2 = args[1];

        if (!this.network.devices[deviceId1] || !this.network.devices[deviceId2]) {
            this.logCommand("[ERROR] One or both devices not found.");
            return;
        }

        this.network.removeConnection(deviceId1, deviceId2);
    }

    static handleClearAllCommand(args) {
        if (!args.length) {
            this.logCommand("[ERROR] Please specify a device ID.");
            return;
        }

        const deviceId = args[0];
        if (!this.network.devices[deviceId]) {
            this.logCommand(`[ERROR] Device ${deviceId} not found.`);
            return;
        }

        this.network.removeAllConnections(deviceId);
    }

    static logCommand(message) {
        const log = document.getElementById('command-log');
        const entry = document.createElement('p');
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    static setupHelp() {
        const helpPanel = document.getElementById('command-help');
        helpPanel.innerHTML = `
            <div><span>attack [type]</span> - Execute attack on selected target</div>
            <div><span>set attacker [id]</span> - Set attacker device</div>
            <div><span>set target [id]</span> - Set target device</div>
            <div><span>scan [id]</span> - Show device details</div>
            <div><span>escalate [id]</span> - Escalate compromised device</div>
            <div><span>clear [id1] [id2]</span> - Remove connection</div>
            <div><span>clearall [id]</span> - Remove all connections</div>
            <div><span>help</span> - Show this help</div>
            <br>
            <div>Attack Types: reverse shell, bind shell, exploit injection, buffer overflow, command injection, powershell attack, reflective injection, session injection</div>
        `;
    }

    static showHelp() {
        this.logCommand("Available commands:");
        this.logCommand("  attack [type] - Execute attack on selected target");
        this.logCommand("  set attacker [id] - Set attacker device");
        this.logCommand("  set target [id] - Set target device");
        this.logCommand("  scan [id] - Show device details");
        this.logCommand("  escalate [id] - Escalate compromised device");
        this.logCommand("  clear [id1] [id2] - Remove connection");
        this.logCommand("  clearall [id] - Remove all connections");
        this.logCommand("  help - Show this help");
        this.logCommand("");
        this.logCommand("Attack Types: reverse shell, bind shell, exploit injection,");
        this.logCommand("buffer overflow, command injection, powershell attack,");
        this.logCommand("reflective injection, session injection");
    }
}