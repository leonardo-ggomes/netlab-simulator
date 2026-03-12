// ============================================================
//  NETSIM — INTEGRATION PATCHES
//  Conecta o NetworkEngine ao app existente sem reescrever tudo.
//  Carregue APÓS script.js e network-engine.js.
// ============================================================

/* ── 1. PATCH: finishConnection ─────────────────────────────
   Quando uma conexão é criada com o Cloud, atribui IP ISP.
   Quando qualquer conexão é criada, recalcula estado L1.
───────────────────────────────────────────────────────────── */
(function patchConnectionManager() {
  document.addEventListener('DOMContentLoaded', () => {
    const cm = window.connectionManager;
    if (!cm) return;

    const _finish = cm.finishConnection.bind(cm);
    cm.finishConnection = function(toDeviceId, toPortId) {
      if (!this.connectingFrom) return;
      const fromDeviceId = this.connectingFrom.deviceId;
      const fromPortId   = this.connectingFrom.portId;

      // Run original logic
      _finish(toDeviceId, toPortId);

      // Detect if cloud was involved → assign ISP IP
      const fromDev = window.deviceManager.getDevice(fromDeviceId);
      const toDev   = window.deviceManager.getDevice(toDeviceId);

      if (fromDev?.type === 'cloud' || toDev?.type === 'cloud') {
        const routerDevId = fromDev?.type === 'cloud' ? toDeviceId   : fromDeviceId;
        const routerPort  = fromDev?.type === 'cloud' ? toPortId     : fromPortId;

        setTimeout(() => {
          const isp = window.networkEngine.assignISPConfig(routerDevId, routerPort);
          if (isp) {
            window.app?.notify(
              `🌐 ISP: IP ${isp.assignedIP} atribuído (GW: ${isp.gwIP})`, 'success'
            );
            // Refresh inspector / modal if open
            const routerDev = window.deviceManager.getDevice(routerDevId);
            if (routerDev) {
              window.inspector?.refresh(routerDevId);
              if (window.app?.activeModal === routerDevId) {
                window.app.renderTab(window.app.activeTab, routerDev);
              }
            }
          }
        }, 100);
      }

      // Recalculate conflicts after any connection
      setTimeout(() => {
        const conflicts = window.networkEngine.detectConflicts();
        if (conflicts.length > 0) {
          const errors = conflicts.filter(c => c.severity === 'error');
          const warns  = conflicts.filter(c => c.severity === 'warn');
          if (errors.length > 0) {
            window.app?.notify(`⚠️ ${errors.length} erro(s) de configuração detectado(s)`, 'error');
          } else if (warns.length > 0) {
            window.app?.notify(`⚠️ ${warns.length} aviso(s) de configuração`, 'warn');
          }
        }
      }, 200);
    };
  });
})();


/* ── 2. PATCH: simulate() ───────────────────────────────────
   Substitui o simulate cosmético por execução real do motor.
───────────────────────────────────────────────────────────── */
(function patchSimulate() {
  document.addEventListener('DOMContentLoaded', () => {
    const app = window.app;
    if (!app) { document.addEventListener('DOMContentLoaded', patchAppSimulate); return; }
    patchAppSimulate();
  });

  function patchAppSimulate() {
    if (!window.app) return;
    window.app.simulate = function() {
      const devices = window.deviceManager.getAllDevices();
      if (devices.length < 2) {
        this.notify('Adicione mais dispositivos para simular', 'warn');
        return;
      }

      document.getElementById('statusText').textContent = 'SIMULANDO...';
      document.getElementById('btnSimulate').classList.add('active');

      const report = window.networkEngine.runSimulation();
      window.networkEngine.populateARP();

      // Update canvas connections visual
      window.connectionManager.redraw();
      window.inspector?.refresh(window.app?.activeModal);

      // Show simulation report modal
      showSimulationReport(report);

      setTimeout(() => {
        document.getElementById('statusText').textContent =
          report.conflicts.some(c => c.severity === 'error') ? 'ERROS' : 'ONLINE';
        document.getElementById('btnSimulate').classList.remove('active');
      }, 800);
    };
  }
})();


