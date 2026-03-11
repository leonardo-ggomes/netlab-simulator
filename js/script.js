// ===== DEVICE DEFINITIONS =====
const DEVICE_DEFINITIONS = {
  router: {
    type: 'router',
    label: 'Router',
    model: 'Cisco 2911',
    icon: '🔷',
    width: 80,
    height: 50,
    color: '#00aaff',
    ports: [
      { id: 'g0/0', name: 'Gi0/0', type: 'gigabit' },
      { id: 'g0/1', name: 'Gi0/1', type: 'gigabit' },
      { id: 'g0/2', name: 'Gi0/2', type: 'gigabit' },
      { id: 's0/0/0', name: 'Se0/0/0', type: 'serial' },
      { id: 's0/0/1', name: 'Se0/0/1', type: 'serial' },
      { id: 'console', name: 'Console', type: 'console' },
    ],
    defaultConfig: {
      hostname: 'Router',
      interfaces: {
        'Gi0/0': { ip: '', mask: '255.255.255.0', status: 'down', description: '', vlan: null },
        'Gi0/1': { ip: '', mask: '255.255.255.0', status: 'down', description: '', vlan: null },
        'Gi0/2': { ip: '', mask: '255.255.255.0', status: 'down', description: '', vlan: null },
        'Se0/0/0': { ip: '', mask: '255.255.255.252', status: 'down', description: '', encapsulation: 'HDLC' },
        'Se0/0/1': { ip: '', mask: '255.255.255.252', status: 'down', description: '', encapsulation: 'HDLC' },
      },
      routing: { ospf: false, rip: false, bgp: false, static: [] },
      dhcpPools: [],
      natEnabled: false,
      password: 'cisco',
      enableSecret: 'class',
    }
  },

  'router-edge': {
    type: 'router-edge',
    label: 'Edge Router',
    model: 'Cisco ASR 1001',
    icon: '🔶',
    width: 90,
    height: 55,
    color: '#00aaff',
    ports: [
      { id: 'g0/0/0', name: 'Gi0/0/0', type: 'gigabit' },
      { id: 'g0/0/1', name: 'Gi0/0/1', type: 'gigabit' },
      { id: 'g0/0/2', name: 'Gi0/0/2', type: 'gigabit' },
      { id: 'g0/0/3', name: 'Gi0/0/3', type: 'gigabit' },
      { id: 'te0/0/0', name: 'Te0/0/0', type: 'tengigabit' },
      { id: 'te0/0/1', name: 'Te0/0/1', type: 'tengigabit' },
      { id: 'console', name: 'Console', type: 'console' },
    ],
    defaultConfig: {
      hostname: 'ASR1001',
      interfaces: {
        'Gi0/0/0': { ip: '', mask: '255.255.255.0', status: 'down', description: '' },
        'Gi0/0/1': { ip: '', mask: '255.255.255.0', status: 'down', description: '' },
        'Gi0/0/2': { ip: '', mask: '255.255.255.0', status: 'down', description: '' },
        'Gi0/0/3': { ip: '', mask: '255.255.255.0', status: 'down', description: '' },
        'Te0/0/0': { ip: '', mask: '255.255.255.252', status: 'down', description: '' },
        'Te0/0/1': { ip: '', mask: '255.255.255.252', status: 'down', description: '' },
      },
      routing: { ospf: false, bgp: false, static: [] },
      password: 'cisco',
    }
  },

  switch: {
    type: 'switch',
    label: 'Switch L2',
    model: 'Cisco Catalyst 2960',
    icon: '🔲',
    width: 90,
    height: 50,
    color: '#00ff88',
    ports: Array.from({length: 24}, (_, i) => ({
      id: `fa0/${i+1}`,
      name: `Fa0/${i+1}`,
      type: 'fastethernet'
    })).concat([
      { id: 'g0/1', name: 'Gi0/1', type: 'gigabit' },
      { id: 'g0/2', name: 'Gi0/2', type: 'gigabit' },
    ]),
    defaultConfig: {
      hostname: 'Switch',
      interfaces: Object.fromEntries(
        Array.from({length:24}, (_, i) => [`Fa0/${i+1}`, {
          vlan: 1, mode: 'access', status: 'down', description: '', speed: 'auto', duplex: 'auto'
        }]).concat([
          ['Gi0/1', { vlan: 1, mode: 'trunk', status: 'down', description: '', speed: 'auto' }],
          ['Gi0/2', { vlan: 1, mode: 'trunk', status: 'down', description: '', speed: 'auto' }],
        ])
      ),
      vlans: { 1: 'default' },
      spanningTree: true,
      vtp: { mode: 'server', domain: 'default' },
      password: 'cisco',
    }
  },

  'switch-l3': {
    type: 'switch-l3',
    label: 'Switch L3',
    model: 'Cisco Catalyst 3750',
    icon: '⬜',
    width: 90,
    height: 55,
    color: '#44ff88',
    ports: Array.from({length: 24}, (_, i) => ({
      id: `fa0/${i+1}`,
      name: `Fa0/${i+1}`,
      type: 'fastethernet'
    })).concat([
      { id: 'g0/1', name: 'Gi0/1', type: 'gigabit' },
      { id: 'g0/2', name: 'Gi0/2', type: 'gigabit' },
    ]),
    defaultConfig: {
      hostname: 'Switch-L3',
      interfaces: Object.fromEntries(
        Array.from({length:24}, (_, i) => [`Fa0/${i+1}`, {
          vlan: 1, mode: 'access', status: 'down', description: '', ip: '', mask: ''
        }]).concat([
          ['Gi0/1', { vlan: 1, mode: 'trunk', status: 'down', description: '', ip: '', mask: '' }],
          ['Gi0/2', { vlan: 1, mode: 'trunk', status: 'down', description: '', ip: '', mask: '' }],
        ])
      ),
      vlans: { 1: 'default' },
      routing: { ospf: false, rip: false },
      ipRouting: true,
      password: 'cisco',
    }
  },

  server: {
    type: 'server',
    label: 'Server',
    model: 'Cisco UCS C220',
    icon: '🖥',
    width: 80,
    height: 60,
    color: '#4488ff',
    ports: [
      { id: 'eth0', name: 'eth0', type: 'gigabit' },
      { id: 'eth1', name: 'eth1', type: 'gigabit' },
      { id: 'ilo', name: 'iLO/MGMT', type: 'management' },
    ],
    defaultConfig: {
      hostname: 'Server',
      interfaces: {
        'eth0': { ip: '', mask: '255.255.255.0', gateway: '', status: 'down', description: 'Primary' },
        'eth1': { ip: '', mask: '255.255.255.0', gateway: '', status: 'down', description: 'Secondary' },
        'iLO/MGMT': { ip: '', mask: '255.255.255.0', status: 'down', description: 'Management' },
      },
      services: {
        http: false,
        https: false,
        ftp: false,
        ssh: false,
        dns: false,
        dhcp: false,
        tftp: false,
      },
      os: 'Linux',
      cpu: 'Intel Xeon',
      ram: '32GB',
    }
  },

  firewall: {
    type: 'firewall',
    label: 'Firewall',
    model: 'Cisco ASA 5506',
    icon: '🛡',
    width: 85,
    height: 50,
    color: '#ff4444',
    ports: [
      { id: 'g1/1', name: 'Gi1/1 (Outside)', type: 'gigabit' },
      { id: 'g1/2', name: 'Gi1/2 (Inside)', type: 'gigabit' },
      { id: 'g1/3', name: 'Gi1/3 (DMZ)', type: 'gigabit' },
      { id: 'g1/4', name: 'Gi1/4', type: 'gigabit' },
      { id: 'mgmt', name: 'MGMT', type: 'management' },
    ],
    defaultConfig: {
      hostname: 'ASA',
      interfaces: {
        'Gi1/1': { ip: '', mask: '255.255.255.0', nameif: 'outside', securityLevel: 0, status: 'down' },
        'Gi1/2': { ip: '', mask: '255.255.255.0', nameif: 'inside', securityLevel: 100, status: 'down' },
        'Gi1/3': { ip: '', mask: '255.255.255.0', nameif: 'dmz', securityLevel: 50, status: 'down' },
        'Gi1/4': { ip: '', mask: '255.255.255.0', nameif: '', securityLevel: 0, status: 'down' },
        'MGMT': { ip: '', mask: '255.255.255.0', nameif: 'management', securityLevel: 0, status: 'down' },
      },
      nat: { dynamic: [], static: [] },
      acl: [],
      firewallMode: 'routed',
      password: 'cisco',
    }
  },

  ap: {
    type: 'ap',
    label: 'Access Point',
    model: 'Cisco Aironet 3802',
    icon: '📡',
    width: 65,
    height: 65,
    color: '#00ffaa',
    ports: [
      { id: 'eth0', name: 'Ethernet', type: 'gigabit' },
      { id: 'wifi24', name: 'Wi-Fi 2.4GHz', type: 'wireless' },
      { id: 'wifi5', name: 'Wi-Fi 5GHz', type: 'wireless' },
    ],
    defaultConfig: {
      hostname: 'AP',
      interfaces: {
        'Ethernet': { ip: '', mask: '255.255.255.0', status: 'down', description: '' },
      },
      wireless: {
        ssid24: 'CorpNet-2.4G',
        ssid5: 'CorpNet-5G',
        security: 'WPA2-Enterprise',
        channel24: 'auto',
        channel5: 'auto',
        power: '100mW',
        enabled: true,
      },
      controller: '',
    }
  },

  rack: {
    type: 'rack',
    label: 'Rack',
    model: '42U Standard',
    icon: '🗄',
    width: 60,
    height: 90,
    color: '#8888ff',
    ports: [],
    defaultConfig: {
      label: 'Rack-01',
      units: 42,
      location: '',
      power: 'dual PSU',
    }
  },

  cloud: {
    type: 'cloud',
    label: 'Cloud/Internet',
    model: 'ISP / WAN',
    icon: '☁',
    width: 80,
    height: 60,
    color: '#00aaff',
    ports: [
      { id: 'isp0', name: 'ISP Link 0', type: 'gigabit' },
      { id: 'isp1', name: 'ISP Link 1', type: 'gigabit' },
    ],
    defaultConfig: {
      label: 'Internet',
      provider: 'ISP',
      bandwidth: '1Gbps',
    }
  }
};

// ===== DEVICE INSTANCE MANAGER =====
class DeviceManager {
  constructor() {
    this.devices = new Map();
    this.counter = {};
  }

  createDevice(type, x, y) {
    const def = DEVICE_DEFINITIONS[type];
    if (!def) return null;

    this.counter[type] = (this.counter[type] || 0) + 1;
    const id = `${type}_${Date.now()}_${this.counter[type]}`;
    const label = `${def.label}${this.counter[type] > 1 ? this.counter[type] : ''}`;

    const device = {
      id,
      type,
      label,
      model: def.model,
      x,
      y,
      width: def.width,
      height: def.height,
      icon: def.icon,
      color: def.color,
      ports: JSON.parse(JSON.stringify(def.ports)),
      config: JSON.parse(JSON.stringify(def.defaultConfig)),
      powered: true,
      connections: [],
    };

    device.config.hostname = label;
    this.devices.set(id, device);
    return device;
  }

  getDevice(id) { return this.devices.get(id); }
  getAllDevices() { return Array.from(this.devices.values()); }
  removeDevice(id) { this.devices.delete(id); }
  updateDevice(id, updates) {
    const d = this.devices.get(id);
    if (d) Object.assign(d, updates);
  }
}

window.deviceManager = new DeviceManager();
window.DEVICE_DEFINITIONS = DEVICE_DEFINITIONS;

// ===== CANVAS MANAGER =====
class CanvasManager {
  constructor() {
    this.container = document.getElementById('canvasContainer');
    this.grid = document.getElementById('canvasGrid');
    this.canvas = document.getElementById('connectionCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.dropHint = document.getElementById('dropHint');

    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.selectedNode = null;
    this.draggingNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.nodes = new Map(); // id -> DOM element

    this.currentTool = 'select'; // select | connect | delete
    this.connectingFrom = null;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.setupDropZone();
    this.setupCanvasEvents();
    this.setupKeyboardShortcuts();
    this.setupToolButtons();
  }

  resizeCanvas() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    window.connectionManager?.redraw();
  }

  setupToolButtons() {
    document.getElementById('toolSelect').addEventListener('click', () => this.setTool('select'));
    document.getElementById('toolConnect').addEventListener('click', () => this.setTool('connect'));
    document.getElementById('toolDelete').addEventListener('click', () => this.setTool('delete'));
    document.getElementById('toolZoomIn').addEventListener('click', () => this.zoomBy(0.2));
    document.getElementById('toolZoomOut').addEventListener('click', () => this.zoomBy(-0.2));
  }

