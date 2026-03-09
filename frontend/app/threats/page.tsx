'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Shield, AlertTriangle, Skull, Bug, Eye } from 'lucide-react'
import { fetchStats, type SystemStats } from '@/lib/api'

const threatData = [
  { threat: 'DDoS', score: 85, category: 'Network' },
  { threat: 'Malware', score: 72, category: 'Endpoint' },
  { threat: 'Phishing', score: 65, category: 'Social' },
  { threat: 'Ransomware', score: 78, category: 'Endpoint' },
  { threat: 'Insider Threat', score: 45, category: 'Insider' },
  { threat: 'APT', score: 82, category: 'Network' },
  { threat: 'Botnet', score: 58, category: 'Network' },
  { threat: 'Zero-day', score: 70, category: 'Endpoint' },
]

const topThreats = [
  { id: 1, name: 'DDoS Attack', severity: 'Critical', count: 1247, trend: '+23%' },
  { id: 2, name: 'Port Scanning', severity: 'High', count: 892, trend: '+12%' },
  { id: 3, name: 'Brute Force', severity: 'High', count: 654, trend: '+5%' },
  { id: 4, name: 'Malware Detection', severity: 'Critical', count: 423, trend: '+18%' },
  { id: 5, name: 'Suspicious Traffic', severity: 'Medium', count: 312, trend: '-8%' },
]

const mitigationStats = [
  { name: 'Blocked', value: 4521, fill: '#22c55e' },
  { name: 'Filtered', value: 1823, fill: '#f59e0b' },
  { name: 'Allowed', value: 8932, fill: '#3b82f6' },
  { name: 'Quarantined', value: 234, fill: '#ef4444' },
]

export default function ThreatIntelligence() {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Threat Intelligence</h1>
          <p className="text-muted-foreground mt-2">Comprehensive threat analysis and mitigation tracking</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Threat Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Threat Level</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">
                    {stats?.status === 'THREAT' ? 'HIGH' : 'NORMAL'}
                  </p>
                </div>
                <Skull className="h-10 w-10 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-orange-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Threats</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{stats?.attacks?.toLocaleString() || 0}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Threat Score</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">72/100</p>
                </div>
                <Eye className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/30 bg-green-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mitigated</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">
                    {((stats?.attacks || 0) * 2.5).toFixed(0)}
                  </p>
                </div>
                <Shield className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Threat Radar */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Threat Landscape</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={threatData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="threat" stroke="#888" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
                  <Radar
                    name="Threat Score"
                    dataKey="score"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mitigation Stats */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Mitigation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mitigationStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Threats Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Top Active Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topThreats.map((threat) => (
                <div
                  key={threat.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      threat.severity === 'Critical' ? 'bg-red-500/20' : 
                      threat.severity === 'High' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                    }`}>
                      <Bug className={`h-5 w-5 ${
                        threat.severity === 'Critical' ? 'text-red-400' : 
                        threat.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{threat.name}</p>
                      <p className="text-sm text-muted-foreground">{threat.severity} Severity</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{threat.count.toLocaleString()}</p>
                    <p className={`text-sm ${threat.trend.startsWith('+') ? 'text-red-400' : 'text-green-400'}`}>
                      {threat.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