/* ── 3. PATCH: Terminal.doPing ──────────────────────────────
   Substitui o ping dummy por simulação real de roteamento.
───────────────────────────────────────────────────────────── */
(function patchTerminalPing() {
  const _proto = window.Terminal?.prototype;
  if (!_proto) {
    document.addEventListener('DOMContentLoaded', () => {
      const proto = window.Terminal?.prototype;
      if (proto) applyPingPatch(proto);
    });
  } else {
    applyPingPatch(_proto);
  }

  function applyPingPatch(proto) {
    proto.doPing = function(target) {
      if (!target) { this.print(`% Incomplete command: ping <ip>`, 'error'); return; }

      this.print(`Type escape sequence to abort.`, 'info');
      this.print(`Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:`, 'info');

      const result = window.networkEngine.simulatePing(this.device.id, target);

      if (result.success) {
        const rtt    = result.rtt || '1/2/4';
        this.print(`!!!!!`, 'info');
        this.print(`Success rate is 100 percent (5/5), round-trip min/avg/max = ${rtt} ms`, 'info');
        if (result.hops?.length > 2) {
          this.print(`  Path: ${result.hops.map(h => h.ip || h.label).join(' → ')}`, 'muted');
        }
      } else {
        this.print(`.....`, 'error');
        this.print(`Success rate is 0 percent (0/5)`, 'error');
        this.print(`% ${result.reason}`, 'error');
      }
    };

    proto.doTraceroute = function(target) {
      if (!target) { this.print(`% Incomplete command`, 'error'); return; }
      this.print(`Type escape sequence to abort.`, 'info');
      this.print(`Tracing the route to ${target}:`, 'info');
      this.print(`VRF info: (vrf in name/id, vrf out name/id)`, 'muted');

      const result = window.networkEngine.simulateTraceroute(this.device.id, target);

      if (result.error) {
        this.print(`% ${result.error}`, 'error');
        return;
      }

      result.hops.forEach(hop => {
        this.print(`  ${hop.ttl}   ${hop.label} (${hop.ip})   ${hop.ms} msec  ${hop.ms + 1} msec  ${hop.ms} msec`, '');
      });
    };

    // Enhanced show ip route — uses real route table
    const _processShow = proto.processShow;
    proto.processShow = function(cmd, parts) {
      if (parts[1] === 'ip' && parts[2] === 'route') {
        this.showIPRouteReal();
        return;
      }
      if (parts[1] === 'arp') {
        this.showARPTable();
        return;
      }
      if (parts[1] === 'ip' && parts[2] === 'interface' && parts[3] === 'brief') {
        this.showIPInterfaceBriefReal();
        return;
      }
      _processShow.call(this, cmd, parts);
    };

    proto.showIPRouteReal = function() {
      window.networkEngine.buildRouteTable();
      const routes = window.networkEngine.routeTable.filter(r => r.deviceId === this.device.id);
      this.print(`Codes: L - local, C - connected, S - static, R - RIP, O - OSPF, B - BGP`, 'muted');
      this.print(`       * - candidate default, U - per-user static route`, 'muted');
      this.print(``, '');
      if (routes.length === 0) {
        this.print(`Gateway of last resort is not set`, 'info');
        return;
      }
      const defRoute = routes.find(r => r.dest === '0.0.0.0');
      if (defRoute) {
        this.print(`Gateway of last resort is ${defRoute.nexthop} to network 0.0.0.0`, 'info');
      }
      routes.forEach(r => {
        const cidr = window.networkEngine.maskToCIDR(r.mask);
        const nh   = r.nexthop ? ` via ${r.nexthop}` : ` is directly connected`;
        const iface = r.iface ? `, ${r.iface}` : '';
        this.print(`${r.src.padEnd(4)} ${r.dest}/${cidr} [${r.metric}/0]${nh}${iface}`, '');
      });
    };

    proto.showARPTable = function() {
      window.networkEngine.populateARP();
      this.print(`Protocol  Address          Age (min)  Hardware Addr   Type   Interface`, 'info');
      window.networkEngine.arpTable.forEach((entry, ip) => {
        if (entry.deviceId === this.device.id) {
          this.print(`Internet  ${ip.padEnd(17)}0          ${entry.mac}  ARPA   ${entry.iface}`, '');
        }
      });
    };

    proto.showIPInterfaceBriefReal = function() {
      const ifaces = this.device.config.interfaces || {};
      this.print(`Interface              IP-Address      OK? Method Status                Protocol`, 'info');
      Object.entries(ifaces).forEach(([name, iface]) => {
        const ip     = iface.ip || 'unassigned';
        const ok     = iface.ip ? 'YES' : 'NO ';
        const method = iface.ip ? 'manual' : 'unset ';
        const status = iface.status === 'up' ? 'up'
                     : iface.status === 'admin-down' ? 'administratively down' : 'down';
        const proto  = iface.status === 'up' ? 'up' : 'down';
        this.print(`${name.padEnd(23)}${ip.padEnd(16)}${ok}  ${method} ${status.padEnd(22)}${proto}`, '');
      });
    };

    // Enhanced VLAN validation on switchport command
    const _processCommand = proto.processCommand;
    proto.processCommand = function(cmd, raw) {
      // Intercept switchport access vlan to validate VLAN exists
      const parts = cmd.split(/\s+/);
      if (this.mode === 'interface' &&
          parts[0] === 'switchport' && parts[1] === 'access' && parts[2] === 'vlan') {
        const vlanId = parseInt(parts[3]);
        const vlans  = this.device.config.vlans || {};
        if (vlanId && !vlans[vlanId]) {
          this.print(`% Access VLAN does not exist. Creating vlan ${vlanId}`, 'warn');
          this.device.config.vlans[vlanId] = `VLAN${vlanId}`;
        }
      }

      // Intercept ip address to validate conflicts
      if (this.mode === 'interface' && parts[0] === 'ip' && parts[1] === 'address') {
        const ip   = parts[2];
        const mask = parts[3];
        if (ip && mask) {
          const conflicts = checkIPConflict(ip, this.device.id);
          if (conflicts.length > 0) {
            this.print(`% Warning: IP ${ip} já em uso em ${conflicts[0]}`, 'warn');
          }
          if (!window.networkEngine.isValidMask(mask)) {
            this.print(`% Bad mask ${mask} for address ${ip}`, 'error');
            return;
          }
        }
      }

      _processCommand.call(this, cmd, raw);

      // After any interface config, re-run conflict detection
      if (this.mode === 'interface' || this.mode === 'config') {
        setTimeout(() => window.networkEngine.detectConflicts(), 100);
      }
    };

    // Enhanced show help
    const _showHelp = proto.showHelp;
    proto.showHelp = function() {
      _showHelp.call(this);
      this.print(``, '');
      this.print(`  [NetSim extras]`, 'muted');
      this.print(`  show arp                — tabela ARP`, 'muted');
      this.print(`  show ip route           — tabela de roteamento real`, 'muted');
      this.print(`  show ip interface brief — status das interfaces`, 'muted');
    };

    function checkIPConflict(ip, ownDeviceId) {
      const conflicts = [];
      window.deviceManager.getAllDevices().forEach(dev => {
        if (dev.id === ownDeviceId) return;
        Object.entries(dev.config.interfaces || {}).forEach(([name, iface]) => {
          if (iface.ip === ip) conflicts.push(`${dev.label}/${name}`);
        });
      });
      return conflicts;
    }
  }
})();


