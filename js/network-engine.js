// ============================================================
//  NETSIM — NETWORK ENGINE
//  Motor de rede virtual integrado ao NetSim
//  Camadas L1 (físico) → L2 (Ethernet/VLAN) → L3 (IP/routing)
// ============================================================

class NetworkEngine {
  constructor() {
    // Tabela ARP global: ip -> { mac, deviceId, iface, ttl }
    this.arpTable   = new Map();
    // Tabela de rotas computada: [{ dest, mask, nexthop, deviceId, iface, metric, src }]
    this.routeTable = [];
    // Leases DHCP: ip -> { deviceId, iface, expires, gateway, dns }
    this.dhcpLeases = new Map();
    // Contador de conflitos detectados
    this.conflicts  = [];
    // IP público atribuído pela "nuvem" (ISP)
    this.ispPublicIP = null;
    this.ispGateway  = null;
    // Listener de eventos para UI
    this._listeners = {};
    // Estado da simulação
    this.running = false;
  }

  // ── UTILITÁRIOS IP ────────────────────────────────────────

  ipToInt(ip) {
    if (!ip) return 0;
    return ip.split('.').reduce((acc, o) => (acc << 8) | parseInt(o), 0) >>> 0;
  }

  intToIP(n) {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  }

  maskToInt(mask) {
    if (!mask) return 0xFFFFFF00;
    if (/^\d+$/.test(mask)) {
      // CIDR notation
      const cidr = parseInt(mask);
      return cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
    }
    return this.ipToInt(mask);
  }

  cidrToMask(cidr) {
    return this.intToIP(cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0);
  }

  networkAddress(ip, mask) {
    return this.intToIP(this.ipToInt(ip) & this.maskToInt(mask));
  }

  broadcastAddress(ip, mask) {
    const net  = this.ipToInt(ip) & this.maskToInt(mask);
    const wild = ~this.maskToInt(mask) >>> 0;
    return this.intToIP((net | wild) >>> 0);
  }

  hostCount(mask) {
    const wild = ~this.maskToInt(mask) >>> 0;
    return Math.max(0, wild - 1);
  }

  isInNetwork(ip, network, mask) {
    return (this.ipToInt(ip) & this.maskToInt(mask)) ===
           (this.ipToInt(network) & this.maskToInt(mask));
  }

  isValidIP(ip) {
    if (!ip || typeof ip !== 'string') return false;
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(p => /^\d{1,3}$/.test(p) && parseInt(p) >= 0 && parseInt(p) <= 255);
  }

  isValidMask(mask) {
    if (!mask) return false;
    const n = this.maskToInt(mask);
    // A valid mask has contiguous 1s followed by contiguous 0s
    const inv = ~n >>> 0;
    return (inv & (inv + 1)) === 0;
  }

  isPrivateIP(ip) {
    const n = this.ipToInt(ip);
    return (
      (n & 0xFF000000) === 0x0A000000 || // 10.0.0.0/8
      (n & 0xFFF00000) === 0xAC100000 || // 172.16.0.0/12
      (n & 0xFFFF0000) === 0xC0A80000    // 192.168.0.0/16
    );
  }

  generateMac(seed) {
    // Deterministic MAC from seed string
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    const b = [(h >>> 24) & 0xFE, (h >>> 16) & 0xFF, (h >>> 8) & 0xFF, h & 0xFF,
               (seed.length * 7) & 0xFF, (seed.charCodeAt(0) * 13) & 0xFF];
    return b.map(x => x.toString(16).padStart(2,'0')).join(':');
  }

  randomPublicIP() {
    // Avoid private ranges: use 100.64/10 (carrier-grade) or 203.x.x.x
    const third  = Math.floor(Math.random() * 200) + 10;
    const fourth = Math.floor(Math.random() * 250) + 2;
    return `203.${Math.floor(Math.random()*200)+10}.${third}.${fourth}`;
  }

  randomPrivateIP(base, mask) {
    // Pick a random host in the subnet
    const netInt  = this.ipToInt(base) & this.maskToInt(mask);
    const wild    = (~this.maskToInt(mask)) >>> 0;
    if (wild < 3) return null;
    const offset  = Math.floor(Math.random() * (wild - 2)) + 2; // skip .0 and .1
    return this.intToIP((netInt | offset) >>> 0);
  }