  setTool(tool) {
    this.currentTool = tool;
    this.connectingFrom = null;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active', 'danger'));
    const btn = document.getElementById(`tool${tool.charAt(0).toUpperCase() + tool.slice(1)}`);
    if (btn) {
      btn.classList.add('active');
      if (tool === 'delete') btn.classList.add('danger');
    }
    this.grid.style.cursor = tool === 'connect' ? 'crosshair' : tool === 'delete' ? 'not-allowed' : 'default';
    if (tool !== 'connect') {
      document.querySelectorAll('.port-handle').forEach(p => p.classList.remove('connecting'));
    }
    window.app?.notify(`Ferramenta: ${tool.toUpperCase()}`, 'info');
  }

  setupDropZone() {
    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('device-type');
      if (!type) return;

      const rect = this.container.getBoundingClientRect();
      const x = (e.clientX - rect.left - this.panX) / this.zoom;
      const y = (e.clientY - rect.top - this.panY) / this.zoom;

      const device = window.deviceManager.createDevice(type, x - 40, y - 30);
      if (device) {
        this.renderNode(device);
        window.app?.notify(`${device.label} adicionado`, 'success');
      }
    });
  }

  setupCanvasEvents() {
    // Pan with middle mouse or ctrl+drag
    this.container.addEventListener('mousedown', (e) => {
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        this.panX = e.clientX - this.panStart.x;
        this.panY = e.clientY - this.panStart.y;
        this.applyTransform();
        window.connectionManager?.redraw();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 1 || this.isPanning) {
        this.isPanning = false;
      }
    });

    // Zoom with wheel
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoomBy(delta, e.clientX, e.clientY);
    }, { passive: false });

    // Click on canvas (deselect)
    this.grid.addEventListener('mousedown', (e) => {
      if (e.target === this.grid) {
        this.selectNode(null);
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'v' || e.key === 'V') this.setTool('select');
      if (e.key === 'c' || e.key === 'C') this.setTool('connect');
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedNode) this.deleteNode(this.selectedNode);
      }
      if (e.key === '+' || e.key === '=') this.zoomBy(0.1);
      if (e.key === '-') this.zoomBy(-0.1);
      if (e.key === '0') this.resetView();
      if (e.key === 'Escape') {
        this.connectingFrom = null;
        this.setTool('select');
      }
    });
  }

  zoomBy(delta, cx, cy) {
    const oldZoom = this.zoom;
    this.zoom = Math.max(0.3, Math.min(2.5, this.zoom + delta));

    if (cx && cy) {
      const rect = this.container.getBoundingClientRect();
      const mx = cx - rect.left;
      const my = cy - rect.top;
      this.panX += (mx - this.panX) * (1 - this.zoom / oldZoom);
      this.panY += (my - this.panY) * (1 - this.zoom / oldZoom);
    }

    this.applyTransform();
    document.getElementById('zoomLabel').textContent = `${Math.round(this.zoom * 100)}%`;
    window.connectionManager?.redraw();
  }

  resetView() {
    this.zoom = 1; this.panX = 0; this.panY = 0;
    this.applyTransform();
    document.getElementById('zoomLabel').textContent = '100%';
    window.connectionManager?.redraw();
  }

  applyTransform() {
    this.grid.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    this.grid.style.transformOrigin = '0 0';
  }

  renderNode(device) {
    const def = DEVICE_DEFINITIONS[device.type];
    if (!def) return;

    if (this.dropHint) this.dropHint.style.display = 'none';

    const node = document.createElement('div');
    node.className = 'device-node';
    node.id = `node_${device.id}`;
    node.style.left = device.x + 'px';
    node.style.top = device.y + 'px';
    node.dataset.deviceId = device.id;

    const svgBody = this.getDeviceSVG(device.type, device.id);
    const led = device.powered ? '<div class="device-status-led"></div>' : '<div class="device-status-led off"></div>';

    node.innerHTML = `
      <div class="device-body" style="border-color: ${device.color}22;">
        ${led}
        ${svgBody}
      </div>
      <div class="device-label">${device.label}</div>
    `;

    // Port handles for connect mode
    const portPositions = this.getPortPositions(device.type, device.ports);
    portPositions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = 'port-handle';
      handle.style.left = pos.x + 'px';
      handle.style.top = pos.y + 'px';
      handle.dataset.portId = pos.id;
      handle.dataset.deviceId = device.id;
      handle.title = pos.name;
      node.appendChild(handle);
    });

    this.setupNodeInteraction(node, device);
    this.grid.appendChild(node);
    this.nodes.set(device.id, node);
  }

  getPortPositions(type, ports) {
    const count = Math.min(ports.length, 6);
    const positions = [];
    const w = DEVICE_DEFINITIONS[type].width + 12;
    const h = DEVICE_DEFINITIONS[type].height + 12;
    const spacing = w / (count + 1);

    // Top ports (first half)
    const topCount = Math.ceil(count / 2);
    for (let i = 0; i < topCount && i < ports.length; i++) {
      positions.push({ x: spacing * (i+1) - 5, y: -5, id: ports[i].id, name: ports[i].name });
    }
    // Bottom ports (second half)
    const botCount = Math.floor(count / 2);
    for (let i = 0; i < botCount; i++) {
      const pi = topCount + i;
      if (pi < ports.length) {
        positions.push({ x: spacing * (i+1) - 5, y: h - 5, id: ports[pi].id, name: ports[pi].name });
      }
    }
    return positions;
  }

  getDeviceSVG(type, id) {
    const svgs = {
      router: `<svg width="80" height="50" viewBox="0 0 80 50" fill="none">
        <rect x="2" y="8" width="76" height="32" rx="3" fill="#0d1e38" stroke="#00aaff" stroke-width="1.5"/>
        <rect x="6" y="13" width="64" height="5" rx="1" fill="#0a1628"/>
        <circle cx="14" cy="29" r="3" fill="#00ff88" id="led_${id}_0"/>
        <circle cx="24" cy="29" r="3" fill="#00ff88" id="led_${id}_1"/>
        <circle cx="34" cy="29" r="3" fill="#ffaa00" id="led_${id}_2"/>
        <rect x="46" y="23" width="22" height="12" rx="1" fill="#060f1e" stroke="#00aaff" stroke-width="0.8"/>
        <text x="57" y="31" font-size="5" fill="#00aaff" text-anchor="middle" font-family="monospace">2911</text>
        <rect x="4" y="38" width="10" height="4" rx="1" fill="#060f1e"/>
        <rect x="66" y="38" width="10" height="4" rx="1" fill="#060f1e"/>
      </svg>`,

      'router-edge': `<svg width="90" height="55" viewBox="0 0 90 55" fill="none">
        <rect x="2" y="6" width="86" height="40" rx="3" fill="#0d1e38" stroke="#00aaff" stroke-width="1.5"/>
        <rect x="6" y="11" width="78" height="5" rx="1" fill="#0a1628"/>
        <circle cx="12" cy="28" r="3" fill="#00ff88"/>
        <circle cx="22" cy="28" r="3" fill="#00ff88"/>
        <circle cx="32" cy="28" r="3" fill="#00ff88"/>
        <circle cx="42" cy="28" r="3" fill="#ff4444"/>
        <rect x="54" y="22" width="26" height="12" rx="1" fill="#060f1e" stroke="#00aaff" stroke-width="0.8"/>
        <text x="67" y="30" font-size="5" fill="#00aaff" text-anchor="middle" font-family="monospace">ASR</text>
        <text x="67" y="36" font-size="4" fill="#005588" text-anchor="middle" font-family="monospace">1001</text>
      </svg>`,

      switch: `<svg width="90" height="50" viewBox="0 0 90 50" fill="none">
        <rect x="2" y="10" width="86" height="28" rx="2" fill="#0d1f0d" stroke="#00ff88" stroke-width="1.5"/>
        ${Array.from({length:12}, (_,i) => `<rect x="${6+i*6}" y="15" width="4" height="4" rx="0.5" fill="#020810" stroke="#00ff88" stroke-width="0.4"/><rect x="${6+i*6}" y="21" width="4" height="4" rx="0.5" fill="#020810" stroke="#00ff88" stroke-width="0.4"/>`).join('')}
        <circle cx="80" cy="22" r="2.5" fill="#00ff88"/>
        <circle cx="80" cy="30" r="2.5" fill="#ffaa00"/>
      </svg>`,

      'switch-l3': `<svg width="90" height="55" viewBox="0 0 90 55" fill="none">
        <rect x="2" y="8" width="86" height="36" rx="2" fill="#0a1f0a" stroke="#44ff88" stroke-width="1.5"/>
        ${Array.from({length:12}, (_,i) => `<rect x="${6+i*6}" y="13" width="4" height="4" rx="0.5" fill="#020810" stroke="#44ff88" stroke-width="0.4"/><rect x="${6+i*6}" y="19" width="4" height="4" rx="0.5" fill="#020810" stroke="#44ff88" stroke-width="0.4"/>`).join('')}
        <text x="65" y="36" font-size="7" fill="#44ff88" text-anchor="middle" font-family="monospace">L3</text>
        <circle cx="80" cy="28" r="3" fill="#44ff88"/>
      </svg>`,

      server: `<svg width="80" height="60" viewBox="0 0 80 60" fill="none">
        <rect x="5" y="3" width="70" height="52" rx="2" fill="#0d1f3c" stroke="#4488ff" stroke-width="1.5"/>
        <rect x="10" y="10" width="42" height="7" rx="1" fill="#060f1e" stroke="#4488ff" stroke-width="0.5"/>
        <rect x="10" y="21" width="42" height="7" rx="1" fill="#060f1e" stroke="#4488ff" stroke-width="0.5"/>
        <rect x="10" y="32" width="42" height="7" rx="1" fill="#060f1e" stroke="#4488ff" stroke-width="0.5"/>
        <circle cx="62" cy="14" r="3" fill="#00ff88"/>
        <circle cx="62" cy="25" r="3" fill="#00ff88"/>
        <circle cx="62" cy="36" r="3" fill="#ffaa00"/>
        <rect x="10" y="46" width="58" height="3" rx="1" fill="#060f1e"/>
      </svg>`,

      firewall: `<svg width="85" height="50" viewBox="0 0 85 50" fill="none">
        <rect x="3" y="6" width="79" height="36" rx="3" fill="#200808" stroke="#ff4444" stroke-width="1.5"/>
        <path d="M20 14 L42 8 L64 14 L64 26 Q42 36 20 26 Z" fill="#120404" stroke="#ff6666" stroke-width="1"/>
        <path d="M30 18 L42 13 L54 18 L54 24 Q42 28 30 24 Z" fill="#ff1a00" opacity="0.4"/>
        <circle cx="10" cy="26" r="3" fill="#ff4444"/>
        <circle cx="75" cy="26" r="3" fill="#ff4444"/>
        <text x="42" y="44" font-size="5" fill="#ff4444" text-anchor="middle" font-family="monospace">FIREWALL</text>
      </svg>`,

      ap: `<svg width="65" height="65" viewBox="0 0 65 65" fill="none">
        <circle cx="32" cy="40" r="16" fill="#081a14" stroke="#00ffaa" stroke-width="1.5"/>
        <path d="M20 32 Q32 24 44 32" stroke="#00ffaa" stroke-width="1.5" fill="none" opacity="0.6"/>
        <path d="M14 26 Q32 14 50 26" stroke="#00ffaa" stroke-width="1.5" fill="none" opacity="0.35"/>
        <path d="M8 20 Q32 4 56 20" stroke="#00ffaa" stroke-width="1.5" fill="none" opacity="0.15"/>
        <circle cx="32" cy="40" r="5" fill="#00ffaa"/>
        <circle cx="32" cy="40" r="2" fill="#081a14"/>
        <line x1="32" y1="4" x2="32" y2="20" stroke="#00ffaa" stroke-width="2"/>
      </svg>`,

      rack: `<svg width="60" height="90" viewBox="0 0 60 90" fill="none">
        <rect x="5" y="2" width="50" height="86" rx="2" fill="#0d0d1f" stroke="#8888ff" stroke-width="1.5"/>
        ${Array.from({length:8}, (_,i) => `<rect x="${i%2===0?10:33}" y="${10+i*9}" width="${i%2===0?20:16}" height="6" rx="0.5" fill="${i%2===0?'#071428':'#0d1f0d'}" stroke="${i%2===0?'#4488ff':'#00ff44'}" stroke-width="0.5"/>`).join('')}
        <circle cx="30" cy="80" r="4" fill="#1a1a2a" stroke="#8888ff" stroke-width="0.8"/>
      </svg>`,

      cloud: `<svg width="80" height="60" viewBox="0 0 80 60" fill="none">
        <path d="M16 48 Q8 48 8 38 Q8 28 18 28 Q20 18 32 18 Q37 10 48 12 Q58 10 60 22 Q72 22 72 34 Q72 44 62 44 Q62 48 52 48 Z" fill="#0a1f2a" stroke="#00aaff" stroke-width="1.5"/>
        <circle cx="26" cy="52" r="2.5" fill="#00aaff" opacity="0.5"/>
        <circle cx="40" cy="55" r="2.5" fill="#00aaff" opacity="0.5"/>
        <circle cx="54" cy="52" r="2.5" fill="#00aaff" opacity="0.5"/>
        <line x1="26" y1="47" x2="26" y2="52" stroke="#00aaff" stroke-width="1" opacity="0.5"/>
        <line x1="40" y1="47" x2="40" y2="55" stroke="#00aaff" stroke-width="1" opacity="0.5"/>
        <line x1="54" y1="47" x2="54" y2="52" stroke="#00aaff" stroke-width="1" opacity="0.5"/>
      </svg>`,
    };

    return svgs[type] || `<svg width="60" height="40" viewBox="0 0 60 40"><rect x="2" y="2" width="56" height="36" fill="#0d1e38" stroke="#00aaff" stroke-width="1.5"/></svg>`;
  }

  setupNodeInteraction(node, device) {
    let mouseDownTime = 0;
    let dragStarted = false;

    node.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (e.target.classList.contains('port-handle')) return;

      e.stopPropagation();
      mouseDownTime = Date.now();
      dragStarted = false;

      if (this.currentTool === 'delete') {
        this.deleteNode(device.id);
        return;
      }

      if (this.currentTool === 'select') {
        this.selectNode(device.id);
        const rect = node.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        this.draggingNode = device.id;
        this.dragOffset = {
          x: (e.clientX - containerRect.left - this.panX) / this.zoom - device.x,
          y: (e.clientY - containerRect.top - this.panY) / this.zoom - device.y,
        };
      }
    });

    // Port handle clicks for connections
    node.querySelectorAll('.port-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        if (this.currentTool === 'connect' || this.currentTool === 'select') {
          const portId = handle.dataset.portId;
          const deviceId = handle.dataset.deviceId;
          window.connectionManager?.startConnection(deviceId, portId, handle);
        }
      });
    });

    window.addEventListener('mousemove', (e) => {
      if (this.draggingNode !== device.id) return;
      dragStarted = true;
      const containerRect = this.container.getBoundingClientRect();
      const newX = (e.clientX - containerRect.left - this.panX) / this.zoom - this.dragOffset.x;
      const newY = (e.clientY - containerRect.top - this.panY) / this.zoom - this.dragOffset.y;

      device.x = Math.max(0, newX);
      device.y = Math.max(0, newY);
      node.style.left = device.x + 'px';
      node.style.top = device.y + 'px';
      window.connectionManager?.redraw();
    });

    window.addEventListener('mouseup', (e) => {
      if (this.draggingNode !== device.id) return;
      const elapsed = Date.now() - mouseDownTime;

      if (!dragStarted && elapsed < 300) {
        // Click: open inspector
        window.inspector?.openFor(device.id);
      }

      this.draggingNode = null;
      dragStarted = false;
    });

    // Double-click to open modal
    node.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      window.app?.openDeviceModal(device.id);
    });

    // Right-click context menu
    node.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showContextMenu(e.clientX, e.clientY, device.id);
    });
  }

  showContextMenu(x, y, deviceId) {
    this.removeContextMenu();
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;

    const menu = document.createElement('div');
    menu.className = 'ctx-menu';
    menu.id = 'ctxMenu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.innerHTML = `
      <div class="ctx-item" data-action="open">⚙ Configurar</div>
      <div class="ctx-item" data-action="inspect">🔍 Inspecionar</div>
      <div class="ctx-item" data-action="rename">✏ Renomear</div>
      <div class="ctx-divider"></div>
      <div class="ctx-item" data-action="power">${device.powered ? '⏻ Desligar' : '⏼ Ligar'}</div>
      <div class="ctx-divider"></div>
      <div class="ctx-item danger" data-action="delete">✕ Deletar</div>
    `;

    menu.querySelectorAll('.ctx-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        if (action === 'open') window.app?.openDeviceModal(deviceId);
        else if (action === 'inspect') window.inspector?.openFor(deviceId);
        else if (action === 'rename') this.renameDevice(deviceId);
        else if (action === 'power') this.togglePower(deviceId);
        else if (action === 'delete') this.deleteNode(deviceId);
        this.removeContextMenu();
      });
    });

    document.body.appendChild(menu);
    setTimeout(() => document.addEventListener('click', () => this.removeContextMenu(), { once: true }), 50);
  }

  removeContextMenu() {
    document.getElementById('ctxMenu')?.remove();
  }

  renameDevice(id) {
    const device = window.deviceManager.getDevice(id);
    if (!device) return;
    const newName = prompt('Novo nome:', device.label);
    if (newName && newName.trim()) {
      device.label = newName.trim();
      device.config.hostname = newName.trim();
      const node = document.getElementById(`node_${id}`);
      if (node) {
        const label = node.querySelector('.device-label');
        if (label) label.textContent = newName.trim();
      }
      window.inspector?.refresh(id);
    }
  }

  togglePower(id) {
    const device = window.deviceManager.getDevice(id);
    if (!device) return;
    device.powered = !device.powered;
    const node = document.getElementById(`node_${id}`);
    if (node) {
      const led = node.querySelector('.device-status-led');
      if (led) led.classList.toggle('off', !device.powered);
    }
    // Update port LEDs (simulated)
    Object.keys(device.config.interfaces || {}).forEach(iface => {
      device.config.interfaces[iface].status = device.powered ? 'up' : 'down';
    });
    window.app?.notify(`${device.label} ${device.powered ? 'ligado' : 'desligado'}`, device.powered ? 'success' : 'warn');
    window.connectionManager?.redraw();
  }

  selectNode(id) {
    // Deselect all
    document.querySelectorAll('.device-node.selected').forEach(n => n.classList.remove('selected'));
    this.selectedNode = id;
    if (id) {
      const node = document.getElementById(`node_${id}`);
      if (node) node.classList.add('selected');
    }
  }

  deleteNode(id) {
    const device = window.deviceManager.getDevice(id);
    if (!device) return;
    window.connectionManager?.removeConnectionsForDevice(id);
    window.deviceManager.removeDevice(id);
    document.getElementById(`node_${id}`)?.remove();
    this.nodes.delete(id);
    if (this.selectedNode === id) this.selectNode(null);
    window.inspector?.close();

    // Show hint if canvas empty
    if (window.deviceManager.getAllDevices().length === 0) {
      this.dropHint.style.display = 'flex';
    }
    window.app?.notify(`${device.label} removido`, 'warn');
  }

  clearCanvas() {
    window.deviceManager.getAllDevices().forEach(d => {
      window.connectionManager?.removeConnectionsForDevice(d.id);
      document.getElementById(`node_${d.id}`)?.remove();
    });
    window.deviceManager.devices.clear();
    window.connectionManager?.clearAll();
    this.nodes.clear();
    this.selectedNode = null;
    this.dropHint.style.display = 'flex';
    window.app?.notify('Canvas limpo', 'warn');
  }
}

window.canvasManager = null;
document.addEventListener('DOMContentLoaded', () => {
  window.canvasManager = new CanvasManager();
});

// ===== CONNECTION MANAGER =====
class ConnectionManager {
  constructor() {
    this.connections = [];
    this.tempConnection = null;
    this.connectingFrom = null;
    this.canvas = null;
    this.ctx = null;
    this.animFrame = null;
    this.packets = [];

    document.addEventListener('DOMContentLoaded', () => {
      this.canvas = document.getElementById('connectionCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.setupMouseEvents();
      this.startRenderLoop();
    });
  }

  setupMouseEvents() {
    const container = document.getElementById('canvasContainer');

    container.addEventListener('mousemove', (e) => {
      if (!this.connectingFrom) return;
      const rect = container.getBoundingClientRect();
      this.tempConnection = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      this.redraw();
    });

    container.addEventListener('mouseup', (e) => {
      if (!this.connectingFrom) return;
      // Check if released on a port handle
      const target = e.target;
      if (target.classList.contains('port-handle')) {
        const toDeviceId = target.dataset.deviceId;
        const toPortId = target.dataset.portId;
        if (toDeviceId !== this.connectingFrom.deviceId) {
          this.finishConnection(toDeviceId, toPortId);
          return;
        }
      }
      // Canceled
      this.connectingFrom = null;
      this.tempConnection = null;
      document.querySelectorAll('.port-handle.connecting').forEach(p => p.classList.remove('connecting'));
      this.redraw();
    });
  }

  startConnection(deviceId, portId, handleEl) {
    // If already connecting, try to finish
    if (this.connectingFrom) {
      if (this.connectingFrom.deviceId !== deviceId) {
        this.finishConnection(deviceId, portId);
      } else {
        this.connectingFrom = null;
        this.tempConnection = null;
        document.querySelectorAll('.port-handle.connecting').forEach(p => p.classList.remove('connecting'));
        this.redraw();
      }
      return;
    }

    this.connectingFrom = { deviceId, portId, handleEl };
    handleEl.classList.add('connecting');
    window.app?.notify(`Selecione a porta de destino...`, 'info');
  }

  finishConnection(toDeviceId, toPortId) {
    if (!this.connectingFrom) return;
    const { deviceId: fromDeviceId, portId: fromPortId, handleEl } = this.connectingFrom;

    // Check duplicate
    const exists = this.connections.find(c =>
      (c.from.deviceId === fromDeviceId && c.from.portId === fromPortId) ||
      (c.to.deviceId === toDeviceId && c.to.portId === toPortId)
    );

    if (exists) {
      window.app?.notify('Porta já está em uso!', 'error');
    } else {
      const conn = {
        id: `conn_${Date.now()}`,
        from: { deviceId: fromDeviceId, portId: fromPortId },
        to: { deviceId: toDeviceId, portId: toPortId },
        active: true,
        type: 'ethernet'
      };
      this.connections.push(conn);

      // Update device port status
      this.activatePort(fromDeviceId, fromPortId);
      this.activatePort(toDeviceId, toPortId);

      const fromDev = window.deviceManager.getDevice(fromDeviceId);
      const toDev = window.deviceManager.getDevice(toDeviceId);
      window.app?.notify(`${fromDev?.label} ↔ ${toDev?.label} conectados`, 'success');
    }

    handleEl?.classList.remove('connecting');
    this.connectingFrom = null;
    this.tempConnection = null;
    this.redraw();
  }

  activatePort(deviceId, portId) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;
    const ifaceName = device.ports.find(p => p.id === portId)?.name;
    if (ifaceName && device.config.interfaces?.[ifaceName]) {
      device.config.interfaces[ifaceName].status = 'up';
    }
    // Visual LED update
    const portHandles = document.querySelectorAll(`[data-device-id="${deviceId}"][data-port-id="${portId}"]`);
    portHandles.forEach(h => h.style.background = 'var(--accent-green)');
  }

  removeConnectionsForDevice(deviceId) {
    this.connections = this.connections.filter(c =>
      c.from.deviceId !== deviceId && c.to.deviceId !== deviceId
    );
    this.redraw();
  }

  removeConnection(connId) {
    const conn = this.connections.find(c => c.id === connId);
    if (conn) {
      // Reset ports
      const deactivate = (devId, portId) => {
        const device = window.deviceManager.getDevice(devId);
        if (!device) return;
        const ifaceName = device.ports.find(p => p.id === portId)?.name;
        if (ifaceName && device.config.interfaces?.[ifaceName]) {
          device.config.interfaces[ifaceName].status = 'down';
        }
      };
      deactivate(conn.from.deviceId, conn.from.portId);
      deactivate(conn.to.deviceId, conn.to.portId);
    }
    this.connections = this.connections.filter(c => c.id !== connId);
    this.redraw();
  }

  clearAll() {
    this.connections = [];
    this.packets = [];
    this.tempConnection = null;
    this.connectingFrom = null;
    this.redraw();
  }

  getPortCenter(deviceId, portId) {
    const node = document.getElementById(`node_${deviceId}`);
    const container = document.getElementById('canvasContainer');
    if (!node || !container) return null;

    const handle = node.querySelector(`[data-port-id="${portId}"]`);
    if (handle) {
      const hRect = handle.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      return {
        x: hRect.left + hRect.width / 2 - cRect.left,
        y: hRect.top + hRect.height / 2 - cRect.top
      };
    }

    // Fallback: device center
    const nRect = node.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    return {
      x: nRect.left + nRect.width / 2 - cRect.left,
      y: nRect.top + nRect.height / 2 - cRect.top
    };
  }

  startRenderLoop() {
    const loop = (t) => {
      this.updatePackets(t);
      this.animFrame = requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updatePackets(t) {
    if (this.packets.length === 0) return;
    this.packets = this.packets.filter(p => {
      p.progress += p.speed;
      return p.progress <= 1;
    });
    this.redraw();
  }

  spawnPacket(connId) {
    const conn = this.connections.find(c => c.id === connId);
    if (!conn) return;
    this.packets.push({ connId, progress: 0, speed: 0.015, color: '#00d4ff' });
    this.packets.push({ connId, progress: 0.5, speed: 0.015, color: '#00ff88' });
  }

  simulateAll() {
    this.connections.forEach(c => {
      setTimeout(() => this.spawnPacket(c.id), Math.random() * 1000);
    });
  }

  redraw() {
    if (!this.canvas || !this.ctx) return;
    const w = this.canvas.width = this.canvas.parentElement?.clientWidth || 800;
    const h = this.canvas.height = this.canvas.parentElement?.clientHeight || 600;
    this.ctx.clearRect(0, 0, w, h);

    // Draw connections
    this.connections.forEach(conn => {
      const from = this.getPortCenter(conn.from.deviceId, conn.from.portId);
      const to = this.getPortCenter(conn.to.deviceId, conn.to.portId);
      if (!from || !to) return;

      this.ctx.beginPath();
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      this.ctx.moveTo(from.x, from.y);
      this.ctx.bezierCurveTo(mx, from.y, mx, to.y, to.x, to.y);

      const connColor = conn.active ? '#00aaff' : '#334466';
      this.ctx.strokeStyle = connColor;
      this.ctx.lineWidth = 2;
      this.ctx.shadowBlur = conn.active ? 6 : 0;
      this.ctx.shadowColor = connColor;
      this.ctx.setLineDash([]);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      // Draw connection label on hover/click (connection id stored for later)
      // Endpoint dots
      this.ctx.beginPath();
      this.ctx.arc(from.x, from.y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = '#00aaff';
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(to.x, to.y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = '#00aaff';
      this.ctx.fill();
    });

    // Draw packets
    this.packets.forEach(pkt => {
      const conn = this.connections.find(c => c.id === pkt.connId);
      if (!conn) return;
      const from = this.getPortCenter(conn.from.deviceId, conn.from.portId);
      const to = this.getPortCenter(conn.to.deviceId, conn.to.portId);
      if (!from || !to) return;

      const t = pkt.progress;
      const mx = (from.x + to.x) / 2;
      const bx = cubicBezier(from.x, mx, mx, to.x, t);
      const by = cubicBezier(from.y, from.y, to.y, to.y, t);

      this.ctx.beginPath();
      this.ctx.arc(bx, by, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = pkt.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = pkt.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Draw temp connection (while connecting)
    if (this.connectingFrom && this.tempConnection) {
      const from = this.getPortCenter(this.connectingFrom.deviceId, this.connectingFrom.portId);
      if (from) {
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(this.tempConnection.x, this.tempConnection.y);
        this.ctx.strokeStyle = '#ffcc00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 4]);
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#ffcc00';
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.shadowBlur = 0;
      }
    }
  }
}

function cubicBezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
}

window.connectionManager = new ConnectionManager();

// ===== INSPECTOR PANEL =====
class Inspector {
  constructor() {
    this.panel = document.getElementById('inspectorPanel');
    this.content = document.getElementById('inspectorContent');
    this.titleEl = document.getElementById('inspectorTitle');
    this.currentDeviceId = null;

    document.getElementById('inspectorClose').addEventListener('click', () => this.close());
  }

  openFor(deviceId) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;

    this.currentDeviceId = deviceId;
    this.titleEl.textContent = `${device.label.toUpperCase()} — INSPECTOR`;
    this.render(device);
    this.panel.classList.add('open');
  }

  close() {
    this.panel.classList.remove('open');
    this.currentDeviceId = null;
  }

  refresh(deviceId) {
    if (this.currentDeviceId === deviceId) {
      this.openFor(deviceId);
    }
  }

  render(device) {
    const connections = window.connectionManager.connections.filter(c =>
      c.from.deviceId === device.id || c.to.deviceId === device.id
    );

    const ifaces = device.config.interfaces || {};
    const ifaceKeys = Object.keys(ifaces);

    this.content.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-section-title">DEVICE INFO</div>
        <div class="field-group">
          <label class="field-label">HOSTNAME</label>
          <input class="field-input" id="insp_hostname" value="${device.config.hostname || device.label}" placeholder="hostname"/>
        </div>
        <div class="field-group">
          <label class="field-label">MODEL</label>
          <input class="field-input" value="${device.model}" readonly style="opacity:0.5"/>
        </div>
        <div class="field-group">
          <label class="field-label">STATUS</label>
          <span style="font-family:var(--font-mono);font-size:11px;color:${device.powered ? 'var(--accent-green)' : 'var(--accent-red)'}">
            ${device.powered ? '● ONLINE' : '● OFFLINE'}
          </span>
        </div>
      </div>

      ${ifaceKeys.length > 0 ? `
      <div class="inspector-section">
        <div class="inspector-section-title">INTERFACES</div>
        <div class="interface-list">
          ${ifaceKeys.slice(0, 8).map(name => {
            const iface = ifaces[name];
            const status = iface.status || 'down';
            return `
              <div class="interface-item">
                <div class="iface-led ${status}"></div>
                <span class="iface-name">${name}</span>
                <span class="iface-status">${iface.ip || '—'}</span>
              </div>
            `;
          }).join('')}
          ${ifaceKeys.length > 8 ? `<div style="font-size:9px;color:var(--text-dim);padding:4px;font-family:var(--font-mono)">+${ifaceKeys.length - 8} mais interfaces...</div>` : ''}
        </div>
      </div>` : ''}

      <div class="inspector-section">
        <div class="inspector-section-title">CONNECTIONS</div>
        ${connections.length === 0
          ? `<div style="font-size:10px;color:var(--text-dim);font-family:var(--font-mono)">Nenhuma conexão</div>`
          : connections.map(c => {
              const other = c.from.deviceId === device.id ? c.to : c.from;
              const otherDev = window.deviceManager.getDevice(other.deviceId);
              return `
                <div class="interface-item" style="margin-bottom:3px;">
                  <div class="iface-led up"></div>
                  <span class="iface-name" style="font-size:9px;">${otherDev?.label || 'Unknown'}</span>
                  <button onclick="window.connectionManager.removeConnection('${c.id}');window.inspector.refresh('${device.id}')"
                    style="background:none;border:none;color:var(--accent-red);cursor:pointer;font-size:10px;padding:0 2px;">✕</button>
                </div>
              `;
            }).join('')
        }
      </div>

      <button class="btn-apply" id="insp_apply">APLICAR</button>
      <button class="btn-apply btn-danger" style="margin-top:6px;" onclick="window.app?.openDeviceModal('${device.id}')">⚙ CONFIG AVANÇADO</button>
    `;

    document.getElementById('insp_apply')?.addEventListener('click', () => {
      const hostname = document.getElementById('insp_hostname')?.value.trim();
      if (hostname) {
        device.config.hostname = hostname;
        device.label = hostname;
        const node = document.getElementById(`node_${device.id}`);
        if (node) {
          const label = node.querySelector('.device-label');
          if (label) label.textContent = hostname;
        }
        window.app?.notify('Configurações aplicadas', 'success');
      }
    });
  }
}