/* ── 4. PATCH: addVLAN — validação real ─────────────────────
   Garante que VLAN ID 1 não pode ser deletada,
   IDs fora do range 2-4094 são rejeitados,
   e re-renderiza após criação.
───────────────────────────────────────────────────────────── */
(function patchVLAN() {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.app) return;

    const _addVLAN = window.app.addVLAN.bind(window.app);
    window.app.addVLAN = function(deviceId) {
      const id = parseInt(document.getElementById('cfg_vlanId')?.value?.trim());
      if (isNaN(id) || id < 2 || id > 4094) {
        this.notify('VLAN ID deve estar entre 2 e 4094', 'error');
        return;
      }
      const device = window.deviceManager.getDevice(deviceId);
      if (!device) return;
      if (device.config.vlans?.[id]) {
        this.notify(`VLAN ${id} já existe`, 'warn');
        return;
      }
      _addVLAN(deviceId);
      window.networkEngine.detectConflicts();
    };

    const _setIP = window.app.setIfaceIP.bind(window.app);
    window.app.setIfaceIP = function(deviceId, ifaceName, value) {
      if (value && !window.networkEngine.isValidIP(value)) {
        window.app?.notify(`IP inválido: ${value}`, 'error');
        return;
      }
      // Check for IP conflicts
      const conflicts = [];
      window.deviceManager.getAllDevices().forEach(dev => {
        if (dev.id === deviceId) return;
        Object.entries(dev.config.interfaces || {}).forEach(([name, iface]) => {
          if (iface.ip === value) conflicts.push(`${dev.label}/${name}`);
        });
      });
      if (conflicts.length > 0) {
        window.app?.notify(`⚠️ IP ${value} já em uso em ${conflicts[0]}`, 'error');
      }
      _setIP(deviceId, ifaceName, value);
      setTimeout(() => window.networkEngine.detectConflicts(), 100);
    };

    const _setMask = window.app.setIfaceMask.bind(window.app);
    window.app.setIfaceMask = function(deviceId, ifaceName, value) {
      if (value && !window.networkEngine.isValidMask(value)) {
        window.app?.notify(`Máscara inválida: ${value}`, 'error');
        return;
      }
      _setMask(deviceId, ifaceName, value);
      setTimeout(() => window.networkEngine.detectConflicts(), 100);
    };

    // Patch applyConfig to trigger conflict check
    const _applyConfig = window.app.applyConfig.bind(window.app);
    window.app.applyConfig = function(deviceId) {
      _applyConfig(deviceId);
      setTimeout(() => {
        const conflicts = window.networkEngine.detectConflicts();
        if (conflicts.some(c => c.severity === 'error')) {
          window.app?.notify(`⚠️ Configuração com erros — verifique o relatório`, 'error');
        }
      }, 150);
    };
  });
})();


