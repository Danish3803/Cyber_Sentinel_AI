'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Target } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchStats, type SystemStats } from '@/lib/api'

const attackTimelineData = [
  { time: '00:00', ddos: 5, portScan: 8, bruteForce: 3, botnet: 1 },
  { time: '04:00', ddos: 12, portScan: 15, bruteForce: 6, botnet: 2 },
  { time: '08:00', ddos: 8, portScan: 10, bruteForce: 4, botnet: 1 },
  { time: '12:00', ddos: 18, portScan: 22, bruteForce: 9, botnet: 4 },
  { time: '16:00', ddos: 14, portScan: 18, bruteForce: 7, botnet: 3 },
  { time: '20:00', ddos: 21, portScan: 25, bruteForce: 11, botnet: 5 },
  { time: '23:59', ddos: 28, portScan: 32, bruteForce: 14, botnet: 7 },
]

const attackDistribution = [
  { name: 'DDoS', value: 38, fill: '#ef4444' },
  { name: 'Port Scan', value: 28, fill: '#f59e0b' },
  { name: 'Brute Force', value: 22, fill: '#8b5cf6' },
  { name: 'Botnet', value: 12, fill: '#ec4899' },
]

const generateTopIps = () => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    ip: `${192 + Math.floor(i / 64)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    attacks: Math.floor(Math.random() * 150) + 20,
    type: ['DDoS', 'Port Scan', 'Brute Force', 'Botnet'][Math.floor(Math.random() * 4)],
  }))
}

const generateTargetServers = () => {
  return Array.from({ length: 6 }, (_, i) => ({
    id: i,
    server: `Server-${String.fromCharCode(65 + i)}`,
    targetCount: Math.floor(Math.random() * 200) + 50,
    lastAttack: new Date(Date.now() - Math.random() * 3600000).toLocaleString(),
    status: Math.random() > 0.3 ? 'Protected' : 'Under Attack',
  }))
}

export default function AttackAnalytics() {
  const [topIps, setTopIps] = useState(generateTopIps())
  const [targetServers, setTargetServers] = useState(generateTargetServers())
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
    const interval = setInterval(fetchStatsData, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTopIps(generateTopIps())
      setTargetServers(generateTargetServers())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const totalAttacks = stats?.attacks || attackDistribution.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Attack Analytics</h1>
          <p className="text-muted-foreground mt-2">Comprehensive threat pattern analysis and attack tracking</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Attacks (Today)</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">{stats?.attacks?.toLocaleString() || totalAttacks}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/20">
                  <Target className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attack Ratio</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">
                    {stats ? `${(stats.recent_attack_ratio * 100).toFixed(1)}%` : '0%'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/20">
                  <TrendingUp className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attack Type Distribution */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Attack Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attackDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attackDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attacks Over Time */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Attack Timeline (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attackTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                  <Line type="monotone" dataKey="ddos" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="portScan" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="bruteForce" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="botnet" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Attacking IPs */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Top Attacking IP Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topIps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="ip" angle={-45} textAnchor="end" height={100} stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Bar dataKey="attacks" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Targeted Servers */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Most Targeted Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-semibold">Server Name</TableHead>
                    <TableHead className="text-foreground font-semibold text-right">Target Count</TableHead>
                    <TableHead className="text-foreground font-semibold">Last Attack</TableHead>
                    <TableHead className="text-foreground font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetServers.map((server) => (
                    <TableRow key={server.id} className="border-b border-border/50 hover:bg-muted/50">
                      <TableCell className="text-foreground font-medium">{server.server}</TableCell>
                      <TableCell className="text-foreground text-right font-mono">{server.targetCount}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{server.lastAttack}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          server.status === 'Protected' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {server.status}
                        </span>
                      </TableCell>
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

