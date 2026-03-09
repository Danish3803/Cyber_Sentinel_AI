'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, Laptop, Smartphone, Router, Wifi, Shield, AlertTriangle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const generateDevices = () => {
  const types = ['Server', 'Workstation', 'Laptop', 'Router', 'IoT Device']
  const os = ['Windows Server 2022', 'Ubuntu 22.04', 'Windows 11', 'macOS Sonoma', 'Linux Router']
  const statuses = ['Online', 'Online', 'Online', 'Warning', 'Offline']
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Device-${String(1000 + i)}`,
    type: types[Math.floor(Math.random() * types.length)],
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    mac: `${Math.floor(Math.random() * 255).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 255).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 255).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 255).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 255).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 255).toString(16).padStart(2, '0')}`,
    os: os[Math.floor(Math.random() * os.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastSeen: new Date(Date.now() - Math.random() * 3600000).toLocaleString(),
  }))
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Online':
      return 'bg-green-500/20 text-green-300'
    case 'Warning':
      return 'bg-yellow-500/20 text-yellow-300'
    case 'Offline':
      return 'bg-red-500/20 text-red-300'
    default:
      return 'bg-gray-500/20 text-gray-300'
  }
}

const getDeviceIcon = (type: string) => {
  if (type.includes('Server')) return Server
  if (type.includes('Laptop')) return Laptop
  if (type.includes('Router')) return Router
  if (type.includes('IoT')) return Wifi
  return Smartphone
}

export default function DevicesPage() {
  const [devices] = useState(generateDevices())
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDevices = devices.filter(device => 
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.ip.includes(searchTerm) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'Online').length,
    warning: devices.filter(d => d.status === 'Warning').length,
    offline: devices.filter(d => d.status === 'Offline').length,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Network Devices</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage connected network devices</p>
        </div>

        {/* Device Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Devices</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
                </div>
                <Server className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/30 bg-green-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Online</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{stats.online}</p>
                </div>
                <Wifi className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warning</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.warning}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Offline</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">{stats.offline}</p>
                </div>
                <Shield className="h-10 w-10 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-border bg-card mb-8">
          <CardContent className="pt-6">
            <input
              type="text"
              placeholder="Search by device name, IP, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-border bg-input text-foreground"
            />
          </CardContent>
        </Card>

        {/* Devices Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Connected Devices ({filteredDevices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-semibold">Device</TableHead>
                    <TableHead className="text-foreground font-semibold">IP Address</TableHead>
                    <TableHead className="text-foreground font-semibold">MAC Address</TableHead>
                    <TableHead className="text-foreground font-semibold">OS</TableHead>
                    <TableHead className="text-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-foreground font-semibold">Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.map((device) => {
                    const Icon = getDeviceIcon(device.type)
                    return (
                      <TableRow key={device.id} className="border-b border-border/50 hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Icon className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{device.name}</p>
                              <p className="text-sm text-muted-foreground">{device.type}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground font-mono text-sm">{device.ip}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">{device.mac}</TableCell>
                        <TableCell className="text-foreground">{device.os}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.status)}`}>
                            {device.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{device.lastSeen}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