/* ── 5. INSPECTOR: Network Status Tab ───────────────────────
   Adiciona aba "NETWORK" no inspector com estado L2/L3 real.
───────────────────────────────────────────────────────────── */
(function patchInspector() {
  document.addEventListener('DOMContentLoaded', () => {
    const inspector = window.inspector;
    if (!inspector) return;

    const _render = inspector.render.bind(inspector);
    inspector.render = function(device) {
      _render(device);

      // Add "NET" tab button if not present
      const panel = document.getElementById('inspectorContent');
      if (!panel) return;

      // Append network section after existing content
      const netSection = document.createElement('div');
      netSection.className = 'inspector-section';
      netSection.innerHTML = buildNetworkSection(device);
      panel.appendChild(netSection);
    };

    function buildNetworkSection(device) {
      if (!device?.config?.interfaces) return '';

      window.networkEngine.buildRouteTable();
      const conflicts = window.networkEngine.detectConflicts().filter(c =>
        c.devices?.includes(device.label)
      );

      const routeCount = window.networkEngine.routeTable.filter(r => r.deviceId === device.id).length;
      const neighbors  = window.networkEngine.getNeighbors(device.id);

      let html = `
        <div class="inspector-section-title">NETWORK STATUS</div>
      `;

      // L1 neighbors
      if (neighbors.length > 0) {
        html += `<div style="font-family:var(--font-mono);font-size:10px;margin-bottom:6px;">`;
        neighbors.forEach(n => {
          const iface = window.networkEngine.getIfaceByPortId(device, n.localPort);
          html += `
            <div style="display:flex;align-items:center;gap:6px;padding:2px 0;border-bottom:1px solid var(--border)">
              <div style="width:6px;height:6px;border-radius:50%;background:var(--accent-green);flex-shrink:0;"></div>
              <span style="color:var(--text-secondary)">${iface?.name || n.localPort}</span>
              <span style="color:var(--text-dim)">↔</span>
              <span>${n.neighbor.label}</span>
            </div>`;
        });
        html += `</div>`;
      }

      // Route count
      if (routeCount > 0) {
        html += `<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-secondary);margin-bottom:4px;">
          Rotas: <span style="color:var(--accent-cyan)">${routeCount}</span>
        </div>`;
      }

      // Conflicts for this device
      if (conflicts.length > 0) {
        html += `<div style="margin-top:4px;">`;
        conflicts.forEach(c => {
          const color = c.severity === 'error' ? 'var(--accent-red)' : 'var(--accent-yellow)';
          html += `<div style="font-family:var(--font-mono);font-size:9px;color:${color};padding:2px 0;border-left:2px solid ${color};padding-left:5px;margin-bottom:3px;">
            ${c.message}
          </div>`;
        });
        html += `</div>`;
      } else if (device.powered) {
        html += `<div style="font-family:var(--font-mono);font-size:10px;color:var(--accent-green);">✓ Sem conflitos</div>`;
      }

      return html;
    }
  });
})();