window.inspector = null;
document.addEventListener('DOMContentLoaded', () => {
  window.inspector = new Inspector();
});

// ===== TERMINAL EMULATOR =====
class Terminal {
  constructor(device) {
    this.device = device;
    this.history = [];
    this.historyIndex = -1;
    this.mode = 'user'; // user | enable | config | interface | router-ospf
    this.currentInterface = null;
    this.commandHistory = [];
    this.output = [];
    this.initBoot();
  }

  initBoot() {
    const hostname = this.device.config.hostname || 'Router';
    this.print(`\nCisco IOS Software, Version 15.4(3)M2`, 'muted');
    this.print(`Technical Support: http://www.cisco.com/techsupport`, 'muted');
    this.print(`Copyright (c) 1986-2024 by Cisco Systems, Inc.`, 'muted');
    this.print(`Compiled Wed 26-Jun-24 05:44`, 'muted');
    this.print(``, 'muted');
    this.print(`Press RETURN to get started.`, 'info');
    this.print(``, '');
    this.print(`${hostname}>`, 'cmd');
  }

  print(text, cls = '') {
    this.output.push({ text, cls });
  }

  getPrompt() {
    const h = this.device.config.hostname || 'Router';
    if (this.mode === 'user') return `${h}>`;
    if (this.mode === 'enable') return `${h}#`;
    if (this.mode === 'config') return `${h}(config)#`;
    if (this.mode === 'interface') return `${h}(config-if)#`;
    if (this.mode === 'router-ospf') return `${h}(config-router)#`;
    return `${h}#`;
  }

