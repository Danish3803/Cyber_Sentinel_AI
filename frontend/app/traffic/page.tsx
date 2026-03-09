'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Activity, Download, Upload, Zap } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchStats, type SystemStats } from '@/lib/api'

const generatePacketData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${String((i % 2) * 30).padStart(2, '0')}`,
    pps: Math.floor(Math.random() * 8000) + 2000,
  }))
}

const generateTrafficSamples = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    destIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    protocol: ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)],
    packetSize: Math.floor(Math.random() * 1500) + 64,
    timestamp: new Date(Date.now() - Math.random() * 60000).toLocaleTimeString(),
  }))
}

const protocolStats = [
  { name: 'TCP', value: 45, fill: '#3b82f6' },
  { name: 'UDP', value: 35, fill: '#f59e0b' },
  { name: 'ICMP', value: 12, fill: '#ef4444' },
  { name: 'DNS', value: 8, fill: '#8b5cf6' },
]

export default function TrafficMonitor() {
  const [packetData, setPacketData] = useState(generatePacketData())
  const [samples, setSamples] = useState(generateTrafficSamples())
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatsData = async () => {
    try {
      const data = await fetchStats()
      setStats(data)
      setError(null)
    } catch (e) {
      setError(`Failed to fetch stats: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatsData()
    const interval = setInterval(fetchStatsData, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPacketData(generatePacketData())
      setSamples(generateTrafficSamples())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const displayStats = stats || {
    packetsPerSec: 0,
    bytesPerSec: 0,
    activeConnections: 0,
    total_flows: 0,
    normal: 0,
    attacks: 0,
    recent_attack_ratio: 0,
    status: 'SAFE'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Network Traffic Monitor</h1>
          <p className="text-muted-foreground mt-2">Real-time packet analysis and traffic flow visualization</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Live Stats from Backend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Flows</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{displayStats.total_flows.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Normal Traffic</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{displayStats.normal.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Download className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attacks Detected</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">{displayStats.attacks.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-lg ${displayStats.status === 'THREAT' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  <Activity className={`h-6 w-6 ${displayStats.status === 'THREAT' ? 'text-red-400' : 'text-green-400'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Packets Per Second */}
          <Card className="col-span-1 lg:col-span-2 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Packets Per Second (Last 15 minutes)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={packetData}>
                  <defs>
                    <linearGradient id="colorPps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Area type="monotone" dataKey="pps" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPps)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Protocol Distribution */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Protocol Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={protocolStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {protocolStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Live Packet Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Live Packet Stream (Last 10 packets)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-semibold">Source IP</TableHead>
                    <TableHead className="text-foreground font-semibold">Destination IP</TableHead>
                    <TableHead className="text-foreground font-semibold">Protocol</TableHead>
                    <TableHead className="text-foreground font-semibold text-right">Packet Size (bytes)</TableHead>
                    <TableHead className="text-foreground font-semibold">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {samples.map((packet) => (
                    <TableRow key={packet.id} className="border-b border-border/50 hover:bg-muted/50">
                      <TableCell className="text-foreground font-mono text-sm">{packet.sourceIp}</TableCell>
                      <TableCell className="text-foreground font-mono text-sm">{packet.destIp}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          packet.protocol === 'TCP' ? 'bg-blue-500/20 text-blue-300' :
                          packet.protocol === 'UDP' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {packet.protocol}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground text-right font-mono">{packet.packetSize}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{packet.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

