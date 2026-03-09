'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings, Bell, Shield, Database, Network, Key, Save, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    criticalAlerts: true,
    weeklyReport: false,
  })
  
  const [thresholds, setThresholds] = useState({
    attackRatio: 30,
    minPacketsPerSec: 1000,
    maxFlowDuration: 300000,
  })

  const [apiSettings, setApiSettings] = useState({
    backendUrl: 'http://127.0.0.1:5000',
    refreshInterval: 2000,
    maxAlerts: 200,
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Configure system preferences and integrations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-foreground">Notifications</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Manage how you receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch 
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Critical Alerts</p>
                  <p className="text-sm text-muted-foreground">Immediate alerts for critical threats</p>
                </div>
                <Switch 
                  checked={notifications.criticalAlerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, criticalAlerts: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Receive weekly security summaries</p>
                </div>
                <Switch 
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => setNotifications({...notifications, weeklyReport: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-400" />
                <CardTitle className="text-foreground">Security</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Configure threat detection thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Attack Detection Threshold (%)</label>
                <p className="text-xs text-muted-foreground mb-2">Percentage of attacks in recent flows to trigger alert</p>
                <Input 
                  type="number"
                  value={thresholds.attackRatio}
                  onChange={(e) => setThresholds({...thresholds, attackRatio: parseInt(e.target.value)})}
                  className="bg-input border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Min Packets/sec</label>
                <p className="text-xs text-muted-foreground mb-2">Minimum packets per second for detection</p>
                <Input 
                  type="number"
                  value={thresholds.minPacketsPerSec}
                  onChange={(e) => setThresholds({...thresholds, minPacketsPerSec: parseInt(e.target.value)})}
                  className="bg-input border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Max Flow Duration (ms)</label>
                <p className="text-xs text-muted-foreground mb-2">Maximum flow duration before timeout</p>
                <Input 
                  type="number"
                  value={thresholds.maxFlowDuration}
                  onChange={(e) => setThresholds({...thresholds, maxFlowDuration: parseInt(e.target.value)})}
                  className="bg-input border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Network className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-foreground">API Configuration</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Configure backend connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Backend URL</label>
                <Input 
                  type="text"
                  value={apiSettings.backendUrl}
                  onChange={(e) => setApiSettings({...apiSettings, backendUrl: e.target.value})}
                  className="bg-input border-border mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Refresh Interval (ms)</label>
                <Input 
                  type="number"
                  value={apiSettings.refreshInterval}
                  onChange={(e) => setApiSettings({...apiSettings, refreshInterval: parseInt(e.target.value)})}
                  className="bg-input border-border mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Max Alerts Stored</label>
                <Input 
                  type="number"
                  value={apiSettings.maxAlerts}
                  onChange={(e) => setApiSettings({...apiSettings, maxAlerts: parseInt(e.target.value)})}
                  className="bg-input border-border mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-foreground">Data Management</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Manage stored data and models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                <div>
                  <p className="font-medium text-foreground">Clear Alert History</p>
                  <p className="text-sm text-muted-foreground">Remove all stored alerts</p>
                </div>
                <Button variant="outline" size="sm">Clear</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                <div>
                  <p className="font-medium text-foreground">Export Logs</p>
                  <p className="text-sm text-muted-foreground">Download system logs as CSV</p>
                </div>
                <Button variant="outline" size="sm">Export</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                <div>
                  <p className="font-medium text-foreground">Retrain Models</p>
                  <p className="text-sm text-muted-foreground">Re-train ML models with latest data</p>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retrain
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

