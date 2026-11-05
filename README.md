# 🛡️ HomeShield

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?logo=node.js)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![DNS Protocol](https://img.shields.io/badge/DNS-UDP%20Port%2053-orange.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

**A lightweight, self-hosted DNS sinkhole & privacy proxy built with Node.js.**  
Block network-wide advertisements, tracking domains, and malware before they ever reach your devices.

[Features](#-features) • [How It Works](#-how-it-works) • [Quick Start](#-quick-start) • [Device Setup](#-client--device-setup) • [Configuration](#-configuration) • [Project Structure](#-project-structure) • [Roadmap](#-roadmap)

</div>

---

## 📖 Overview

**HomeShield** acts as your local network's first line of defense. By operating as an intermediary DNS proxy between your devices and upstream resolvers (like Google DNS or Cloudflare), HomeShield intercepts DNS queries in real time:

- **Advertisements & Trackers**: Instantly sinkholed with an `NXDOMAIN` response using a curated blocklist of 190,000+ domains.
- **Legitimate Requests**: Resolved through high-speed upstream DNS servers and cached in memory for near-instant subsequent lookups.
- **Zero Client Software Required**: Protects every device on your Wi-Fi (laptops, smartphones, smart TVs, IoT devices) without installing browser extensions or third-party apps.

---

## ⚡ How It Works

```mermaid
flowchart TD
    Client["📱 Client Device<br/>(Phone / PC / Smart TV)"] -->|1. UDP DNS Query (Port 53)| Proxy["🛡️ HomeShield Proxy<br/>(src/proxy.js)"]
    
    Proxy --> CheckList{"Blocked in<br/>blocklist.txt?"}
    
    CheckList -- "Yes (Ad / Tracker)" --> NXDomain["🚫 Return NXDOMAIN<br/>(Connection Dropped)"]
    NXDomain -->|Immediate Response| Client
    
    CheckList -- "No (Legitimate)" --> CheckCache{"Exists in<br/>RAM Cache?"}
    
    CheckCache -- "Cache Hit" --> ServeCache["⚡ Return Cached DNS Record"]
    ServeCache --> Client
    
    CheckCache -- "Cache Miss" --> Upstream["🌐 Query Upstream DNS<br/>(e.g., 8.8.8.8:53)"]
    Upstream --> StoreCache["💾 Save to Cache"]
    StoreCache --> ReturnUpstream["✅ Forward Result to Client"]
    ReturnUpstream --> Client
```

---

## ✨ Features

- 🚫 **Network-Wide Ad & Tracker Blocking**: Sinkholes telemetry, adware, and known malicious domains across all devices on the network.
- ⚡ **High-Speed In-Memory Caching**: Caches resolved records in memory to reduce upstream latency and accelerate browsing.
- 🎯 **Subdomain & Wildcard Matching**: Automatically blocks child subdomains (e.g. blocking `ads.example.com` when `example.com` is in the blocklist).
- 📱 **Device Identification**: Recognizes internal network IPs and maps them to friendly names (e.g. *My Laptop*, *My Phone*) via `devices.js`.
- 📊 **Query Logging & Tracking**: Built-in tracking engine (`tracker.js`) to capture total queries, block counts, timestamps, and client details.
- ⚙️ **Configurable Upstream Resolvers**: Seamlessly switch between Google (`8.8.8.8`), Cloudflare (`1.1.1.1`), Quad9 (`9.9.9.9`), or any custom upstream provider.
- 🖥️ **Web Dashboard Ready**: Structured to power an Express-based monitoring UI (`public/index.html` & `src/api/server.js`).

---

## 📁 Project Structure

```text
HomeShield/
├── blocklist.txt          # Over 190,000+ blocked ad and tracker domains
├── .env                   # Environment configuration (ports, upstream DNS)
├── .env.example           # Example environment template
├── package.json           # Dependencies, scripts, and package metadata
├── public/
│   └── index.html         # Frontend monitoring dashboard UI
└── src/
    ├── proxy.js           # Core DNS proxy & sinkhole engine (dns2)
    ├── server.js          # Standalone DNS listener test server
    ├── dns-client-test.js # Test script for testing local DNS resolution
    ├── upstream-test.js   # Diagnostic script for verifying upstream DNS
    ├── api/
    │   └── server.js      # REST API server for metrics and log streaming
    ├── config/
    │   └── devices.js     # IP-to-device friendly name mappings
    └── services/
        └── tracker.js     # Query statistics and recent activity logger
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (version **18.x** or higher recommended)
- **Administrator / Root privileges** (Required to bind to UDP Port 53)

### 1. Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/your-username/HomeShield.git
cd HomeShield
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` (or customize the existing `.env`):

```bash
cp .env.example .env
```

Default configuration (`.env`):
```env
PORT=53
UPSTREAM_DNS=8.8.8.8
UPSTREAM_PORT=53
```

### 3. Start the DNS Proxy

> [!IMPORTANT]
> Binding to standard DNS port **53** requires elevated privileges.
> - **Windows**: Run PowerShell or Command Prompt as **Administrator**.
> - **Linux / macOS**: Run with `sudo`.

```bash
# Start HomeShield DNS Proxy
npm start
```

You should see:
```text
🛡️ HomeShield DNS Proxy
Listening on 0.0.0.0:53 (all interfaces)
Upstream DNS: 8.8.8.8
```

---

## 🧪 Testing & Verification

### Using `nslookup`

Test resolution from your terminal by specifying HomeShield's address:

**1. Test a blocked domain (should return `NXDOMAIN` or no address):**
```bash
nslookup 000491b06a.com 127.0.0.1
```

**2. Test an allowed domain (should resolve properly):**
```bash
nslookup google.com 127.0.0.1
```

### Using Built-in Test Scripts

HomeShield includes testing scripts in `src/`:

```bash
# Verify upstream connectivity (Cloudflare 1.1.1.1):
npm run test:upstream

# Test local DNS proxy resolution:
npm run test:client
```

---

## 📱 Client & Device Setup

To route your traffic through HomeShield, update the DNS server settings on your devices or router to point to the host machine running HomeShield.

### Option A: Whole Network (Router Setup - Recommended)
1. Log into your home router's admin panel (typically `192.168.1.1` or `192.168.0.1`).
2. Navigate to **DHCP / LAN Settings** > **DNS Server**.
3. Set the Primary DNS to the local IP of the machine running HomeShield (e.g. `192.168.8.198`).
4. Save and reboot your router. Every device connected to your network is now shielded!

### Option B: Individual Device Setup

<details>
<summary><b>Windows 10 / 11</b></summary>

1. Open **Settings** > **Network & Internet** > **Wi-Fi** (or **Ethernet**).
2. Click on **Hardware properties**.
3. Under **DNS server assignment**, click **Edit**.
4. Select **Manual**, toggle **IPv4** on.
5. In **Preferred DNS**, enter your HomeShield host IP.
</details>

<details>
<summary><b>macOS</b></summary>

1. Open **System Settings** > **Network**.
2. Select your active network connection and click **Details...**.
3. Go to the **DNS** tab.
4. Click `+` and enter your HomeShield host IP at the top of the list.
</details>

<details>
<summary><b>Android / iOS</b></summary>

1. Open **Wi-Fi Settings** and tap the gear icon next to your network.
2. Change IP settings from **DHCP** to **Static** (or Configure DNS > Manual).
3. Set the DNS 1 server to your HomeShield machine's local IP address.
</details>

---

## 🔧 Customization & Configuration

### 1. Device Friendly Names (`src/config/devices.js`)
Map your local network IPs to human-readable names to identify traffic sources in your logs:

```javascript
module.exports = {
    "192.168.8.198": "Work Laptop",
    "192.168.8.199": "Personal iPhone",
    "192.168.8.200": "Living Room Smart TV",
    "127.0.0.1": "Localhost"
};
```

### 2. Updating Blocklists (`blocklist.txt`)
HomeShield uses a plain text file format containing one domain per line. You can append your own custom domains or replace the file with standard blocklists from reputable sources:
- [The Firebog AdguardDNS Filter](https://firebog.net/)
- [StevenBlack Unified Hosts](https://github.com/StevenBlack/hosts)
- [AdGuard SDNS Filter](https://github.com/AdguardTeam/AdGuardSDNSFilter)

---

## 🛠️ Troubleshooting

<details>
<summary><b>Error: EADDRINUSE: address already in use 0.0.0.0:53</b></summary>

Another service is already listening on port 53.
- **Windows**: Often caused by the `Internet Connection Sharing (ICS)` or `SharedAccess` service:
  ```powershell
  # Check which process is using port 53
  Get-Process -Id (Get-NetUDPEndpoint -LocalPort 53).OwningProcess
  
  # If it is SharedAccess, stop it:
  Stop-Service SharedAccess
  ```
- **Linux**: Often caused by `systemd-resolved`:
  ```bash
  sudo systemctl stop systemd-resolved
  ```
</details>

<details>
<summary><b>Error: EACCES: permission denied</b></summary>

Port 53 is a privileged port (< 1024). Make sure you run your terminal as **Administrator** (Windows) or use `sudo node src/proxy.js` (Linux/macOS).
</details>

<details>
<summary><b>DNS Changes not taking effect on client</b></summary>

Your operating system or browser may be caching previous DNS queries. Flush your DNS cache:
- **Windows**: `ipconfig /flushdns`
- **macOS**: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
- **Linux**: `sudo systemd-resolve --flush-caches`
</details>

---

## 🗺️ Roadmap

- [x] High-performance UDP DNS proxy with `dns2`
- [x] Blocklist integration with 190,000+ domains
- [x] Subdomain wildcard matching
- [x] In-memory response caching
- [x] Device IP identification (`devices.js`)
- [ ] Connect `tracker.js` live query metrics to `src/api/server.js`
- [ ] Interactive Web Dashboard (`public/index.html`) with query charts and block rate metrics
- [ ] Automated remote blocklist updating & cron schedules
- [ ] Whitelist overrides for false-positive exclusions
- [ ] Support for DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT) upstream resolution

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).