  execute(cmd) {
    const raw = cmd.trim();
    this.commandHistory.unshift(raw);
    if (this.commandHistory.length > 50) this.commandHistory.pop();

    this.print(`${this.getPrompt()} ${raw}`, 'cmd');

    if (!raw) return;
    this.processCommand(raw.toLowerCase(), raw);
  }

  processCommand(cmd, raw) {
    const parts = cmd.split(/\s+/);
    const host = this.device.config.hostname || 'Router';

    // Universal commands
    if (cmd === 'exit' || cmd === 'end') {
      if (this.mode === 'interface') { this.mode = 'config'; return; }
      if (this.mode === 'config') { this.mode = 'enable'; return; }
      if (this.mode === 'router-ospf') { this.mode = 'config'; return; }
      if (this.mode === 'enable') { this.mode = 'user'; return; }
      return;
    }

    if (cmd === '?' || cmd === 'help') {
      this.showHelp();
      return;
    }

    if (cmd === 'clear') {
      this.output = [];
      return;
    }

    // USER mode
    if (this.mode === 'user') {
      if (cmd === 'enable') {
        const secret = this.device.config.enableSecret || 'class';
        const pwd = prompt('Password:');
        if (pwd === secret || !pwd) {
          this.mode = 'enable';
          this.print(``, '');
        } else {
          this.print(`% Access denied`, 'error');
        }
        return;
      }
      if (cmd.startsWith('show version')) { this.showVersion(); return; }
      if (cmd.startsWith('ping')) { this.doPing(parts.slice(1).join(' ')); return; }
      this.print(`% Unknown command, enter 'help' for commands`, 'error');
      return;
    }

    // ENABLE mode
    if (this.mode === 'enable') {
      if (cmd === 'configure terminal' || cmd === 'conf t') {
        this.mode = 'config';
        this.print(`Enter configuration commands, one per line.  End with CNTL/Z.`, 'info');
        return;
      }
      if (cmd.startsWith('show')) { this.processShow(cmd, parts); return; }
      if (cmd.startsWith('ping')) { this.doPing(parts.slice(1).join(' ')); return; }
      if (cmd.startsWith('traceroute')) { this.doTraceroute(parts.slice(1).join(' ')); return; }
      if (cmd === 'reload') { this.doReload(); return; }
      if (cmd === 'write' || cmd === 'write memory' || cmd === 'wr') {
        this.print(`Building configuration...`, 'info');
        this.print(`[OK]`, 'info');
        return;
      }
      if (cmd === 'copy running-config startup-config' || cmd === 'copy run start') {
        this.print(`Destination filename [startup-config]? `, 'info');
        this.print(`Building configuration...`, 'info');
        this.print(`[OK]`, 'info');
        return;
      }
      if (cmd === 'disable') { this.mode = 'user'; return; }
      this.print(`% Unknown command`, 'error');
      return;
    }

    // CONFIG mode
    if (this.mode === 'config') {
      if (parts[0] === 'hostname') {
        const newName = parts[1];
        if (newName) {
          this.device.config.hostname = newName;
          this.device.label = newName;
          const node = document.getElementById(`node_${this.device.id}`);
          if (node) node.querySelector('.device-label').textContent = newName;
          window.inspector?.refresh(this.device.id);
        }
        return;
      }
      if (parts[0] === 'interface' || parts[0] === 'int') {
        const ifaceName = raw.split(/\s+/).slice(1).join(' ');
        const normalized = this.normalizeIface(ifaceName);
        if (normalized && this.device.config.interfaces) {
          const key = Object.keys(this.device.config.interfaces).find(k =>
            k.toLowerCase().replace(/\s/g,'') === normalized.toLowerCase().replace(/\s/g,'')
          );
          if (key) {
            this.currentInterface = key;
            this.mode = 'interface';
          } else {
            // Create interface
            this.device.config.interfaces[normalized] = { ip: '', mask: '255.255.255.0', status: 'down' };
            this.currentInterface = normalized;
            this.mode = 'interface';
          }
        } else {
          this.print(`% Invalid interface`, 'error');
        }
        return;
      }
      if (parts[0] === 'ip' && parts[1] === 'route') {
        const dest = parts[2], mask = parts[3], nexthop = parts[4];
        if (dest && mask && nexthop) {
          if (!this.device.config.routing) this.device.config.routing = { static: [] };
          if (!this.device.config.routing.static) this.device.config.routing.static = [];
          this.device.config.routing.static.push({ dest, mask, nexthop });
          this.print(`Static route added: ${dest} ${mask} via ${nexthop}`, 'info');
        } else {
          this.print(`% Incomplete command`, 'error');
        }
        return;
      }
      if (parts[0] === 'router' && parts[1] === 'ospf') {
        const pid = parts[2] || '1';
        this.mode = 'router-ospf';
        if (!this.device.config.routing) this.device.config.routing = {};
        this.device.config.routing.ospf = true;
        this.device.config.routing.ospfPid = pid;
        this.print(`OSPF process ${pid} started`, 'info');
        return;
      }
      if (parts[0] === 'enable' && parts[1] === 'secret') {
        this.device.config.enableSecret = parts[2] || 'cisco';
        this.print(`Enable secret configured`, 'info');
        return;
      }
      if (parts[0] === 'no' && parts[1] === 'ip' && parts[2] === 'domain-lookup') {
        this.print(`Domain lookup disabled`, 'info');
        return;
      }
      if (parts[0] === 'banner' && parts[1] === 'motd') {
        this.print(`Banner MOTD configured`, 'info');
        return;
      }
      if (parts[0] === 'vlan' && this.device.config.vlans) {
        const vid = parts[1];
        if (vid) {
          const name = parts[2] === 'name' ? parts[3] : `VLAN${vid}`;
          this.device.config.vlans[vid] = name;
          this.print(`VLAN ${vid} created`, 'info');
        }
        return;
      }
      if (parts[0] === 'ip' && parts[1] === 'routing') {
        if (this.device.config.ipRouting !== undefined) {
          this.device.config.ipRouting = true;
          this.print(`IP routing enabled`, 'info');
        }
        return;
      }
      this.print(`% Unknown configuration command`, 'error');
      return;
    }

    // INTERFACE mode
    if (this.mode === 'interface') {
      const iface = this.device.config.interfaces[this.currentInterface];
      if (!iface) return;

      if (parts[0] === 'ip' && parts[1] === 'address') {
        const ip = parts[2], mask = parts[3];
        if (ip && mask && this.validateIP(ip) && this.validateIP(mask)) {
          iface.ip = ip;
          iface.mask = mask;
          this.print(`IP address ${ip} ${mask} assigned to ${this.currentInterface}`, 'info');
          window.inspector?.refresh(this.device.id);
        } else {
          this.print(`% Invalid IP address`, 'error');
        }
        return;
      }
      if (parts[0] === 'no' && parts[1] === 'shutdown') {
        iface.status = 'up';
        this.print(`%LINK-5-CHANGED: Interface ${this.currentInterface}, changed state to up`, 'info');
        this.print(`%LINEPROTO-5-UPDOWN: Line protocol on Interface ${this.currentInterface}, changed state to up`, 'info');
        window.inspector?.refresh(this.device.id);
        return;
      }
      if (parts[0] === 'shutdown') {
        iface.status = 'admin-down';
        this.print(`%LINK-5-CHANGED: Interface ${this.currentInterface}, changed state to administratively down`, 'warn');
        window.inspector?.refresh(this.device.id);
        return;
      }
      if (parts[0] === 'description') {
        iface.description = raw.split(/\s+/).slice(1).join(' ');
        return;
      }
      if (parts[0] === 'duplex') { iface.duplex = parts[1]; return; }
      if (parts[0] === 'speed') { iface.speed = parts[1]; return; }
      if (parts[0] === 'switchport' && parts[1] === 'mode') {
        if (iface.mode !== undefined) iface.mode = parts[2] || 'access';
        return;
      }
      if (parts[0] === 'switchport' && parts[1] === 'access' && parts[2] === 'vlan') {
        if (iface.vlan !== undefined) {
          iface.vlan = parseInt(parts[3]) || 1;
          this.print(`VLAN ${iface.vlan} assigned to ${this.currentInterface}`, 'info');
        }
        return;
      }
      if (parts[0] === 'nameif') {
        if (iface.nameif !== undefined) iface.nameif = parts[1];
        return;
      }
      if (parts[0] === 'security-level') {
        if (iface.securityLevel !== undefined) iface.securityLevel = parseInt(parts[1]) || 0;
        return;
      }
      this.print(`% Unknown interface command`, 'error');
      return;
    }

    // ROUTER-OSPF mode
    if (this.mode === 'router-ospf') {
      if (parts[0] === 'network') {
        this.print(`OSPF network statement added: ${raw.replace('network','')}`, 'info');
        return;
      }
      if (parts[0] === 'router-id') {
        this.device.config.routing.ospfRouterId = parts[1];
        this.print(`OSPF Router ID: ${parts[1]}`, 'info');
        return;
      }
      this.print(`% Unknown OSPF command`, 'error');
      return;
    }

    this.print(`% Unknown command`, 'error');
  }