/* ── 6. SIMULATION REPORT MODAL ─────────────────────────────
   Exibe relatório detalhado após simulate().
───────────────────────────────────────────────────────────── */
function showSimulationReport(report) {
  // Remove existing report
  document.getElementById('simReportOverlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id    = 'simReportOverlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;
    display:flex;align-items:center;justify-content:center;
    animation:fadeIn 0.2s ease;
  `;

  const errCount  = report.conflicts.filter(c => c.severity === 'error').length;
  const warnCount = report.conflicts.filter(c => c.severity === 'warn').length;
  const status    = errCount > 0 ? 'error' : warnCount > 0 ? 'warn' : 'ok';
  const statusColor = status === 'ok' ? '#00ff88' : status === 'warn' ? '#ffcc00' : '#ff4444';
  const statusLabel = status === 'ok' ? 'ONLINE' : status === 'warn' ? 'AVISOS' : 'ERROS';

  const conflictHTML = report.conflicts.length === 0
    ? `<div style="color:#00ff88;font-family:var(--font-mono,monospace);font-size:12px;">✓ Nenhum conflito detectado</div>`
    : report.conflicts.map(c => `
        <div style="padding:6px 8px;margin-bottom:4px;border-left:3px solid ${c.severity==='error'?'#ff4444':'#ffcc00'};background:rgba(255,255,255,0.03);font-family:monospace;font-size:11px;">
          <span style="color:${c.severity==='error'?'#ff4444':'#ffcc00'}">[${c.severity.toUpperCase()}]</span>
          <span style="color:#aaccee;margin-left:6px;">${c.message}</span>
        </div>
      `).join('');

  const routeTable = window.networkEngine.routeTable;
  const routeHTML  = routeTable.length === 0
    ? `<div style="color:#334466;font-family:monospace;font-size:11px;">Nenhuma rota configurada</div>`
    : routeTable.slice(0, 20).map(r => {
        const dev   = r.deviceId ? window.deviceManager.getDevice(r.deviceId) : null;
        const cidr  = window.networkEngine.maskToCIDR(r.mask);
        const color = r.src === 'C' ? '#00ff88' : r.src === 'S*' ? '#00aaff' : '#aaccee';
        return `<div style="font-family:monospace;font-size:10px;padding:2px 0;color:${color};">
          ${r.src.padEnd(3)} ${r.dest}/${cidr}
          ${r.nexthop ? `→ ${r.nexthop}` : '(direct)'}
          ${dev ? `[${dev.label}]` : ''}
        </div>`;
      }).join('') + (routeTable.length > 20 ? `<div style="color:#334466;font-size:10px;font-family:monospace;">...+${routeTable.length-20} rotas</div>` : '');

  overlay.innerHTML = `
    <div style="
      background:#060d1a;
      border:1px solid #1a3060;
      border-top:3px solid ${statusColor};
      width:680px;max-width:95vw;max-height:85vh;
      overflow:hidden;display:flex;flex-direction:column;
      box-shadow:0 20px 60px rgba(0,0,0,0.8);
      font-family:'Rajdhani',sans-serif;color:#cce4ff;
    ">
      <!-- Header -->
      <div style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1a3060;">
        <div>
          <div style="font-family:'Orbitron',monospace;font-size:14px;letter-spacing:2px;color:${statusColor};">
            ▶ SIMULATION REPORT
          </div>
          <div style="font-size:12px;color:#6688aa;margin-top:2px;">
            ${report.summary.join(' · ')}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-family:monospace;font-size:11px;padding:4px 10px;border:1px solid ${statusColor};color:${statusColor};">
            ${statusLabel}
          </span>
          <button onclick="document.getElementById('simReportOverlay').remove()"
            style="background:none;border:1px solid #1a3060;color:#6688aa;padding:4px 10px;cursor:pointer;font-family:monospace;font-size:12px;">
            ✕
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div style="display:flex;border-bottom:1px solid #1a3060;" id="simTabBar">
        <button onclick="switchSimTab('conflicts')" class="simtab active" id="simtab-conflicts"
          style="padding:8px 16px;background:none;border:none;border-bottom:2px solid #00aaff;color:#00aaff;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:12px;letter-spacing:1px;">
          CONFLITOS ${report.conflicts.length > 0 ? `(${report.conflicts.length})` : ''}
        </button>
        <button onclick="switchSimTab('routes')" class="simtab" id="simtab-routes"
          style="padding:8px 16px;background:none;border:none;border-bottom:2px solid transparent;color:#6688aa;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:12px;letter-spacing:1px;">
          ROTAS (${routeTable.length})
        </button>
        <button onclick="switchSimTab('ping')" class="simtab" id="simtab-ping"
          style="padding:8px 16px;background:none;border:none;border-bottom:2px solid transparent;color:#6688aa;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:12px;letter-spacing:1px;">
          PING TEST
        </button>
      </div>

      <!-- Body -->
      <div style="flex:1;overflow-y:auto;padding:16px 20px;" id="simTabContent">
        <div id="simTab-conflicts">
          ${report.ispConfig ? `
            <div style="padding:8px 10px;margin-bottom:10px;background:rgba(0,170,255,0.07);border:1px solid #1a3060;border-left:3px solid #00aaff;">
              <div style="font-family:monospace;font-size:11px;color:#00aaff;">🌐 CONEXÃO ISP DETECTADA</div>
              <div style="font-family:monospace;font-size:11px;color:#aaccee;margin-top:3px;">
                IP Público: <strong style="color:#00ff88">${report.ispConfig.assignedIP}</strong>
                &nbsp;·&nbsp; Gateway: <strong>${report.ispConfig.gwIP}</strong>
              </div>
            </div>
          ` : ''}
          ${conflictHTML}
        </div>
        <div id="simTab-routes" style="display:none;">${routeHTML}</div>
        <div id="simTab-ping" style="display:none;">
          ${buildPingTestUI()}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

function switchSimTab(tab) {
  ['conflicts','routes','ping'].forEach(t => {
    const btn = document.getElementById(`simtab-${t}`);
    const pane = document.getElementById(`simTab-${t}`);
    if (!btn || !pane) return;
    const active = t === tab;
    btn.style.borderBottom = active ? '2px solid #00aaff' : '2px solid transparent';
    btn.style.color        = active ? '#00aaff' : '#6688aa';
    pane.style.display     = active ? 'block' : 'none';
  });
}
window.switchSimTab = switchSimTab;

function buildPingTestUI() {
  const devices = window.deviceManager.getAllDevices()
    .filter(d => d.powered && Object.values(d.config.interfaces || {}).some(i => i.ip));

  if (devices.length === 0) {
    return `<div style="color:#334466;font-family:monospace;font-size:11px;">Nenhum dispositivo com IP configurado para testar ping.</div>`;
  }

  const options = devices.map(d => `<option value="${d.id}">${d.label}</option>`).join('');

  return `
    <div style="margin-bottom:12px;">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;align-items:flex-end;">
        <div>
          <label style="font-size:10px;color:#6688aa;display:block;margin-bottom:3px;font-family:monospace;">ORIGEM</label>
          <select id="pingFrom" style="background:#0a1428;border:1px solid #1a3060;color:#cce4ff;padding:5px 8px;font-family:monospace;font-size:11px;min-width:140px;">
            ${options}
          </select>
        </div>
        <div style="flex:1;min-width:160px;">
          <label style="font-size:10px;color:#6688aa;display:block;margin-bottom:3px;font-family:monospace;">IP DESTINO</label>
          <input id="pingTo" placeholder="ex: 192.168.1.1"
            style="background:#0a1428;border:1px solid #1a3060;color:#cce4ff;padding:5px 8px;font-family:monospace;font-size:11px;width:100%;" />
        </div>
        <button onclick="runPingTest()"
          style="background:#0d2244;border:1px solid #00aaff;color:#00aaff;padding:6px 14px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:12px;letter-spacing:1px;white-space:nowrap;">
          ▶ PING
        </button>
      </div>
      <div id="pingResult" style="font-family:monospace;font-size:11px;min-height:60px;background:#020810;padding:8px;border:1px solid #0a1428;">
        <span style="color:#334466;">// aguardando teste...</span>
      </div>
    </div>
    <div style="font-size:10px;color:#334466;font-family:monospace;margin-top:4px;">
      Dica: use IPs de interfaces configuradas nos dispositivos acima
    </div>
  `;
}

function runPingTest() {
  const fromId = document.getElementById('pingFrom')?.value;
  const toIP   = document.getElementById('pingTo')?.value?.trim();
  const result = document.getElementById('pingResult');
  if (!fromId || !toIP || !result) return;

  const res   = window.networkEngine.simulatePing(fromId, toIP);
  const srcDev = window.deviceManager.getDevice(fromId);

  let html = '';
  if (res.success) {
    const rtt = res.rtt || '1/2/4';
    html = `
      <div style="color:#00ff88;">Sending 5 ICMP Echos to ${toIP}</div>
      <div style="color:#00ff88;">!!!!!</div>
      <div style="color:#aaccee;">Success rate 100% (5/5), rtt=${rtt} ms</div>
    `;
    if (res.hops?.length > 1) {
      html += `<div style="color:#6688aa;margin-top:4px;">Path: ${res.hops.map(h=>`${h.label}(${h.ip})`).join(' → ')}</div>`;
    }
  } else {
    html = `
      <div style="color:#ff4444;">Sending 5 ICMP Echos to ${toIP}</div>
      <div style="color:#ff4444;">.....</div>
      <div style="color:#ff4444;">Success rate 0% (0/5)</div>
      <div style="color:#ffcc00;margin-top:4px;">% ${res.reason}</div>
    `;
  }

  result.innerHTML = `
    <div style="color:#6688aa;margin-bottom:4px;">[${srcDev?.label || fromId}]$ ping ${toIP}</div>
    ${html}
  `;
}
window.runPingTest = runPingTest;


/* ── 7. CANVAS: Highlight connection health ─────────────────
   Modifica o redraw do ConnectionManager para colorir links
   baseado no estado real (L1 up, VLAN conflict, no IP, etc).
───────────────────────────────────────────────────────────── */
(function patchCanvasRedraw() {
  document.addEventListener('DOMContentLoaded', () => {
    const cm = window.connectionManager;
    if (!cm) return;

    const _redraw = cm.redraw?.bind(cm);
    if (!_redraw) return;

    // We patch the draw loop to color-code connections
    const _drawConnections = cm.drawConnections?.bind(cm);
    if (!cm.drawConnections) return;

    cm.drawConnections = function() {
      const ctx    = this.ctx;
      const canvas = this.canvas;
      if (!ctx || !canvas) return;

      this.connections.forEach(conn => {
        const p1 = this.getPortCenter(conn.from.deviceId, conn.from.portId);
        const p2 = this.getPortCenter(conn.to.deviceId,   conn.to.portId);
        if (!p1 || !p2) return;

        // Determine color based on network health
        let color    = '#1a3060'; // default: no-IP / off
        let lineWidth = 1.5;
        let dash     = [4, 4];

        const d1 = window.deviceManager.getDevice(conn.from.deviceId);
        const d2 = window.deviceManager.getDevice(conn.to.deviceId);

        if (d1?.powered && d2?.powered) {
          const i1 = window.networkEngine.getIfaceByPortId(d1, conn.from.portId);
          const i2 = window.networkEngine.getIfaceByPortId(d2, conn.to.portId);

          if (i1?.cfg?.status === 'up' && i2?.cfg?.status === 'up') {
            // Check if IPs are configured and on same subnet
            if (i1.cfg.ip && i2.cfg.ip) {
              const net1 = window.networkEngine.networkAddress(i1.cfg.ip, i1.cfg.mask);
              const net2 = window.networkEngine.networkAddress(i2.cfg.ip, i2.cfg.mask);
              color     = net1 === net2 ? '#00ff88' : '#ffcc00'; // green=ok, yellow=mismatch
              dash      = [];
              lineWidth = 2;
            } else {
              color     = '#00aaff'; // blue = L1 up, no IP
              dash      = [6, 3];
              lineWidth = 1.5;
            }
          } else {
            color     = '#334466'; // grey = admin down
            dash      = [2, 4];
          }
        }

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth   = lineWidth;
        ctx.setLineDash(dash);
        ctx.shadowColor = color;
        ctx.shadowBlur  = dash.length === 0 ? 6 : 2;

        // Bezier curve
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2 - 30;
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });
    };
  });
})();