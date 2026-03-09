'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertTriangle, Bell, Filter, Search } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { fetchAlerts, type ApiAlert } from '@/lib/api'

const generateAlertData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    critical: Math.floor(Math.random() * 5),
    high: Math.floor(Math.random() * 10),
    medium: Math.floor(Math.random() * 15),
  }))
}

const getSeverityColor = (label: string) => {
  if (label === 'DDoS Attack') {
    return 'bg-red-500/20 text-red-300'
  }
  return 'bg-green-500/20 text-green-300'
}

const getStatusColor = (prediction: number) => {
  return prediction === 1 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
}

export default function Alerts() {
  const [alertData, setAlertData] = useState(generateAlertData())
  const [alerts, setAlerts] = useState<ApiAlert[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlertsData = async () => {
    try {
      const data = await fetchAlerts()
      setAlerts(data)
      setError(null)
    } catch (e) {
      setError(`Failed to fetch alerts: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlertsData()
    const interval = setInterval(fetchAlertsData, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setAlertData(generateAlertData())
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      (alert.source_ip?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (alert.destination_ip?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      alert.label.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const stats = {
    critical: alerts.filter(a => a.prediction === 1).length,
    high: alerts.filter(a => a.prediction === 1).length,
    medium: alerts.filter(a => a.prediction === 0).length,
    low: alerts.filter(a => a.prediction === 0).length,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Security Alerts</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage active security alerts</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Alert Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">DDoS Attacks</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{stats.critical}</p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-orange-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">High Risk</p>
              <p className="text-3xl font-bold text-orange-400 mt-2">{stats.high}</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Medium Risk</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.medium}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Normal Traffic</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{stats.low}</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert Timeline */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Alert Trends (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={alertData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alert Filters */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Alert Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by IP address or alert type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="text-foreground font-semibold">Timestamp</TableHead>
                      <TableHead className="text-foreground font-semibold">Source IP</TableHead>
                      <TableHead className="text-foreground font-semibold">Destination IP</TableHead>
                      <TableHead className="text-foreground font-semibold">Protocol</TableHead>
                      <TableHead className="text-foreground font-semibold">Model Used</TableHead>
                      <TableHead className="text-foreground font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.slice(0, 50).map((alert, index) => (
                      <TableRow key={`${alert.timestamp}-${index}`} className="border-b border-border/50 hover:bg-muted/50">
                        <TableCell className="text-muted-foreground text-sm font-mono">
                          {new Date(alert.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-foreground font-mono text-sm">{alert.source_ip || 'N/A'}</TableCell>
                        <TableCell className="text-foreground font-mono text-sm">{alert.destination_ip || 'N/A'}</TableCell>
                        <TableCell className="text-foreground">{alert.protocol || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{alert.model_used}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.label)}`}>
                            {alert.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

