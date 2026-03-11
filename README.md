# ⬡ LabNetSim — Cisco Network Simulator

> Simulador educacional de equipamentos de redes baseado na Cisco, totalmente no navegador. Sem instalação, sem dependências — apenas um arquivo HTML.

![NetSim Screenshot](https://img.shields.io/badge/status-stable-brightgreen) ![HTML](https://img.shields.io/badge/tecnologia-HTML%20%2F%20CSS%20%2F%20JS-blue) ![Cisco](https://img.shields.io/badge/referência-Cisco%20IOS-1ba0d7) ![License](https://img.shields.io/badge/licença-MIT-lightgrey)

---

## 📋 Sobre o Projeto

O **LabNetSim** é um simulador de topologia de redes com interface visual inspirada nos equipamentos Cisco. Foi desenvolvido com propósito educacional para estudantes de redes e certificações como **CCNA**, **CCNP** e disciplinas de infraestrutura.

Com ele é possível:

- Montar topologias de rede arrastando dispositivos para um canvas interativo
- Conectar equipamentos por portas, como em um ambiente real
- Configurar cada dispositivo individualmente via formulários ou terminal CLI
- Simular o tráfego de pacotes pela rede com animações visuais
- Exportar a topologia configurada em JSON

---

## 🖥 Equipamentos Disponíveis

| Dispositivo | Modelo de Referência | Portas / Interfaces |
|---|---|---|
| **Router** | Cisco 2911 | Gi0/0–2, Se0/0/0–1, Console |
| **Edge Router** | Cisco ASR 1001 | 4× Gigabit, 2× TenGigabit, Console |
| **Switch L2** | Cisco Catalyst 2960 | 24× FastEthernet, 2× Gigabit (uplink) |
| **Switch L3** | Cisco Catalyst 3750 | 24× FastEthernet, 2× Gigabit, IP Routing |
| **Servidor** | Cisco UCS C220 | eth0, eth1, iLO/MGMT |
| **Firewall** | Cisco ASA 5506 | Outside, Inside, DMZ, Gi1/4, MGMT |
| **Access Point** | Cisco Aironet 3802 | Ethernet, Wi-Fi 2.4 GHz, Wi-Fi 5 GHz |
| **Rack** | Padrão 42U | — |
| **Cloud / ISP** | WAN / Internet | ISP Link 0, ISP Link 1 |

---

## 🚀 Como Usar

### Opção 1 — Direto no navegador

1. Baixe o arquivo `network-simulator.html`
2. Abra no navegador (Chrome, Firefox, Edge — qualquer um moderno)
3. Nenhuma instalação necessária

### Opção 2 — Clonar o repositório

```bash
git clone https://github.com/seu-usuario/netsim.git
cd netsim
# Abra o index.html no navegador ou sirva com qualquer servidor estático
python3 -m http.server 8080
```

---

## 🎮 Interface e Controles

### Painel Lateral (Componentes)

No lado esquerdo ficam todos os dispositivos disponíveis organizados por categoria. Para adicionar um equipamento ao canvas, basta **clicar e arrastar** o componente para a área de trabalho.

### Canvas Principal

A área central é onde você monta a topologia. Ela tem grade de referência e suporta:

| Ação | Como fazer |
|---|---|
| Adicionar dispositivo | Arrastar da sidebar para o canvas |
| Mover dispositivo | Clicar e arrastar no canvas |
| Selecionar dispositivo | Clique simples |
| Abrir configuração completa | Duplo clique |
| Abrir inspetor rápido | Clique simples (abre painel direito) |
| Menu de contexto | Botão direito do mouse |
| Deletar selecionado | Tecla `Delete` ou `Backspace` |
| Pan (mover canvas) | `Ctrl` + arrastar |
| Zoom | Scroll do mouse ou botões `+` / `-` |
| Reset zoom | Tecla `0` |

### Barra de Ferramentas

| Ferramenta | Tecla | Função |
|---|---|---|
| **Select** | `V` | Selecionar e mover dispositivos |
| **Connect** | `C` | Conectar portas entre dispositivos |
| **Delete** | — | Modo de exclusão (clique no device) |
| **Zoom In / Out** | `+` / `-` | Controle de zoom |

### Conectando Dispositivos

1. Selecione a ferramenta **Connect** (tecla `C`) ou permaneça no modo **Select**
2. Clique em uma **porta** (pequeno círculo nas bordas do dispositivo)
3. Clique na **porta de destino** em outro dispositivo
4. O cabo aparece automaticamente no canvas

> Cada porta suporta apenas uma conexão. Portas ocupadas ficam destacadas em verde.

---

## ⚙ Configuração dos Dispositivos

Ao dar **duplo clique** em qualquer dispositivo, abre o modal de configuração com 4 abas:

### Aba VISUAL

Exibe o **chassis 3D** do equipamento com LEDs de status reais. Dependendo do tipo:

- **Roteadores:** ports com LEDs verde/âmbar, display LCD, botão de power e reset
- **Switches:** grid de 24 portas com LEDs por porta, uplinks separados
- **Servidores:** unidades de disco, LEDs por slot, lista de serviços ativáveis
- **Firewalls:** zonas de segurança com nível de segurança visual (Outside/Inside/DMZ)
- **Access Points:** antenas e indicador de cobertura Wi-Fi

Clicar em uma **porta no chassis** alterna seu status (up/down) diretamente.

### Aba CONFIG

Formulários específicos por tipo de dispositivo:

**Roteadores:**
- Hostname e Enable Secret
- Ativar/desativar protocolos de roteamento (OSPF, RIP, BGP)
- NAT/PAT
- Rotas estáticas (adicionar e remover)
- Pool DHCP

**Switches:**
- Hostname
- Gerenciamento de VLANs (criar / excluir)
- Spanning Tree (STP)
- IP Routing (apenas Switch L3)
- VTP Domain

**Servidores:**
- Sistema Operacional
- Ativação de serviços: HTTP, HTTPS, FTP, SSH, DNS, DHCP, TFTP

**Firewall:**
- Firewall mode (routed / transparent)
- Interfaces com nameif e security-level

### Aba INTERFACES

Tabela completa de todas as interfaces do dispositivo com edição inline:

- **Endereço IP** e **Máscara de sub-rede**
- Status atual (up / down / admin-down)
- Botão `NO SHUT` / `SHUT` para ativar/desativar interface

### Aba TERMINAL

Terminal Cisco IOS simulado com suporte a comandos reais. Veja a seção [Terminal CLI](#-terminal-cisco-ios-simulado) abaixo.

---

## ⌨ Terminal Cisco IOS Simulado

O terminal emula o comportamento do Cisco IOS com suporte a múltiplos modos de operação:

```
Router> enable
Password: ****
Router# configure terminal
Router(config)# hostname MeuRouter
MeuRouter(config)# interface GigabitEthernet0/0
MeuRouter(config-if)# ip address 192.168.1.1 255.255.255.0
MeuRouter(config-if)# no shutdown
MeuRouter(config-if)# exit
MeuRouter(config)# ip route 0.0.0.0 0.0.0.0 192.168.1.254
MeuRouter(config)# end
MeuRouter# show ip interface brief
```

### Comandos Suportados

**Modo USER (`>`):**

```
enable               Entra no modo privilegiado
show version         Exibe informações do sistema
ping <ip>            Testa conectividade
exit                 Sai do modo atual
```

**Modo ENABLE (`#`):**

```
configure terminal   Entra no modo de configuração global
show version
show running-config
show ip interface brief
show interfaces
show ip route
show vlan
show cdp neighbors
show clock
ping <ip>
traceroute <ip>
copy running-config startup-config  (ou: wr)
reload
disable
```

**Modo CONFIG (`(config)#`):**

```
hostname <nome>
interface <tipo><slot/porta>      ex: interface Gi0/0 | int Fa0/1
ip route <dest> <mask> <nexthop>
router ospf <pid>
enable secret <senha>
vlan <id>
ip routing                         (Switch L3)
no ip domain-lookup
end | exit
```

**Modo INTERFACE (`(config-if)#`):**

```
ip address <ip> <mask>
no shutdown
shutdown
description <texto>
duplex <full|half|auto>
speed <10|100|1000|auto>
switchport mode <access|trunk>
switchport access vlan <id>
nameif <nome>                      (ASA)
security-level <0-100>             (ASA)
end | exit
```

**Dicas do terminal:**
- `?` ou `help` — lista comandos disponíveis no modo atual
- `↑ / ↓` — navega pelo histórico de comandos
- `Tab` — autocomplete básico
- `Ctrl+C` — cancela o comando atual
- `clear` — limpa a tela do terminal

> Credenciais padrão: Enable password: `cisco` | Enable secret: `class`

---

## 🔁 Simulação de Rede

Clique no botão **▶ SIMULATE** no cabeçalho para:

1. Ativar automaticamente todas as interfaces conectadas entre dispositivos ligados
2. Animar pacotes se movendo pelos cabos (visualização de tráfego)
3. Atualizar os LEDs de status no canvas

A simulação dura 5 segundos e pode ser iniciada repetidamente.

---

## 💾 Salvar Topologia

Clique em **SAVE** para exportar a topologia atual como arquivo `.json` contendo:

- Todos os dispositivos com posição, configurações e interfaces
- Todas as conexões entre portas

O arquivo pode ser usado para documentação ou para reimportar em versões futuras.

---

## 🖱 Menu de Contexto (Botão Direito)

Clique com o botão direito em qualquer dispositivo no canvas para acessar:

| Opção | Descrição |
|---|---|
| ⚙ Configurar | Abre o modal completo de configuração |
| 🔍 Inspecionar | Abre o painel de inspeção lateral |
| ✏ Renomear | Renomeia o dispositivo diretamente |
| ⏻ Ligar / Desligar | Alterna o estado de energia |
| ✕ Deletar | Remove o dispositivo e suas conexões |

---

## 🗂 Estrutura do Projeto

```
netsim/
├── network-simulator.html   ← Versão single-file (tudo embutido)
├── index.html               ← Versão modular (referencia os arquivos abaixo)
├── css/
│   └── main.css             ← Todos os estilos (tema dark, componentes, terminal)
└── js/
    ├── devices.js           ← Definições e instâncias dos dispositivos
    ├── canvas.js            ← Drag & drop, renderização de nodes, ferramentas
    ├── connections.js       ← Gerenciamento de cabos e animação de pacotes
    ├── inspector.js         ← Painel de inspeção lateral
    ├── terminal.js          ← Emulador de terminal Cisco IOS
    └── app.js               ← Controlador principal, modal e tabs
```

---

## 🛠 Tecnologias

- **HTML5 / CSS3 / JavaScript ES6+** — sem frameworks, sem dependências
- **Canvas API** — para renderização das conexões e animação de pacotes
- **CSS Custom Properties** — sistema de design tokens (cores, tipografia)
- **Google Fonts** — Orbitron, Rajdhani, Share Tech Mono
- **SVG inline** — ícones e chassis dos dispositivos

---

## 🎯 Casos de Uso Educacionais

- Aulas de redes de computadores (graduação e técnico)
- Preparação para certificação **Cisco CCNA / CCNP**
- Estudo de topologias (estrela, hierárquica, mesh)
- Aprendizado de endereçamento IP, VLAN e roteamento
- Demonstrações de conceitos como STP, NAT, OSPF
- Laboratório virtual quando não há acesso a equipamentos físicos ou ao Packet Tracer

---

## 🔮 Roadmap

- [ ] Importar topologia salva (carregar JSON)
- [ ] Suporte a DHCP simulado entre dispositivos
- [ ] Visualização de tabela de roteamento propagada
- [ ] Modo de quiz/avaliação para identificar erros de configuração
- [ ] Export para imagem PNG da topologia
- [ ] Temas de cores (light mode, alto contraste)
- [ ] Suporte mobile (toque)

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona novo dispositivo'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

<div align="center">
  <sub>Desenvolvido com fins educacionais · Não afiliado à Cisco Systems</sub>
</div>