  processShow(cmd, parts) {
    if (parts[1] === 'version') { this.showVersion(); return; }
    if (parts[1] === 'ip' && parts[2] === 'interface') { this.showIPInterface(parts[3] === 'brief'); return; }
    if (parts[1] === 'interfaces') { this.showInterfaces(); return; }
    if (parts[1] === 'running-config' || (parts[1] === 'run')) { this.showRunningConfig(); return; }
    if (parts[1] === 'ip' && parts[2] === 'route') { this.showIPRoute(); return; }
    if (parts[1] === 'vlan') { this.showVLAN(); return; }
    if (parts[1] === 'cdp' && parts[2] === 'neighbors') { this.showCDP(); return; }
    if (parts[1] === 'clock') { this.print(`*${new Date().toLocaleString()} UTC`, 'info'); return; }
    this.print(`% Unknown show command`, 'error');
  }

  showVersion() {
    const h = this.device.config.hostname;
    this.print(`Cisco IOS Software, Version 15.4(3)M2`, 'info');
    this.print(`Technical Support: http://www.cisco.com/techsupport`, 'info');
    this.print(``, '');
    this.print(`cisco ${this.device.model} (revision 1.0) with 2097152K/786432K bytes of memory.`, 'info');
    this.print(`Processor board ID FCZ182080NR`, 'info');
    this.print(`3 Gigabit Ethernet interfaces`, 'info');
    this.print(`1 Virtual Private Network (VPN) Module`, 'info');
    this.print(`DRAM configuration is 72 bits wide with parity enabled.`, 'info');
    this.print(`255K bytes of non-volatile configuration memory.`, 'info');
    this.print(`256MB bytes of ATA System CompactFlash 0 (Read/Write)`, 'info');
    this.print(``, '');
    this.print(`Configuration register is 0x2102`, 'info');
  }

  showIPInterface(brief) {
    const ifaces = this.device.config.interfaces || {};
    if (brief) {
      this.print(`Interface              IP-Address      OK? Method Status                Protocol`, 'info');
      Object.entries(ifaces).forEach(([name, iface]) => {
        const ip = iface.ip || 'unassigned';
        const ok = iface.ip ? 'YES' : 'NO ';
        const status = iface.status === 'up' ? 'up' : iface.status === 'admin-down' ? 'administratively down' : 'down';
        const proto = iface.status === 'up' ? 'up' : 'down';
        this.print(`${name.padEnd(23)}${ip.padEnd(16)}${ok}  manual ${status.padEnd(22)}${proto}`, '');
      });
    } else {
      Object.entries(ifaces).forEach(([name, iface]) => {
        this.print(`${name} is ${iface.status || 'down'}, line protocol is ${iface.status === 'up' ? 'up' : 'down'}`, '');
        if (iface.ip) this.print(`  Internet address is ${iface.ip}/${this.maskToCIDR(iface.mask)}`, '');
        if (iface.description) this.print(`  Description: ${iface.description}`, '');
        this.print(`  MTU 1500 bytes, BW 100000 Kbit/sec`, 'muted');
      });
    }
  }

  showInterfaces() {
    const ifaces = this.device.config.interfaces || {};
    Object.entries(ifaces).forEach(([name, iface]) => {
      this.print(`${name} is ${iface.status || 'down'}, line protocol is ${iface.status === 'up' ? 'up' : 'down'}`, '');
      this.print(`  Hardware is iGbE, address is aabb.cc00.${Math.floor(Math.random()*9999).toString(16).padStart(4,'0')}`, 'muted');
      if (iface.ip) this.print(`  Internet address is ${iface.ip}`, '');
      this.print(`  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec`, 'muted');
      this.print(`  5 minute input rate 0 bits/sec, 0 packets/sec`, 'muted');
      this.print(`  5 minute output rate 0 bits/sec, 0 packets/sec`, 'muted');
      this.print(``, '');
    });
  }

  showRunningConfig() {
    const c = this.device.config;
    this.print(`Building configuration...`, 'info');
    this.print(``, '');
    this.print(`Current configuration : 1234 bytes`, 'info');
    this.print(`!`, 'muted');
    this.print(`version 15.4`, 'muted');
    this.print(`service timestamps debug datetime msec`, 'muted');
    this.print(`service timestamps log datetime msec`, 'muted');
    this.print(`no service password-encryption`, 'muted');
    this.print(`!`, 'muted');
    this.print(`hostname ${c.hostname}`, '');
    this.print(`!`, 'muted');
    this.print(`enable secret ${c.enableSecret || '5 $1$mERr$MqVhiEFCM7CMmFWWkRBbz/'}`, '');
    this.print(`!`, 'muted');
    Object.entries(c.interfaces || {}).forEach(([name, iface]) => {
      this.print(`!`, 'muted');
      this.print(`interface ${name}`, '');
      if (iface.description) this.print(` description ${iface.description}`, '');
      if (iface.ip) this.print(` ip address ${iface.ip} ${iface.mask}`, '');
      if (iface.status !== 'up') this.print(` shutdown`, '');
      if (iface.mode) this.print(` switchport mode ${iface.mode}`, '');
      if (iface.vlan && iface.mode === 'access') this.print(` switchport access vlan ${iface.vlan}`, '');
    });
    if (c.routing?.static?.length) {
      this.print(`!`, 'muted');
      c.routing.static.forEach(r => {
        this.print(`ip route ${r.dest} ${r.mask} ${r.nexthop}`, '');
      });
    }
    this.print(`!`, 'muted');
    this.print(`end`, 'info');
  }

  showIPRoute() {
    const routes = this.device.config.routing?.static || [];
    this.print(`Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP`, 'muted');
    this.print(`       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area`, 'muted');
    this.print(``, '');
    if (routes.length === 0) {
      this.print(`Gateway of last resort is not set`, 'info');
    }
    routes.forEach(r => {
      this.print(`S    ${r.dest}/${this.maskToCIDR(r.mask)} [1/0] via ${r.nexthop}`, '');
    });
    // Connected routes
    Object.entries(this.device.config.interfaces || {}).forEach(([name, iface]) => {
      if (iface.ip && iface.status === 'up') {
        this.print(`C    ${iface.ip}/${this.maskToCIDR(iface.mask)} is directly connected, ${name}`, '');
      }
    });
  }

  showVLAN() {
    const vlans = this.device.config.vlans || {};
    if (Object.keys(vlans).length === 0) {
      this.print(`No VLANs configured`, 'info');
      return;
    }
    this.print(`VLAN Name                             Status    Ports`, 'info');
    this.print(`---- -------------------------------- --------- -------------------------------`, 'muted');
    Object.entries(vlans).forEach(([id, name]) => {
      this.print(`${String(id).padEnd(5)}${name.padEnd(33)}active`, '');
    });
  }

  showCDP() {
    const connections = window.connectionManager.connections.filter(c =>
      c.from.deviceId === this.device.id || c.to.deviceId === this.device.id
    );
    this.print(`Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge`, 'muted');
    this.print(`                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone`, 'muted');
    this.print(``, '');
    this.print(`Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID`, 'info');
    connections.forEach(c => {
      const otherId = c.from.deviceId === this.device.id ? c.to.deviceId : c.from.deviceId;
      const other = window.deviceManager.getDevice(otherId);
      if (other) {
        const localPort = c.from.deviceId === this.device.id ? c.from.portId : c.to.portId;
        const remotePort = c.from.deviceId === this.device.id ? c.to.portId : c.from.portId;
        this.print(`${other.config.hostname.padEnd(17)}${localPort.padEnd(18)}170        R S     ${other.model.padEnd(10)}${remotePort}`, '');
      }
    });
  }