  // ── EVENTO ────────────────────────────────────────────────

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
  }

  // ── L1: ESTADO FÍSICO ─────────────────────────────────────

  /**
   * Verifica se dois dispositivos têm link físico (L1 up).
   * Retorna o objeto de conexão ou null.
   */
  getPhysicalLink(devIdA, portIdA, devIdB, portIdB) {
    return window.connectionManager.connections.find(c =>
      (c.from.deviceId === devIdA && c.from.portId === portIdA &&
       c.to.deviceId   === devIdB && c.to.portId   === portIdB) ||
      (c.from.deviceId === devIdB && c.from.portId === portIdB &&
       c.to.deviceId   === devIdA && c.to.portId   === portIdA)
    ) || null;
  }

  /**
   * Retorna todos os vizinhos diretos (L1) de um dispositivo.
   * [{conn, neighbor, neighborPort, localPort}]
   */
  getNeighbors(deviceId) {
    return window.connectionManager.connections
      .filter(c => c.from.deviceId === deviceId || c.to.deviceId === deviceId)
      .map(c => {
        const isFrom = c.from.deviceId === deviceId;
        return {
          conn:         c,
          neighbor:     window.deviceManager.getDevice(isFrom ? c.to.deviceId   : c.from.deviceId),
          neighborPort: isFrom ? c.to.portId   : c.from.portId,
          localPort:    isFrom ? c.from.portId : c.to.portId,
        };
      })
      .filter(n => n.neighbor && n.neighbor.powered);
  }

  /**
   * Verifica L1 up: a conexão existe E ambos os devices estão ligados.
   */
  isL1Up(conn) {
    const d1 = window.deviceManager.getDevice(conn.from.deviceId);
    const d2 = window.deviceManager.getDevice(conn.to.deviceId);
    return !!(d1?.powered && d2?.powered);
  }

  // ── L2: SWITCHING / VLAN ──────────────────────────────────

  /**
   * Retorna a interface lógica de um device associada a um portId.
   */
  getIfaceByPortId(device, portId) {
    const port = device.ports.find(p => p.id === portId);
    if (!port) return null;
    return { name: port.name, cfg: device.config.interfaces?.[port.name] };
  }

  /**
   * Determina o VLAN de uma porta de switch.
   */
  getPortVlan(device, portId) {
    const iface = this.getIfaceByPortId(device, portId);
    if (!iface?.cfg) return 1;
    return iface.cfg.vlan || 1;
  }

  /**
   * Retorna o modo (access|trunk) de uma porta de switch.
   */
  getPortMode(device, portId) {
    const iface = this.getIfaceByPortId(device, portId);
    if (!iface?.cfg) return 'access';
    return iface.cfg.mode || 'access';
  }

  /**
   * Dado um switch, retorna os segmentos L2 (grupos de portas no mesmo VLAN).
   * Retorna Map<vlanId, [{ deviceId, portId }]>
   */
  getSwitchVlanSegments(sw) {
    const segments = new Map();
    sw.ports.forEach(port => {
      const mode = this.getPortMode(sw, port.id);
      const vlan = this.getPortVlan(sw, port.id);
      if (mode === 'access') {
        if (!segments.has(vlan)) segments.set(vlan, []);
        segments.get(vlan).push({ deviceId: sw.id, portId: port.id });
      } else if (mode === 'trunk') {
        // Trunk: participante de todos os VLANs configurados no switch
        Object.keys(sw.config.vlans || { 1: 'default' }).forEach(vid => {
          const v = parseInt(vid);
          if (!segments.has(v)) segments.set(v, []);
          segments.get(v).push({ deviceId: sw.id, portId: port.id });
        });
      }
    });
    return segments;
  }

  /**
   * Verifica se dois endpoints (device+port) são L2-alcançáveis (mesmo VLAN no switch).
   * Percorre a topologia com BFS respeitando VLANs.
   */
  isL2Reachable(fromDevId, fromPortId, toDevId, toPortId) {
    // BFS sobre conexões L1, respeitando VLAN tagging
    const visited = new Set();
    const queue   = [{ devId: fromDevId, portId: fromPortId, vlan: null }];

    while (queue.length) {
      const { devId, portId, vlan } = queue.shift();
      const key = `${devId}:${portId}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (devId === toDevId && portId === toPortId) return true;

      const device = window.deviceManager.getDevice(devId);
      if (!device) continue;

      const neighbors = this.getNeighbors(devId);
      for (const { conn, neighbor, neighborPort, localPort } of neighbors) {
        if (!this.isL1Up(conn)) continue;

        // Compute effective VLAN at entry
        let effectiveVlan = vlan;

        if (device.type === 'switch' || device.type === 'switch-l3') {
          const mode    = this.getPortMode(device, portId);
          const portVlan = this.getPortVlan(device, portId);
          if (mode === 'access') {
            effectiveVlan = portVlan;
          }
          // On trunk, carry existing vlan or allow all
        }

        // Check if neighbor switch allows this VLAN
        if (neighbor.type === 'switch' || neighbor.type === 'switch-l3') {
          const nMode     = this.getPortMode(neighbor, neighborPort);
          const nVlan     = this.getPortVlan(neighbor, neighborPort);
          if (nMode === 'access' && effectiveVlan !== null && nVlan !== effectiveVlan) {
            continue; // VLAN mismatch
          }
          if (effectiveVlan !== null && nMode === 'access' && !neighbor.config.vlans?.[effectiveVlan]) {
            continue; // VLAN not configured
          }
        }

        queue.push({ devId: neighbor.id, portId: neighborPort, vlan: effectiveVlan });
      }
    }
    return false;
  }

  // ── L3: IP / ROUTING ──────────────────────────────────────

  /**
   * Constrói a tabela de rotas global (todos os devices L3).
   * Resultado em this.routeTable.
   */
  buildRouteTable() {
    this.routeTable = [];
    const devices   = window.deviceManager.getAllDevices();

    devices.forEach(dev => {
      const isRouter   = dev.type === 'router' || dev.type === 'router-edge';
      const isSwitchL3 = dev.type === 'switch-l3' && dev.config.ipRouting;
      const isFirewall = dev.type === 'firewall';
      if (!isRouter && !isSwitchL3 && !isFirewall) return;
      if (!dev.powered) return;

      // Connected routes
      Object.entries(dev.config.interfaces || {}).forEach(([name, iface]) => {
        if (!iface.ip || !iface.mask || iface.status !== 'up') return;
        const network = this.networkAddress(iface.ip, iface.mask);
        this.routeTable.push({
          dest:     network,
          mask:     iface.mask,
          nexthop:  null, // directly connected
          deviceId: dev.id,
          iface:    name,
          metric:   0,
          src:      'C', // Connected
        });
      });

      // Static routes
      (dev.config.routing?.static || []).forEach(r => {
        this.routeTable.push({
          dest:     r.dest,
          mask:     r.mask,
          nexthop:  r.nexthop,
          deviceId: dev.id,
          iface:    null,
          metric:   1,
          src:      'S',
        });
      });
    });

    // Default route if ISP connected
    if (this.ispGateway) {
      this.routeTable.push({
        dest:     '0.0.0.0',
        mask:     '0.0.0.0',
        nexthop:  this.ispGateway,
        deviceId: null,
        iface:    null,
        metric:   1,
        src:      'S*',
      });
    }
  }

  /**
   * Lookup de rota mais específica (longest prefix match) para um destino.
   */
  lookupRoute(destIP) {
    let best = null;
    let bestLen = -1;
    for (const route of this.routeTable) {
      if (this.isInNetwork(destIP, route.dest, route.mask)) {
        const cidr = this.maskToCIDR(route.mask);
        if (cidr > bestLen) {
          bestLen = cidr;
          best    = route;
        }
      }
    }
    return best;
  }

  maskToCIDR(mask) {
    const n = this.maskToInt(mask);
    let count = 0;
    let tmp   = n;
    while (tmp) { count += tmp & 1; tmp >>>= 1; }
    return count;
  }

  /**
   * BFS L3: encontra caminho de IP de origem a IP de destino.
   * Retorna array de hops [{deviceId, iface, ip}] ou null se inalcançável.
   */
  findPath(srcIP, dstIP) {
    this.buildRouteTable();

    // Find source device/iface
    const srcEntry = this.findDeviceByIP(srcIP);
    if (!srcEntry) return null;

    // If src and dst on same subnet, route directly
    const dstEntry = this.findDeviceByIP(dstIP);
    if (dstEntry) {
      // Check L2 reachability (same subnet direct)
      const srcNet = this.networkAddress(srcIP, srcEntry.mask);
      const dstNet = this.networkAddress(dstIP, dstEntry.mask);
      if (srcNet === dstNet) {
        return [
          { deviceId: srcEntry.deviceId, iface: srcEntry.iface, ip: srcIP },
          { deviceId: dstEntry.deviceId, iface: dstEntry.iface, ip: dstIP },
        ];
      }
    }

    // BFS over routers
    const visited = new Set();
    const queue   = [{
      deviceId: srcEntry.deviceId,
      path:     [{ deviceId: srcEntry.deviceId, iface: srcEntry.iface, ip: srcIP }],
    }];

    while (queue.length) {
      const { deviceId, path } = queue.shift();
      if (visited.has(deviceId)) continue;
      visited.add(deviceId);

      const dev     = window.deviceManager.getDevice(deviceId);
      if (!dev)     continue;

      // Check all interfaces for direct connectivity to dst
      const ifaces  = dev.config.interfaces || {};
      for (const [name, iface] of Object.entries(ifaces)) {
        if (!iface.ip || iface.status !== 'up') continue;
        if (this.isInNetwork(dstIP, iface.ip, iface.mask)) {
          // Reached destination subnet
          if (dstEntry) {
            return [...path, { deviceId: dstEntry.deviceId, iface: dstEntry.iface, ip: dstIP }];
          }
          return [...path, { deviceId: null, iface: null, ip: dstIP }];
        }
      }

      // Follow routes
      const route = this.lookupRoute(dstIP);
      if (!route) continue;

      if (route.nexthop) {
        const nhDev = this.findDeviceByIP(route.nexthop);
        if (nhDev && !visited.has(nhDev.deviceId)) {
          queue.push({
            deviceId: nhDev.deviceId,
            path: [...path, { deviceId: nhDev.deviceId, iface: nhDev.iface, ip: route.nexthop }],
          });
        }
      }
    }

    // Check if destination is "internet" (non-private via ISP)
    if (this.ispPublicIP && !this.isPrivateIP(dstIP)) {
      const route = this.lookupRoute(dstIP);
      if (route) {
        return [...findPath.path || [], { deviceId: 'internet', iface: 'ISP', ip: dstIP }];
      }
    }

    return null;
  }

  findDeviceByIP(ip) {
    for (const dev of window.deviceManager.getAllDevices()) {
      for (const [name, iface] of Object.entries(dev.config.interfaces || {})) {
        if (iface.ip === ip && iface.status === 'up') {
          return { deviceId: dev.id, iface: name, mask: iface.mask };
        }
      }
    }
    return null;
  }

  // ── PING SIMULADO ─────────────────────────────────────────

  /**
   * Simula ping entre dois IPs com validação real da topologia.
   * Retorna { success, hops, reason, rtt }
   */
  simulatePing(srcDeviceId, dstIP) {
    this.buildRouteTable();
    const srcDev = window.deviceManager.getDevice(srcDeviceId);
    if (!srcDev || !srcDev.powered) {
      return { success: false, reason: 'Dispositivo de origem desligado', hops: [] };
    }

    // Find src IP (first up interface)
    let srcIP = null;
    for (const [, iface] of Object.entries(srcDev.config.interfaces || {})) {
      if (iface.ip && iface.status === 'up') { srcIP = iface.ip; break; }
    }
    if (!srcIP) {
      return { success: false, reason: 'Nenhuma interface configurada com IP no dispositivo de origem', hops: [] };
    }

    // Check if destination is local (same subnet on any device)
    const dstEntry = this.findDeviceByIP(dstIP);

    // Validate IP format
    if (!this.isValidIP(dstIP)) {
      return { success: false, reason: 'Endereço IP de destino inválido', hops: [] };
    }

    // Try to find path
    const path = this.findPath(srcIP, dstIP);
    if (!path) {
      // Check if there's even a default route
      const hasDefaultRoute = this.routeTable.some(r => r.dest === '0.0.0.0');
      if (!hasDefaultRoute && !this.isPrivateIP(dstIP) === false) {
        return { success: false, reason: 'Sem rota para o destino (no route to host)', hops: [] };
      }

      // Check for firewall blocking
      const fw = this.findFirewallInPath(srcIP, dstIP);
      if (fw) {
        return { success: false, reason: `Firewall ${fw.label} bloqueando tráfego (security-level)`, hops: [] };
      }

      return { success: false, reason: 'Destino inacessível (unreachable)', hops: [] };
    }

    // Simulate RTT based on hop count
    const hops  = path.length - 1;
    const baseRtt = 1 + hops * 2;
    const rtt   = `${baseRtt}/${baseRtt + 1}/${baseRtt + 3}`;

    return {
      success: true,
      reason:  'OK',
      hops:    path.map(h => {
        const dev = h.deviceId ? window.deviceManager.getDevice(h.deviceId) : null;
        return { label: dev?.label || h.deviceId, ip: h.ip, iface: h.iface };
      }),
      rtt,
    };
  }

  findFirewallInPath(srcIP, dstIP) {
    // Check if a firewall sits between src and dst
    for (const dev of window.deviceManager.getAllDevices()) {
      if (dev.type !== 'firewall') continue;
      if (!dev.powered) continue;
      const ifaces = dev.config.interfaces || {};
      // If firewall has interfaces in both src and dst networks, it might block
      const inSrcNet = Object.values(ifaces).some(i => i.ip && this.isInNetwork(srcIP, i.ip, i.mask));
      const inDstNet = Object.values(ifaces).some(i => i.ip && this.isInNetwork(dstIP, i.ip, i.mask));
      if (inSrcNet && inDstNet) return dev;
    }
    return null;
  }

  // ── TRACEROUTE ────────────────────────────────────────────

  simulateTraceroute(srcDeviceId, dstIP) {
    this.buildRouteTable();
    const srcDev = window.deviceManager.getDevice(srcDeviceId);
    if (!srcDev || !srcDev.powered) {
      return { hops: [], error: 'Dispositivo desligado' };
    }
    let srcIP = null;
    for (const [, iface] of Object.entries(srcDev.config.interfaces || {})) {
      if (iface.ip && iface.status === 'up') { srcIP = iface.ip; break; }
    }
    if (!srcIP) return { hops: [], error: 'Sem IP configurado' };

    const path = this.findPath(srcIP, dstIP);
    if (!path) return { hops: [], error: 'Destino inacessível' };

    let msBase = 1;
    const hops = path.map((h, i) => {
      const dev = h.deviceId ? window.deviceManager.getDevice(h.deviceId) : null;
      const ms  = msBase + i * 2;
      return { ttl: i + 1, ip: h.ip, label: dev?.label || '*', ms };
    });
    return { hops, error: null };
  }

  // ── VALIDAÇÃO DE CONFLITOS ────────────────────────────────

  /**
   * Detecta todos os conflitos na topologia atual.
   * Retorna lista de { type, message, severity, devices }
   */
  detectConflicts() {
    const conflicts = [];
    const devices   = window.deviceManager.getAllDevices();

    // 1. IP duplicado
    const ipMap = new Map(); // ip -> [deviceId+iface]
    devices.forEach(dev => {
      Object.entries(dev.config.interfaces || {}).forEach(([name, iface]) => {
        if (!iface.ip) return;
        const key = iface.ip;
        if (!ipMap.has(key)) ipMap.set(key, []);
        ipMap.get(key).push(`${dev.label}/${name}`);
      });
    });
    ipMap.forEach((entries, ip) => {
      if (entries.length > 1) {
        conflicts.push({
          type:     'ip-conflict',
          message:  `IP duplicado ${ip}: ${entries.join(', ')}`,
          severity: 'error',
          devices:  entries,
        });
      }
    });

    // 2. IPs na mesma interface em subredes distintas conectados diretamente
    const connections = window.connectionManager.connections;
    connections.forEach(conn => {
      const d1 = window.deviceManager.getDevice(conn.from.deviceId);
      const d2 = window.deviceManager.getDevice(conn.to.deviceId);
      if (!d1 || !d2) return;
      const i1 = this.getIfaceByPortId(d1, conn.from.portId);
      const i2 = this.getIfaceByPortId(d2, conn.to.portId);
      if (!i1?.cfg?.ip || !i2?.cfg?.ip) return;
      const net1 = this.networkAddress(i1.cfg.ip, i1.cfg.mask);
      const net2 = this.networkAddress(i2.cfg.ip, i2.cfg.mask);
      if (net1 !== net2) {
        conflicts.push({
          type:     'subnet-mismatch',
          message:  `Sub-rede incompatível: ${d1.label}/${i1.name} (${net1}) ↔ ${d2.label}/${i2.name} (${net2})`,
          severity: 'warn',
          devices:  [d1.label, d2.label],
        });
      }
    });

    // 3. Gateway não alcançável
    devices.forEach(dev => {
      Object.entries(dev.config.interfaces || {}).forEach(([name, iface]) => {
        if (!iface.gateway || !iface.ip) return;
        if (!this.isInNetwork(iface.gateway, iface.ip, iface.mask)) {
          conflicts.push({
            type:     'gateway-unreachable',
            message:  `${dev.label}/${name}: gateway ${iface.gateway} fora da sub-rede ${iface.ip}/${this.maskToCIDR(iface.mask)}`,
            severity: 'error',
            devices:  [dev.label],
          });
        }
      });
    });

    // 4. VLAN não existe no switch mas está atribuída a porta
    devices.forEach(dev => {
      if (dev.type !== 'switch' && dev.type !== 'switch-l3') return;
      const vlans = dev.config.vlans || {};
      Object.entries(dev.config.interfaces || {}).forEach(([name, iface]) => {
        if (!iface.vlan || iface.vlan === 1) return;
        if (!vlans[iface.vlan]) {
          conflicts.push({
            type:     'vlan-not-exist',
            message:  `${dev.label}/${name}: VLAN ${iface.vlan} não criada no switch`,
            severity: 'error',
            devices:  [dev.label],
          });
        }
      });
    });

    // 5. Rota estática com next-hop inalcançável
    devices.forEach(dev => {
      (dev.config.routing?.static || []).forEach(route => {
        const nhDev = this.findDeviceByIP(route.nexthop);
        if (!nhDev) {
          // Check if nexthop is in a directly connected subnet
          let reachable = false;
          Object.values(dev.config.interfaces || {}).forEach(iface => {
            if (iface.ip && iface.status === 'up' && this.isInNetwork(route.nexthop, iface.ip, iface.mask)) {
              reachable = true;
            }
          });
          if (!reachable) {
            conflicts.push({
              type:     'nexthop-unreachable',
              message:  `${dev.label}: next-hop ${route.nexthop} da rota ${route.dest} inacessível`,
              severity: 'warn',
              devices:  [dev.label],
            });
          }
        }
      });
    });

    // 6. Máscara inválida
    devices.forEach(dev => {
      Object.entries(dev.config.interfaces || {}).forEach(([name, iface]) => {
        if (iface.mask && !this.isValidMask(iface.mask)) {
          conflicts.push({
            type:     'invalid-mask',
            message:  `${dev.label}/${name}: máscara inválida ${iface.mask}`,
            severity: 'error',
            devices:  [dev.label],
          });
        }
      });
    });

    // 7. Firewall com mesmo security-level em duas interfaces
    devices.forEach(dev => {
      if (dev.type !== 'firewall') return;
      const levels = {};
      Object.entries(dev.config.interfaces || {}).forEach(([name, iface]) => {
        if (iface.securityLevel === undefined || !iface.nameif) return;
        const lvl = iface.securityLevel;
        if (!levels[lvl]) levels[lvl] = [];
        levels[lvl].push(name);
      });
      Object.entries(levels).forEach(([lvl, ifaces]) => {
        if (ifaces.length > 1) {
          conflicts.push({
            type:     'fw-same-security-level',
            message:  `${dev.label}: interfaces ${ifaces.join(', ')} com mesmo security-level ${lvl}`,
            severity: 'warn',
            devices:  [dev.label],
          });
        }
      });
    });

    this.conflicts = conflicts;
    return conflicts;
  }

  // ── ISP / INTERNET ────────────────────────────────────────

  /**
   * Atribui IP público ao link conectado à nuvem e configura default route.
   * Chamado quando um device é conectado ao cloud.
   */
  assignISPConfig(routerDeviceId, routerPortId) {
    const device = window.deviceManager.getDevice(routerDeviceId);
    if (!device) return null;

    const iface = this.getIfaceByPortId(device, routerPortId);
    if (!iface) return null;

    // Generate ISP addresses
    const publicNet    = this.randomPublicIP();
    const publicParts  = publicNet.split('.');
    const gwIP         = `${publicParts[0]}.${publicParts[1]}.${publicParts[2]}.1`;
    const assignedIP   = `${publicParts[0]}.${publicParts[1]}.${publicParts[2]}.${Math.floor(Math.random()*200)+10}`;

    this.ispPublicIP = assignedIP;
    this.ispGateway  = gwIP;

    // Assign to interface
    if (iface.cfg) {
      iface.cfg.ip     = assignedIP;
      iface.cfg.mask   = '255.255.255.0';
      iface.cfg.status = 'up';
      iface.cfg.description = 'ISP Link — Auto';
    }

    // Add default route
    if (!device.config.routing) device.config.routing = { static: [] };
    if (!device.config.routing.static) device.config.routing.static = [];

    // Remove existing default routes
    device.config.routing.static = device.config.routing.static.filter(r => r.dest !== '0.0.0.0');
    device.config.routing.static.push({ dest: '0.0.0.0', mask: '0.0.0.0', nexthop: gwIP });

    this.buildRouteTable();
    return { assignedIP, gwIP, publicNet };
  }

  // ── DHCP ENGINE ───────────────────────────────────────────

  /**
   * Resolve um pedido DHCP a partir de um device cliente.
   * Encontra o DHCP server mais próximo na topologia e aloca IP.
   */
  resolveDHCP(clientDeviceId, clientPortId) {
    // Find DHCP server via BFS
    const visited = new Set();
    const queue   = [clientDeviceId];
    let dhcpServer = null;
    let pool       = null;

    while (queue.length && !dhcpServer) {
      const devId = queue.shift();
      if (visited.has(devId)) continue;
      visited.add(devId);

      const dev = window.deviceManager.getDevice(devId);
      if (!dev || !dev.powered) continue;

      // Check if this device is a DHCP server
      if (dev.type === 'server' && dev.config.services?.dhcp) {
        dhcpServer = dev;
      } else if ((dev.type === 'router' || dev.type === 'router-edge') && dev.config.dhcpPools?.length) {
        dhcpServer = dev;
        pool       = dev.config.dhcpPools[0];
      }

      // Spread BFS
      this.getNeighbors(devId).forEach(n => {
        if (!visited.has(n.neighbor.id)) queue.push(n.neighbor.id);
      });
    }

    if (!dhcpServer) return null;

    // Generate IP from pool
    let poolNet  = pool?.network || '192.168.1.0';
    let poolMask = pool?.mask    || '255.255.255.0';
    let gw       = pool?.gateway || this.getGatewayForNetwork(poolNet, poolMask);

    // Find first available IP
    let attempt = 0;
    let ip      = null;
    do {
      ip = this.randomPrivateIP(poolNet, poolMask);
      attempt++;
    } while (ip && this.dhcpLeases.has(ip) && attempt < 20);

    if (!ip) return null;

    const lease = {
      clientDeviceId,
      dhcpServerId: dhcpServer.id,
      ip,
      mask:    poolMask,
      gateway: gw,
      dns:     gw,
      expires: Date.now() + 86400000, // 24h
    };
    this.dhcpLeases.set(ip, lease);
    return lease;
  }

  getGatewayForNetwork(network, mask) {
    // Find a router with an interface in this network
    for (const dev of window.deviceManager.getAllDevices()) {
      if (dev.type !== 'router' && dev.type !== 'router-edge' && dev.type !== 'switch-l3') continue;
      for (const [, iface] of Object.entries(dev.config.interfaces || {})) {
        if (iface.ip && this.isInNetwork(iface.ip, network, mask)) {
          return iface.ip;
        }
      }
    }
    return null;
  }

  // ── SIMULATE ALL ─────────────────────────────────────────

  /**
   * Roda a simulação completa:
   * - Ativa interfaces físicas conectadas
   * - Detecta ISP
   * - Detecta conflitos
   * - Atualiza estado L1/L2/L3
   * Retorna relatório { conflicts, ispConfig, activeLinks, summary }
   */
  runSimulation() {
    this.running = true;
    const report = {
      conflicts:   [],
      ispConfig:   null,
      activeLinks: 0,
      summary:     [],
    };

    // L1: Activate physical links
    const connections = window.connectionManager.connections;
    connections.forEach(conn => {
      const d1 = window.deviceManager.getDevice(conn.from.deviceId);
      const d2 = window.deviceManager.getDevice(conn.to.deviceId);
      if (!d1 || !d2 || !d1.powered || !d2.powered) return;

      const i1 = this.getIfaceByPortId(d1, conn.from.portId);
      const i2 = this.getIfaceByPortId(d2, conn.to.portId);

      if (i1?.cfg) i1.cfg.status = 'up';
      if (i2?.cfg) i2.cfg.status = 'up';
      conn.active = true;
      report.activeLinks++;
    });

    // Detect ISP link (cloud device)
    const cloudConnections = connections.filter(conn => {
      const d1 = window.deviceManager.getDevice(conn.from.deviceId);
      const d2 = window.deviceManager.getDevice(conn.to.deviceId);
      return d1?.type === 'cloud' || d2?.type === 'cloud';
    });

    cloudConnections.forEach(conn => {
      const cloudIsFrom = window.deviceManager.getDevice(conn.from.deviceId)?.type === 'cloud';
      const routerDevId = cloudIsFrom ? conn.to.deviceId : conn.from.deviceId;
      const routerPort  = cloudIsFrom ? conn.to.portId   : conn.from.portId;

      const isp = this.assignISPConfig(routerDevId, routerPort);
      if (isp) {
        report.ispConfig = isp;
        report.summary.push(`🌐 ISP: IP público ${isp.assignedIP} atribuído, gateway ${isp.gwIP}`);
      }
    });

    // Build routing table
    this.buildRouteTable();

    // Detect conflicts
    report.conflicts = this.detectConflicts();

    // Summary
    const devCount   = window.deviceManager.getAllDevices().length;
    const routerCount = window.deviceManager.getAllDevices().filter(d => d.type === 'router' || d.type === 'router-edge').length;
    report.summary.push(`📡 ${devCount} dispositivos, ${report.activeLinks} links ativos`);
    report.summary.push(`🔀 ${this.routeTable.length} rotas na tabela de roteamento`);
    if (report.conflicts.length > 0) {
      report.summary.push(`⚠️ ${report.conflicts.length} conflito(s) detectado(s)`);
    } else {
      report.summary.push(`✅ Nenhum conflito de configuração detectado`);
    }

    this.emit('simulation-complete', report);
    return report;
  }

  // ── ARP TABLE ─────────────────────────────────────────────

  populateARP() {
    this.arpTable.clear();
    window.deviceManager.getAllDevices().forEach(dev => {
      Object.entries(dev.config.interfaces || {}).forEach(([name, iface]) => {
        if (!iface.ip || iface.status !== 'up') return;
        const mac = this.generateMac(`${dev.id}:${name}`);
        this.arpTable.set(iface.ip, {
          mac,
          deviceId: dev.id,
          iface:    name,
          ttl:      240,
        });
      });
    });
  }

  getARP(ip) {
    return this.arpTable.get(ip) || null;
  }
}

window.networkEngine = new NetworkEngine();