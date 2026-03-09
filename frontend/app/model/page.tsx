'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Brain, Cpu, Zap, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { getAvailableModels } from '@/lib/api'

const modelMetrics = {
  xgboost: { accuracy: 98.5, f1: 97.2, precision: 96.8, recall: 97.6, trainingTime: '45s', status: 'Active' },
  lightgbm: { accuracy: 97.8, f1: 96.5, precision: 95.9, recall: 97.1, trainingTime: '32s', status: 'Active' },
  random_forest: { accuracy: 96.2, f1: 94.8, precision: 94.1, recall: 95.5, trainingTime: '68s', status: 'Active' },
  logistic_regression: { accuracy: 94.5, f1: 92.1, precision: 91.5, recall: 92.8, trainingTime: '12s', status: 'Active' },
}

const radarData = [
  { metric: 'Accuracy', xgboost: 98.5, lightgbm: 97.8, random_forest: 96.2, logistic_regression: 94.5 },
  { metric: 'F1 Score', xgboost: 97.2, lightgbm: 96.5, random_forest: 94.8, logistic_regression: 92.1 },
  { metric: 'Precision', xgboost: 96.8, lightgbm: 95.9, random_forest: 94.1, logistic_regression: 91.5 },
  { metric: 'Recall', xgboost: 97.6, lightgbm: 97.1, random_forest: 95.5, logistic_regression: 92.8 },
  { metric: 'Speed', xgboost: 85, lightgbm: 95, random_forest: 60, logistic_regression: 98 },
  { metric: 'Scalability', xgboost: 90, lightgbm: 95, random_forest: 70, logistic_regression: 85 },
]

export default function ModelInsights() {
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await getAvailableModels()
        setAvailableModels(models)
        setError(null)
      } catch (e) {
        setError(`Failed to fetch models: ${e instanceof Error ? e.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }
    fetchModels()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Model Insights</h1>
            <p className="text-muted-foreground mt-2">Machine learning model performance and configuration</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
            <RefreshCw className="h-4 w-4" />
            Retrain Models
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(modelMetrics).map(([model, metrics]) => (
            <Card 
              key={model} 
              className={`border-border bg-card ${
                availableModels.includes(model) ? 'ring-2 ring-green-500/50' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {model.replace('_', ' ').toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Accuracy</span>
                    <span className="font-semibold text-foreground">{metrics.accuracy}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">F1 Score</span>
                    <span className="font-semibold text-foreground">{metrics.f1}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Training Time</span>
                    <span className="font-semibold text-foreground">{metrics.trainingTime}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`flex items-center gap-1 ${
                      availableModels.includes(model) ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {availableModels.includes(model) ? (
                        <><CheckCircle className="h-4 w-4" /> Active</>
                      ) : (
                        <><XCircle className="h-4 w-4" /> Unavailable</>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Model Comparison Bar Chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Model Accuracy Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'XGBoost', accuracy: 98.5, f1: 97.2 },
                  { name: 'LightGBM', accuracy: 97.8, f1: 96.5 },
                  { name: 'Random Forest', accuracy: 96.2, f1: 94.8 },
                  { name: 'Logistic Reg', accuracy: 94.5, f1: 92.1 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" domain={[90, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
                  <Bar dataKey="f1" fill="#22c55e" name="F1 Score %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Multi-Metric Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="metric" stroke="#888" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
                  <Radar name="XGBoost" dataKey="xgboost" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="LightGBM" dataKey="lightgbm" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Model Information */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Active Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">XGBoost (Default)</p>
                    <p className="text-sm text-muted-foreground">Best overall performance</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recommended for production. Highest accuracy and F1 score among all models.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Clock className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">LightGBM</p>
                    <p className="text-sm text-muted-foreground">Fastest training time</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Best for quick iterations. Good balance of speed and accuracy.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Cpu className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Random Forest</p>
                    <p className="text-sm text-muted-foreground">Most interpretable</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Good for debugging. Provides feature importance rankings.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Brain className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Logistic Regression</p>
                    <p className="text-sm text-muted-foreground">Baseline model</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Fastest inference. Good baseline for comparison.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