  doPing(target) {
    if (!target) { this.print(`% Incomplete command: ping <ip>`, 'error'); return; }
    this.print(`Type escape sequence to abort.`, 'info');
    this.print(`Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:`, 'info');

    // Simulate ping (random success based on whether target looks valid)
    const isValid = /^\d+\.\d+\.\d+\.\d+$/.test(target) || target === 'localhost';
    const results = isValid ? '!!!!!' : '.....';
    this.print(results, isValid ? 'info' : 'error');
    this.print(`Success rate is ${isValid ? '100' : '0'} percent (${isValid ? '5/5' : '0/5'}), round-trip min/avg/max = ${isValid ? '1/2/4' : '0/0/0'} ms`, 'info');
  }

  doTraceroute(target) {
    if (!target) { this.print(`% Incomplete command`, 'error'); return; }
    this.print(`Type escape sequence to abort.`, 'info');
    this.print(`Tracing the route to ${target}:`, 'info');
    this.print(`1   192.168.1.1  2 msec 1 msec 2 msec`, '');
    this.print(`2   10.0.0.1     4 msec 3 msec 4 msec`, '');
    this.print(`3   ${target}   8 msec 7 msec 9 msec`, '');
  }

  doReload() {
    this.print(`Proceed with reload? [confirm]`, 'warn');
    this.print(`System Bootstrap, Version 15.4(3r)M2`, 'muted');
    this.print(`Initializing hardware...`, 'muted');
    setTimeout(() => {
      this.output = [];
      this.mode = 'user';
      this.initBoot();
      this.renderCallback?.();
    }, 1500);
  }

  showHelp() {
    const cmds = {
      user: ['enable', 'show version', 'ping <ip>', 'exit'],
      enable: ['configure terminal', 'show version', 'show running-config', 'show ip interface brief', 'show interfaces', 'show ip route', 'show vlan', 'show cdp neighbors', 'show clock', 'ping <ip>', 'traceroute <ip>', 'copy run start', 'write memory', 'reload', 'disable'],
      config: ['hostname <name>', 'interface <type><slot/port>', 'ip route <dest> <mask> <nexthop>', 'router ospf <pid>', 'enable secret <pass>', 'vlan <id>', 'ip routing', 'no ip domain-lookup', 'exit', 'end'],
      interface: ['ip address <ip> <mask>', 'no shutdown', 'shutdown', 'description <text>', 'duplex <full|half|auto>', 'speed <10|100|1000|auto>', 'switchport mode <access|trunk>', 'switchport access vlan <id>', 'exit', 'end'],
    };
    const available = cmds[this.mode] || cmds['enable'];
    this.print(`Available commands:`, 'info');
    available.forEach(c => this.print(`  ${c}`, 'muted'));
  }

  normalizeIface(name) {
    const n = name.toLowerCase();
    if (n.match(/^gi?\s*\d/)) {
      const m = n.match(/(\d[\/\d]*)/);
      const full = n.startsWith('gi') ? 'GigabitEthernet' : 'GigabitEthernet';
      return m ? `Gi${m[1]}` : null;
    }
    if (n.match(/^fa?\s*\d/)) {
      const m = n.match(/(\d[\/\d]*)/);
      return m ? `Fa${m[1]}` : null;
    }
    if (n.match(/^se?\s*\d/)) {
      const m = n.match(/(\d[\/\d]*)/);
      return m ? `Se${m[1]}` : null;
    }
    if (n.match(/^te\s*\d/)) {
      const m = n.match(/(\d[\/\d]*)/);
      return m ? `Te${m[1]}` : null;
    }
    if (n.match(/^eth\d/)) {
      const m = n.match(/(\d+)/);
      return m ? `eth${m[1]}` : null;
    }
    return name;
  }

  validateIP(ip) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && ip.split('.').every(o => parseInt(o) <= 255);
  }

  maskToCIDR(mask) {
    if (!mask) return '24';
    const parts = mask.split('.').map(Number);
    let cidr = 0;
    parts.forEach(p => { while (p > 0) { cidr += p & 1; p >>= 1; } });
    return cidr;
  }
}

window.Terminal = Terminal;

// ===== MAIN APP =====
class App {
  constructor() {
    this.terminals = new Map(); // deviceId -> Terminal
    this.activeModal = null;
    this.activeTab = 'visual';
    this.init();
  }

