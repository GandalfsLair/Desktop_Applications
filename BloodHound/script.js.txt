// Generate fake AD data
function generateFakeADData() {
    const users = Array.from({ length: 20 }, (_, i) => ({
        id: `USER_${i}`,
        name: `User ${i}`,
        group: `GROUP_${i % 5}`
    }));

    const groups = Array.from({ length: 5 }, (_, i) => ({
        id: `GROUP_${i}`,
        name: `IT_GROUP_${i}`
    }));

    const computers = Array.from({ length: 10 }, (_, i) => ({
        id: `COMP_${i}`,
        name: `WS0${i}.corp.local`,
        os: i < 5 ? "Windows 10" : "Windows Server"
    }));

    const adminRelations = Array.from({ length: 15 }, () => ({
        from: `USER_${Math.floor(Math.random() * 20)}`,
        to: `COMP_${Math.floor(Math.random() * 10)}`,
        label: "AdminTo"
    }));

    return { users, groups, computers, adminRelations };
}

// Render the graph
function renderGraph(data) {
    const container = document.getElementById("graph");
    const nodes = [];
    const edges = [];

    // Add users (red nodes)
    data.users.forEach(user => {
        nodes.push({
            id: user.id,
            label: user.name,
            color: "#ff6b6b",
            shape: "dot"
        });
    });

    // Add groups (blue nodes)
    data.groups.forEach(group => {
        nodes.push({
            id: group.id,
            label: group.name,
            color: "#70a1ff",
            shape: "square"
        });
    });

    // Add computers (green nodes)
    data.computers.forEach(comp => {
        nodes.push({
            id: comp.id,
            label: comp.name,
            color: "#7bed9f",
            shape: "diamond"
        });
    });

    // Add admin relations (red edges)
    data.adminRelations.forEach(rel => {
        edges.push({
            from: rel.from,
            to: rel.to,
            color: "#ff4757",
            label: rel.label
        });
    });

    // Group memberships (blue edges)
    data.users.forEach(user => {
        edges.push({
            from: user.id,
            to: user.group,
            color: "#70a1ff"
        });
    });

    // Render with Vis.js
    new vis.Network(container, { nodes, edges }, {
        nodes: { font: { color: "#fff" } },
        edges: { arrows: "to" }
    });
}

// Fake scan simulation
function simulateScan() {
    const logs = document.getElementById("logs");
    const progress = document.querySelector("#scanProgress::after");

    logs.textContent = "[*] Starting fake BloodHound scan...\n";
    
    let progressWidth = 0;
    const interval = setInterval(() => {
        progressWidth += 5;
        document.querySelector("#scanProgress").style.setProperty("--width", progressWidth + "%");
        
        logs.textContent += `[*] Scanning user ${progressWidth / 5} of 20...\n`;
        logs.scrollTop = logs.scrollHeight;

        if (progressWidth >= 100) {
            clearInterval(interval);
            logs.textContent += "[+] Attack paths found!\n";
            logs.textContent += "[*] Rendering graph...\n";
            
            // Render graph after "scan"
            setTimeout(() => {
                const data = generateFakeADData();
                renderGraph(data);
                logs.textContent += "[+] Graph rendered!\n";
            }, 1000);
        }
    }, 300);
}

// Start scan on button click
document.getElementById("scanBtn").addEventListener("click", simulateScan);

// Initialize with empty data
renderGraph({ users: [], groups: [], computers: [], adminRelations: [] });