"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts"

const pieData = [
  { name: "Completed", value: 3 },
  { name: "In Progress", value: 5 },
  { name: "Planning", value: 2 },
]

const barData = [
  { month: "Jan", joined: 2, completed: 1 },
  { month: "Feb", joined: 3, completed: 2 },
  { month: "Mar", joined: 1, completed: 3 },
  { month: "Apr", joined: 4, completed: 2 },
  { month: "May", joined: 2, completed: 4 },
]

const COLORS = ["oklch(0.65 0.18 150)", "oklch(0.55 0.18 264)", "oklch(0.75 0.16 85)"]

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Analytics</h1>
          <p className="text-muted-foreground mt-1">Your personal activity and contributions</p>
        </div>

        {/* Metric Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardDescription>Total Projects</CardDescription>
              <CardTitle className="text-4xl">10</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <span className="text-success">+2</span> this month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-4xl">3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">30% completion rate</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardDescription>Team Reach</CardDescription>
              <CardTitle className="text-4xl">24</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Unique team members</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>My Contribution</CardTitle>
              <CardDescription>Projects by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Activity Funnel</CardTitle>
              <CardDescription>Projects joined vs completed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="joined" fill="oklch(0.55 0.18 264)" name="Joined" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="oklch(0.65 0.18 150)" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