  init() {
    // Sidebar drag setup
    document.querySelectorAll('.component-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('device-type', item.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
      });
    });

    // Header buttons
    document.getElementById('btnClearCanvas').addEventListener('click', () => {
      if (confirm('Limpar todos os dispositivos?')) {
        window.canvasManager.clearCanvas();
      }
    });

    document.getElementById('btnSaveTopology').addEventListener('click', () => {
      this.saveTopology();
    });

    document.getElementById('btnSimulate').addEventListener('click', () => {
      this.simulate();
    });

    // Modal controls
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modalOverlay')) this.closeModal();
    });

    // Tab buttons
    document.getElementById('modalTabs').addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      }
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  notify(message, type = 'info') {
    const el = document.getElementById('notification');
    el.textContent = message;
    el.className = `notification show ${type}`;
    clearTimeout(this._notifyTimer);
    this._notifyTimer = setTimeout(() => el.classList.remove('show'), 3000);
    document.getElementById('statusText').textContent = message.toUpperCase().substring(0, 20);
  }

  openDeviceModal(deviceId) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;

    this.activeModal = deviceId;
    this.activeTab = 'visual';

    document.getElementById('modalDeviceIcon').textContent = device.icon;
    document.getElementById('modalTitle').textContent = device.label;
    document.getElementById('modalSubtitle').textContent = device.model;

    // Reset tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-tab="visual"]').classList.add('active');

    // Customize tabs per device type
    const tabsEl = document.getElementById('modalTabs');
    if (device.type === 'rack') {
      tabsEl.innerHTML = '<button class="tab-btn active" data-tab="visual">VISUAL</button><button class="tab-btn" data-tab="config">CONFIG</button>';
    } else if (device.type === 'cloud') {
      tabsEl.innerHTML = '<button class="tab-btn active" data-tab="visual">VISUAL</button><button class="tab-btn" data-tab="config">CONFIG</button>';
    } else {
      tabsEl.innerHTML = '<button class="tab-btn active" data-tab="visual">VISUAL</button><button class="tab-btn" data-tab="config">CONFIG</button><button class="tab-btn" data-tab="interfaces">INTERFACES</button><button class="tab-btn" data-tab="terminal">TERMINAL</button>';
    }

    this.renderTab('visual', device);
    document.getElementById('modalOverlay').classList.add('open');

    // Re-bind tab buttons
    document.getElementById('modalTabs').querySelectorAll('.tab-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this.switchTab(b.dataset.tab);
      });
    });
  }

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    this.activeModal = null;
  }

  switchTab(tab) {
    if (!this.activeModal) return;
    const device = window.deviceManager.getDevice(this.activeModal);
    if (!device) return;
    this.activeTab = tab;
    this.renderTab(tab, device);
  }

  renderTab(tab, device) {
    const body = document.getElementById('modalBody');

    if (tab === 'visual') {
      body.innerHTML = this.renderVisual(device);
      this.attachVisualEvents(device);
    } else if (tab === 'config') {
      body.innerHTML = this.renderConfig(device);
      this.attachConfigEvents(device);
    } else if (tab === 'interfaces') {
      body.innerHTML = this.renderInterfaces(device);
      this.attachInterfaceEvents(device);
    } else if (tab === 'terminal') {
      body.innerHTML = this.renderTerminal(device);
      this.attachTerminalEvents(device);
    }
  }

  renderVisual(device) {
    const powered = device.powered;
    
    if (device.type === 'router' || device.type === 'router-edge') {
      const ifaces = device.config.interfaces || {};
      const portCount = Object.keys(ifaces).length;
      return `
        <div class="device-visual">
          <div class="device-3d-view">
            <div class="router-chassis">
              <div class="chassis-top-strip"></div>
              <div class="chassis-ports-row">
                ${Object.entries(ifaces).slice(0, 6).map(([name, iface]) => `
                  <div class="chassis-port" title="${name}" onclick="window.app.quickToggleInterface('${device.id}','${name}')">
                    <div class="port-body">
                      <div class="port-led ${iface.status === 'up' ? 'green' : iface.status === 'admin-down' ? 'off' : 'off'}"></div>
                    </div>
                    <span class="port-label">${name.replace('GigabitEthernet','Gi').replace('FastEthernet','Fa').replace('Serial','Se')}</span>
                  </div>
                `).join('')}
                <div style="flex:1"></div>
                <div class="chassis-port" title="Power">
                  <div class="port-body" style="border-color:${powered ? '#00ff88' : '#ff4444'}">
                    <div class="port-led ${powered ? 'green' : 'off'}"></div>
                  </div>
                  <span class="port-label">PWR</span>
                </div>
              </div>
              <div class="chassis-controls">
                <div class="chassis-display" id="chassisDisplay_${device.id}">
                  ${device.config.hostname}#
                </div>
                <div class="chassis-btn" onclick="window.canvasManager.togglePower('${device.id}')" title="Power">⏻</div>
                <div class="chassis-btn" title="Reset" onclick="window.app.resetDevice('${device.id}')">↺</div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;width:100%">
            <div class="config-section" style="flex:1">
              <div class="config-section-title">STATUS RÁPIDO</div>
              <div style="display:flex;flex-direction:column;gap:6px;font-family:var(--font-mono);font-size:11px;">
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">Hostname:</span><span>${device.config.hostname}</span></div>
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">Model:</span><span>${device.model}</span></div>
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">Status:</span><span style="color:${powered ? 'var(--accent-green)' : 'var(--accent-red)'}">${powered ? 'ONLINE' : 'OFFLINE'}</span></div>
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">Interfaces:</span><span>${portCount}</span></div>
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">Conexões:</span><span>${window.connectionManager.connections.filter(c=>c.from.deviceId===device.id||c.to.deviceId===device.id).length}</span></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (device.type === 'switch' || device.type === 'switch-l3') {
      const ifaces = device.config.interfaces || {};
      const ports = Object.entries(ifaces).filter(([n]) => n.startsWith('Fa'));
      const uplinks = Object.entries(ifaces).filter(([n]) => n.startsWith('Gi'));
      return `
        <div class="device-visual">
          <div class="device-3d-view">
            <div class="switch-chassis" style="width:100%;">
              <div class="switch-ports-grid" style="grid-template-columns:repeat(12,1fr);gap:3px;margin-bottom:8px;">
                ${ports.slice(0,24).map(([name, iface]) => `
                  <div class="switch-port" title="${name}" onclick="window.app.quickToggleInterface('${device.id}','${name}')">
                    <div class="switch-port-body">
                      <div class="switch-port-led-top ${iface.status === 'up' ? 'on' : 'off'}"></div>
                      <div class="switch-port-led-bot ${iface.vlan > 1 ? 'on' : 'off'}" style="background:${iface.vlan > 1 ? 'var(--accent-yellow)' : 'var(--text-dim)'}"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid #0d1f0d;">
                <div class="switch-uplink-group">
                  ${uplinks.map(([name, iface]) => `
                    <div class="chassis-port" title="${name}" onclick="window.app.quickToggleInterface('${device.id}','${name}')">
                      <div class="port-body" style="width:20px;height:16px;">
                        <div class="port-led ${iface.status === 'up' ? 'green' : 'off'}"></div>
                      </div>
                      <span class="port-label">${name}</span>
                    </div>
                  `).join('')}
                </div>
                <div class="chassis-btn" onclick="window.canvasManager.togglePower('${device.id}')" title="Power" style="margin-right:4px;">⏻</div>
              </div>
            </div>
          </div>
          <div class="config-section" style="width:100%">
            <div class="config-section-title">STATUS</div>
            <div style="font-family:var(--font-mono);font-size:11px;display:flex;flex-direction:column;gap:4px;">
              <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">Hostname:</span><span>${device.config.hostname}</span></div>
              <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">Ports Up:</span><span style="color:var(--accent-green)">${Object.values(ifaces).filter(i=>i.status==='up').length} / ${Object.keys(ifaces).length}</span></div>
              <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">VLANs:</span><span>${Object.keys(device.config.vlans||{}).length}</span></div>
              <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">STP:</span><span style="color:${device.config.spanningTree ? 'var(--accent-green)' : 'var(--text-dim)'}">${device.config.spanningTree ? 'ENABLED' : 'DISABLED'}</span></div>
            </div>
          </div>
        </div>
      `;
    }

    if (device.type === 'server') {
      const ifaces = device.config.interfaces || {};
      const services = device.config.services || {};
      return `
        <div class="device-visual">
          <div class="device-3d-view">
            <div class="router-chassis" style="background:linear-gradient(180deg,#1a2a4a 0%,#0a1530 100%);border-color:#2a4488;">
              <div class="chassis-top-strip" style="background:linear-gradient(90deg,#0d1f35 0%,#1a3060 50%,#0d1f35 100%)"></div>
              <div class="chassis-ports-row">
                ${Object.entries(ifaces).map(([name, iface]) => `
                  <div class="chassis-port" title="${name}">
                    <div class="port-body" style="border-color:#2a4488">
                      <div class="port-led ${iface.status === 'up' ? 'green' : 'off'}"></div>
                    </div>
                    <span class="port-label">${name}</span>
                  </div>
                `).join('')}
              </div>
              <div class="chassis-controls">
                <div class="chassis-display" style="color:#4488ff;text-shadow:0 0 4px #4488ff">${device.config.hostname}: ${device.config.os || 'Linux'}</div>
                <div class="chassis-btn" onclick="window.canvasManager.togglePower('${device.id}')">⏻</div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:12px;width:100%;flex-wrap:wrap;">
            <div class="config-section" style="flex:1">
              <div class="config-section-title">HARDWARE</div>
              <div style="font-family:var(--font-mono);font-size:11px;display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">OS:</span><span>${device.config.os}</span></div>
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">CPU:</span><span>${device.config.cpu}</span></div>
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary)">RAM:</span><span>${device.config.ram}</span></div>
              </div>
            </div>
            <div class="config-section" style="flex:1">
              <div class="config-section-title">SERVIÇOS</div>
              <div style="font-family:var(--font-mono);font-size:11px;display:flex;flex-direction:column;gap:4px;">
                ${Object.entries(services).map(([svc, enabled]) => `
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:var(--text-secondary)">${svc.toUpperCase()}:</span>
                    <label style="cursor:pointer;display:flex;align-items:center;gap:5px;">
                      <input type="checkbox" ${enabled ? 'checked' : ''} 
                        onchange="window.app.toggleService('${device.id}','${svc}',this.checked)"
                        style="accent-color:var(--accent-green)"/>
                      <span style="color:${enabled ? 'var(--accent-green)' : 'var(--text-dim)'}">${enabled ? 'ON' : 'OFF'}</span>
                    </label>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (device.type === 'firewall') {
      const ifaces = device.config.interfaces || {};
      return `
        <div class="device-visual">
          <div class="device-3d-view" style="background:linear-gradient(135deg,#100202 0%,#200505 100%);">
            <div class="router-chassis" style="background:linear-gradient(180deg,#2a0808 0%,#150404 100%);border-color:#882222;">
              <div class="chassis-top-strip" style="background:linear-gradient(90deg,#150404 0%,#3a0a0a 50%,#150404 100%)"></div>
              <div class="chassis-ports-row">
                ${Object.entries(ifaces).map(([name, iface]) => `
                  <div class="chassis-port" title="${name}: ${iface.nameif||''}  Sec:${iface.securityLevel||0}">
                    <div class="port-body" style="border-color:#882222">
                      <div class="port-led ${iface.status === 'up' ? 'green' : 'off'}"></div>
                    </div>
                    <span class="port-label">${iface.nameif || name.replace('GigabitEthernet','Gi')}</span>
                  </div>
                `).join('')}
              </div>
              <div class="chassis-controls">
                <div class="chassis-display" style="color:#ff4444;text-shadow:0 0 4px #ff4444">${device.config.hostname}# ${device.config.firewallMode||'routed'}</div>
                <div class="chassis-btn" style="border-color:#882222;color:#ff4444" onclick="window.canvasManager.togglePower('${device.id}')">⏻</div>
              </div>
            </div>
          </div>
          <div class="config-section" style="width:100%">
            <div class="config-section-title">ZONE SECURITY</div>
            <div style="display:flex;gap:8px;font-family:var(--font-mono);font-size:11px;">
              ${Object.entries(ifaces).filter(([,i])=>i.nameif).map(([name, iface]) => `
                <div style="flex:1;background:var(--bg-deep);border:1px solid #882222;padding:8px;text-align:center;">
                  <div style="color:var(--accent-red);font-size:9px;margin-bottom:4px;">${(iface.nameif||name).toUpperCase()}</div>
                  <div style="color:var(--text-secondary);font-size:9px;">Security Level</div>
                  <div style="color:${iface.securityLevel>=100?'var(--accent-green)':iface.securityLevel>0?'var(--accent-yellow)':'var(--accent-red)'};font-size:16px;font-weight:bold;">${iface.securityLevel||0}</div>
                  <div style="color:var(--text-dim);font-size:9px;">${iface.ip || 'unconfig'}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // Generic visual
    return `
      <div class="device-visual">
        <div class="device-3d-view">
          <div style="font-size:64px;filter:drop-shadow(0 0 20px var(--accent-blue))">${device.icon}</div>
        </div>
        <div class="config-section" style="width:100%">
          <div class="config-section-title">INFO</div>
          <div style="font-family:var(--font-mono);font-size:11px;">
            <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--text-secondary)">Name:</span><span>${device.label}</span></div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--text-secondary)">Model:</span><span>${device.model}</span></div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--text-secondary)">Power:</span><span style="color:${device.powered?'var(--accent-green)':'var(--accent-red)'}">${device.powered?'ON':'OFF'}</span></div>
          </div>
        </div>
      </div>
    `;
  }

  renderConfig(device) {
    const c = device.config;
    if (device.type === 'router' || device.type === 'router-edge') {
      return `
        <div class="config-grid">
          <div class="config-section full">
            <div class="config-section-title">IDENTIFICAÇÃO</div>
            <div class="config-grid">
              <div class="config-field">
                <label class="config-label">HOSTNAME</label>
                <input class="config-input" id="cfg_hostname" value="${c.hostname||''}"/>
              </div>
              <div class="config-field">
                <label class="config-label">ENABLE SECRET</label>
                <input class="config-input" id="cfg_enableSecret" type="password" value="${c.enableSecret||''}"/>
              </div>
            </div>
          </div>
          <div class="config-section">
            <div class="config-section-title">ROTEAMENTO</div>
            <div class="config-checkbox-row">
              <input type="checkbox" id="cfg_ospf" ${c.routing?.ospf?'checked':''}/>
              <label for="cfg_ospf">OSPF</label>
            </div>
            <div class="config-checkbox-row">
              <input type="checkbox" id="cfg_rip" ${c.routing?.rip?'checked':''}/>
              <label for="cfg_rip">RIP v2</label>
            </div>
            <div class="config-checkbox-row">
              <input type="checkbox" id="cfg_bgp" ${c.routing?.bgp?'checked':''}/>
              <label for="cfg_bgp">BGP</label>
            </div>
          </div>
          <div class="config-section">
            <div class="config-section-title">SERVIÇOS</div>
            <div class="config-checkbox-row">
              <input type="checkbox" id="cfg_nat" ${c.natEnabled?'checked':''}/>
              <label for="cfg_nat">NAT/PAT</label>
            </div>
            <div class="config-field" style="margin-top:8px">
              <label class="config-label">DHCP POOL (rede)</label>
              <input class="config-input" id="cfg_dhcpNet" placeholder="ex: 192.168.1.0/24"/>
            </div>
          </div>
          <div class="config-section full">
            <div class="config-section-title">ROTA ESTÁTICA</div>
            <div class="config-grid">
              <div class="config-field">
                <label class="config-label">DESTINO</label>
                <input class="config-input" id="cfg_routeDest" placeholder="0.0.0.0"/>
              </div>
              <div class="config-field">
                <label class="config-label">MÁSCARA</label>
                <input class="config-input" id="cfg_routeMask" placeholder="0.0.0.0"/>
              </div>
              <div class="config-field">
                <label class="config-label">NEXT-HOP</label>
                <input class="config-input" id="cfg_routeNH" placeholder="192.168.1.1"/>
              </div>
              <div style="display:flex;align-items:flex-end;">
                <button class="config-btn primary" onclick="window.app.addStaticRoute('${device.id}')">+ ADICIONAR</button>
              </div>
            </div>
            ${(c.routing?.static||[]).length > 0 ? `
              <div style="margin-top:8px;font-family:var(--font-mono);font-size:10px;">
                ${(c.routing.static||[]).map((r,i) => `
                  <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--text-secondary)">${r.dest}/${this.maskToCIDR(r.mask)} via ${r.nexthop}</span>
                    <button onclick="window.app.removeStaticRoute('${device.id}',${i})" style="background:none;border:none;color:var(--accent-red);cursor:pointer;font-size:10px;">✕</button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <div class="config-btn-row" style="grid-column:1/-1">
            <button class="config-btn primary" onclick="window.app.applyConfig('${device.id}')">APLICAR</button>
            <button class="config-btn success" onclick="window.app.switchTab('terminal')">⌨ TERMINAL</button>
          </div>
        </div>
      `;
    }

    if (device.type === 'switch' || device.type === 'switch-l3') {
      return `
        <div class="config-grid">
          <div class="config-section full">
            <div class="config-section-title">IDENTIFICAÇÃO</div>
            <div class="config-grid">
              <div class="config-field">
                <label class="config-label">HOSTNAME</label>
                <input class="config-input" id="cfg_hostname" value="${c.hostname||''}"/>
              </div>
              <div class="config-field">
                <label class="config-label">ENABLE SECRET</label>
                <input class="config-input" id="cfg_enableSecret" type="password" value="${c.enableSecret||''}"/>
              </div>
            </div>
          </div>
          <div class="config-section">
            <div class="config-section-title">VLANS</div>
            <div id="vlanList" style="margin-bottom:8px;font-family:var(--font-mono);font-size:11px;">
              ${Object.entries(c.vlans||{}).map(([id,name]) => `
                <div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid var(--border)">
                  <span><span style="color:var(--accent-cyan)">VLAN ${id}</span> — ${name}</span>
                  ${id!=='1'?`<button onclick="window.app.removeVLAN('${device.id}','${id}')" style="background:none;border:none;color:var(--accent-red);cursor:pointer;font-size:10px;">✕</button>`:''}
                </div>
              `).join('')}
            </div>
            <div style="display:flex;gap:6px;margin-top:6px;">
              <input class="config-input" id="cfg_vlanId" placeholder="ID" style="width:60px"/>
              <input class="config-input" id="cfg_vlanName" placeholder="Name" style="flex:1"/>
              <button class="config-btn primary" style="flex:0;padding:6px 10px;" onclick="window.app.addVLAN('${device.id}')">+</button>
            </div>
          </div>
          <div class="config-section">
            <div class="config-section-title">SWITCHING</div>
            <div class="config-checkbox-row">
              <input type="checkbox" id="cfg_stp" ${c.spanningTree?'checked':''}/>
              <label for="cfg_stp">Spanning Tree (STP)</label>
            </div>
            ${c.ipRouting !== undefined ? `
            <div class="config-checkbox-row">
              <input type="checkbox" id="cfg_iprouting" ${c.ipRouting?'checked':''}/>
              <label for="cfg_iprouting">IP Routing (L3)</label>
            </div>` : ''}
            <div class="config-field" style="margin-top:8px">
              <label class="config-label">VTP DOMAIN</label>
              <input class="config-input" id="cfg_vtpDomain" value="${c.vtp?.domain||'default'}"/>
            </div>
          </div>
          <div class="config-btn-row" style="grid-column:1/-1">
            <button class="config-btn primary" onclick="window.app.applyConfig('${device.id}')">APLICAR</button>
            <button class="config-btn success" onclick="window.app.switchTab('terminal')">⌨ TERMINAL</button>
          </div>
        </div>
      `;
    }

    if (device.type === 'server') {
      return `
        <div class="config-grid">
          <div class="config-section full">
            <div class="config-section-title">SERVIDOR</div>
            <div class="config-grid">
              <div class="config-field">
                <label class="config-label">HOSTNAME</label>
                <input class="config-input" id="cfg_hostname" value="${c.hostname||''}"/>
              </div>
              <div class="config-field">
                <label class="config-label">SISTEMA OPERACIONAL</label>
                <select class="config-select" id="cfg_os">
                  <option ${c.os==='Linux'?'selected':''}>Linux</option>
                  <option ${c.os==='Windows Server'?'selected':''}>Windows Server</option>
                  <option ${c.os==='FreeBSD'?'selected':''}>FreeBSD</option>
                  <option ${c.os==='VMware ESXi'?'selected':''}>VMware ESXi</option>
                </select>
              </div>
            </div>
          </div>
          <div class="config-section full">
            <div class="config-section-title">SERVIÇOS ATIVOS</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
              ${Object.entries(c.services||{}).map(([svc,enabled]) => `
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px;background:var(--bg-deep);border:1px solid ${enabled?'var(--accent-green)':'var(--border)'};font-family:var(--font-mono);font-size:11px;">
                  <input type="checkbox" id="svc_${svc}" ${enabled?'checked':''} style="accent-color:var(--accent-green)"/>
                  <span>${svc.toUpperCase()}</span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="config-btn-row" style="grid-column:1/-1">
            <button class="config-btn primary" onclick="window.app.applyConfig('${device.id}')">APLICAR</button>
          </div>
        </div>
      `;
    }

    // Generic config
    return `
      <div class="config-section">
        <div class="config-section-title">CONFIGURAÇÃO</div>
        <div class="config-field">
          <label class="config-label">LABEL</label>
          <input class="config-input" id="cfg_hostname" value="${c.hostname||c.label||device.label}"/>
        </div>
        <div class="config-btn-row">
          <button class="config-btn primary" onclick="window.app.applyConfig('${device.id}')">APLICAR</button>
        </div>
      </div>
    `;
  }

  renderInterfaces(device) {
    const ifaces = device.config.interfaces || {};
    const ifaceKeys = Object.keys(ifaces);
    return `
      <div style="margin-bottom:12px;">
        <table class="iface-table">
          <thead>
            <tr>
              <th>Interface</th>
              <th>IP Address</th>
              <th>Mask</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${ifaceKeys.map(name => {
              const iface = ifaces[name];
              return `
                <tr>
                  <td style="color:var(--accent-cyan)">${name}</td>
                  <td>
                    <input class="config-input" value="${iface.ip||''}" placeholder="x.x.x.x"
                      onchange="window.app.setIfaceIP('${device.id}','${name}',this.value)"
                      style="width:130px;padding:3px 6px;font-size:10px;"/>
                  </td>
                  <td>
                    <input class="config-input" value="${iface.mask||'255.255.255.0'}"
                      onchange="window.app.setIfaceMask('${device.id}','${name}',this.value)"
                      style="width:130px;padding:3px 6px;font-size:10px;"/>
                  </td>
                  <td><span class="badge ${iface.status||'down'}">${iface.status||'down'}</span></td>
                  <td>
                    <button onclick="window.app.quickToggleInterface('${device.id}','${name}')"
                      style="background:none;border:1px solid var(--border);color:var(--text-secondary);padding:2px 8px;cursor:pointer;font-family:var(--font-mono);font-size:9px;">
                      ${iface.status==='up'?'SHUT':'NO SHUT'}
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="config-btn primary" style="flex:1" onclick="window.app.applyAllInterfaces('${device.id}')">SALVAR INTERFACES</button>
        <button class="config-btn success" style="flex:1" onclick="window.app.switchTab('terminal')">⌨ TERMINAL</button>
      </div>
    `;
  }

  renderTerminal(device) {
    if (!this.terminals.has(device.id)) {
      const term = new Terminal(device);
      term.renderCallback = () => this.refreshTerminal(device.id);
      this.terminals.set(device.id, term);
    }
    const term = this.terminals.get(device.id);
    const outputHtml = term.output.map(l =>
      `<span class="terminal-line ${l.cls}">${this.escapeHtml(l.text)}</span>`
    ).join('\n');

    return `
      <div class="terminal-wrapper">
        <div class="terminal-bar">
          <div class="terminal-dot" style="background:#ff5f57"></div>
          <div class="terminal-dot" style="background:#febc2e"></div>
          <div class="terminal-dot" style="background:#28c840"></div>
          <span class="terminal-title">CISCO IOS — ${device.config.hostname || device.label}</span>
        </div>
        <div class="terminal-output" id="termOutput_${device.id}">${outputHtml}</div>
        <div class="terminal-input-row">
          <span class="terminal-prompt" id="termPrompt_${device.id}">${term.getPrompt()} </span>
          <input class="terminal-input" id="termInput_${device.id}" 
            placeholder="Digite um comando (? para ajuda)..."
            autocomplete="off" autocorrect="off" spellcheck="false"/>
        </div>
      </div>
    `;
  }

  attachVisualEvents(device) {
    // Toggle interface on port click (already inline)
  }

  attachConfigEvents(device) {
    // Inline handlers
  }

  attachInterfaceEvents(device) {
    // Inline handlers
  }

  attachTerminalEvents(device) {
    const input = document.getElementById(`termInput_${device.id}`);
    const output = document.getElementById(`termOutput_${device.id}`);
    const term = this.terminals.get(device.id);
    if (!input || !term) return;

    input.focus();
    output.scrollTop = output.scrollHeight;

    let histIdx = -1;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value;
        input.value = '';
        histIdx = -1;
        term.execute(cmd);
        this.refreshTerminal(device.id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx < term.commandHistory.length - 1) {
          histIdx++;
          input.value = term.commandHistory[histIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx > 0) {
          histIdx--;
          input.value = term.commandHistory[histIdx] || '';
        } else {
          histIdx = -1;
          input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Basic tab completion
        const cmds = ['enable','disable','configure terminal','show','ping','traceroute','exit','end','reload','write','copy','interface','hostname','ip address','no shutdown','shutdown','switchport'];
        const match = cmds.find(c => c.startsWith(input.value.toLowerCase()));
        if (match) input.value = match;
      } else if (e.ctrlKey && e.key === 'c') {
        term.print('^C', 'warn');
        input.value = '';
        this.refreshTerminal(device.id);
      }
    });
  }

  refreshTerminal(deviceId) {
    const term = this.terminals.get(deviceId);
    const output = document.getElementById(`termOutput_${deviceId}`);
    const prompt = document.getElementById(`termPrompt_${deviceId}`);
    if (!term || !output) return;
    output.innerHTML = term.output.map(l =>
      `<span class="terminal-line ${l.cls}">${this.escapeHtml(l.text)}</span>`
    ).join('\n');
    output.scrollTop = output.scrollHeight;
    if (prompt) prompt.textContent = term.getPrompt() + ' ';
  }

  // ===== ACTIONS =====
  quickToggleInterface(deviceId, ifaceName) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device?.config?.interfaces?.[ifaceName]) return;
    const iface = device.config.interfaces[ifaceName];
    iface.status = iface.status === 'up' ? 'admin-down' : 'up';
    this.notify(`${ifaceName}: ${iface.status.toUpperCase()}`, iface.status === 'up' ? 'success' : 'warn');
    // Re-render current tab
    if (this.activeModal === deviceId) this.renderTab(this.activeTab, device);
    window.inspector?.refresh(deviceId);
    window.connectionManager.redraw();
  }

  toggleService(deviceId, svc, enabled) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;
    device.config.services[svc] = enabled;
    this.notify(`Serviço ${svc.toUpperCase()} ${enabled ? 'ativado' : 'desativado'}`, enabled ? 'success' : 'warn');
  }

  setIfaceIP(deviceId, ifaceName, value) {
    const device = window.deviceManager.getDevice(deviceId);
    if (device?.config?.interfaces?.[ifaceName]) {
      device.config.interfaces[ifaceName].ip = value;
    }
  }

  setIfaceMask(deviceId, ifaceName, value) {
    const device = window.deviceManager.getDevice(deviceId);
    if (device?.config?.interfaces?.[ifaceName]) {
      device.config.interfaces[ifaceName].mask = value;
    }
  }

  applyAllInterfaces(deviceId) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;
    this.notify('Interfaces salvas', 'success');
    window.inspector?.refresh(deviceId);
    window.connectionManager.redraw();
  }

  applyConfig(deviceId) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;
    const hostname = document.getElementById('cfg_hostname')?.value?.trim();
    if (hostname) {
      device.config.hostname = hostname;
      device.label = hostname;
      const node = document.getElementById(`node_${deviceId}`);
      if (node) node.querySelector('.device-label').textContent = hostname;
      document.getElementById('modalTitle').textContent = hostname;
    }
    const secret = document.getElementById('cfg_enableSecret')?.value;
    if (secret !== undefined && secret !== null) device.config.enableSecret = secret;

    // Routing
    if (device.config.routing) {
      if (document.getElementById('cfg_ospf')) device.config.routing.ospf = document.getElementById('cfg_ospf').checked;
      if (document.getElementById('cfg_rip')) device.config.routing.rip = document.getElementById('cfg_rip').checked;
      if (document.getElementById('cfg_bgp')) device.config.routing.bgp = document.getElementById('cfg_bgp').checked;
    }
    if (document.getElementById('cfg_nat') && device.config.natEnabled !== undefined) {
      device.config.natEnabled = document.getElementById('cfg_nat').checked;
    }

    // Switch
    if (document.getElementById('cfg_stp') && device.config.spanningTree !== undefined) {
      device.config.spanningTree = document.getElementById('cfg_stp').checked;
    }
    if (document.getElementById('cfg_iprouting') && device.config.ipRouting !== undefined) {
      device.config.ipRouting = document.getElementById('cfg_iprouting').checked;
    }
    const vtpDomain = document.getElementById('cfg_vtpDomain')?.value;
    if (vtpDomain && device.config.vtp) device.config.vtp.domain = vtpDomain;

    // Server OS
    const os = document.getElementById('cfg_os')?.value;
    if (os) device.config.os = os;

    // Server services
    if (device.config.services) {
      Object.keys(device.config.services).forEach(svc => {
        const el = document.getElementById(`svc_${svc}`);
        if (el) device.config.services[svc] = el.checked;
      });
    }

    this.notify('Configuração aplicada!', 'success');
    window.inspector?.refresh(deviceId);
  }

  addStaticRoute(deviceId) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;
    const dest = document.getElementById('cfg_routeDest')?.value?.trim();
    const mask = document.getElementById('cfg_routeMask')?.value?.trim();
    const nexthop = document.getElementById('cfg_routeNH')?.value?.trim();
    if (!dest || !mask || !nexthop) { this.notify('Preencha todos os campos de rota', 'error'); return; }
    if (!device.config.routing) device.config.routing = { static: [] };
    if (!device.config.routing.static) device.config.routing.static = [];
    device.config.routing.static.push({ dest, mask, nexthop });
    this.notify('Rota estática adicionada', 'success');
    this.renderTab('config', device);
  }

  removeStaticRoute(deviceId, index) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;
    device.config.routing.static.splice(index, 1);
    this.renderTab('config', device);
  }

  addVLAN(deviceId) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;
    const id = document.getElementById('cfg_vlanId')?.value?.trim();
    const name = document.getElementById('cfg_vlanName')?.value?.trim() || `VLAN${id}`;
    if (!id || isNaN(id)) { this.notify('ID VLAN inválido', 'error'); return; }
    device.config.vlans[id] = name;
    this.notify(`VLAN ${id} criada`, 'success');
    this.renderTab('config', device);
  }

  removeVLAN(deviceId, vlanId) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device || vlanId === '1') return;
    delete device.config.vlans[vlanId];
    this.renderTab('config', device);
  }

  resetDevice(deviceId) {
    const device = window.deviceManager.getDevice(deviceId);
    if (!device) return;
    // Reset terminal
    this.terminals.delete(deviceId);
    this.notify(`${device.label} reiniciado`, 'info');
    if (this.activeTab === 'terminal') this.renderTab('terminal', device);
  }

  simulate() {
    const devices = window.deviceManager.getAllDevices();
    if (devices.length < 2) { this.notify('Adicione mais dispositivos para simular', 'warn'); return; }
    
    // Activate connected interfaces
    window.connectionManager.connections.forEach(c => {
      const d1 = window.deviceManager.getDevice(c.from.deviceId);
      const d2 = window.deviceManager.getDevice(c.to.deviceId);
      if (d1?.powered && d2?.powered) {
        const p1 = d1.ports.find(p => p.id === c.from.portId);
        const p2 = d2.ports.find(p => p.id === c.to.portId);
        if (p1 && d1.config.interfaces?.[p1.name]) d1.config.interfaces[p1.name].status = 'up';
        if (p2 && d2.config.interfaces?.[p2.name]) d2.config.interfaces[p2.name].status = 'up';
        c.active = true;
      }
    });

    window.connectionManager.simulateAll();
    document.getElementById('statusText').textContent = 'SIMULANDO...';
    document.getElementById('btnSimulate').classList.add('active');

    this.notify(`Simulando ${window.connectionManager.connections.length} conexões...`, 'success');
    setTimeout(() => {
      document.getElementById('statusText').textContent = 'READY';
      document.getElementById('btnSimulate').classList.remove('active');
    }, 5000);
  }

  saveTopology() {
    const data = {
      devices: window.deviceManager.getAllDevices().map(d => ({
        id: d.id, type: d.type, label: d.label, x: d.x, y: d.y,
        model: d.model, config: d.config, powered: d.powered
      })),
      connections: window.connectionManager.connections,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `topology_${Date.now()}.json`;
    a.click();
    this.notify('Topologia salva', 'success');
  }

  maskToCIDR(mask) {
    if (!mask) return '24';
    const parts = mask.split('.').map(Number);
    let cidr = 0;
    parts.forEach(p => { let x = p; while (x > 0) { cidr += x & 1; x >>= 1; } });
    return cidr;
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

window.app = null;
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

