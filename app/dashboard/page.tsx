"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Check, X, MessageSquare, Eye, BarChart, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/apiClient"

const statusConfig = {
  planning: { label: "Planning", className: "bg-chart-5/20 text-chart-5-foreground border-chart-5" },
  "in-progress": { label: "In Progress", className: "bg-primary/20 text-primary-foreground border-primary" },
  completed: { label: "Completed", className: "bg-success/20 text-success-foreground border-success" },
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newProject, setNewProject] = useState({ title: "", description: "", status: "planning" })
  const [open, setOpen] = useState(false)

  const fetchData = async () => {
    try {
      const { data: projectsData } = await apiClient.get('/projects')
      setProjects(projectsData)

      const { data: analyticsData } = await apiClient.get('/analytics/user')
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateProject = async () => {
    try {
      await apiClient.post('/projects', newProject)
      setOpen(false)
      fetchData()
      setNewProject({ title: "", description: "", status: "planning" })
    } catch (error) {
      console.error("Failed to create project", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Analytics Section */}
        {analytics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.completionRate}%</div>
                <Progress value={analytics.completionRate} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Projects completed</p>
              </CardContent>
            </Card>
            <Card className="glass-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Reach</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.teamReach}</div>
                <p className="text-xs text-muted-foreground mt-2">Unique collaborators across all projects</p>
              </CardContent>
            </Card>
            <Card className="glass-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Distribution</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mt-1">
                  {analytics.distribution.map((d: any) => (
                    <Badge key={d._id} variant="secondary" className="text-xs">
                      {d._id}: {d.count}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Projects by status</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground mt-1">Manage and track your active projects</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project to your workspace. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe your project"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newProject.status}
                    onValueChange={(val) => setNewProject({ ...newProject, status: val })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="glass-effect hover:shadow-xl transition-all duration-300 group cursor-pointer border-border/50 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <Badge
                    variant="outline"
                    className={statusConfig[project.status as keyof typeof statusConfig]?.className || ""}
                  >
                    {statusConfig[project.status as keyof typeof statusConfig]?.label || project.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 leading-relaxed">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {project.status === 'completed' ? 100 : (project.status === 'in-progress' ? 50 : 0)}%
                    </span>
                  </div>
                  <Progress
                    value={project.status === 'completed' ? 100 : (project.status === 'in-progress' ? 50 : 0)}
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {project.members && (
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member: any, idx: number) => (
                        <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback>
                            {member.name ? member.name[0] : "?"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 3 && (
                        <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Join Request Indicator */}
                    {project.joinRequests && project.joinRequests.length > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        {project.joinRequests.length} Request{project.joinRequests.length > 1 ? 's' : ''}
                      </Badge>
                    )}

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/project/${project._id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && projects.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No projects found. Create one to get started!
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

