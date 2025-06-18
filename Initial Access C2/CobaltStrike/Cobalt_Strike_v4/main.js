document.addEventListener('DOMContentLoaded', () => {
    // Initialize the network
    const network = new Network();
    
    // Initialize command processor with network reference
    CommandProcessor.init(network);
    
    // Set initial attacker
    network.selectDevice('attacker');
    
    // Log welcome message
    CommandProcessor.logCommand("Cobalt Strike Simulator initialized");
    CommandProcessor.logCommand("Type 'help' for available commands");
});