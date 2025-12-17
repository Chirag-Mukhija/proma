"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Settings, Send, Paperclip, Check, Plus, UserPlus } from "lucide-react"
import apiClient from "@/lib/apiClient"
import { io } from "socket.io-client"
import { toast } from "sonner" // Assuming sonner or similar usage, if not I'll just use alert for now or add a simple toast logic if not present.
// Actually lets just use console logs or minimal alerts if ui/toast not found. Or standard Shadcn useToast.
// Since I don't see toast imported in previous files, I'll stick to basic alerts or console for success.

export default function ProjectWorkspacePage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msgInput, setMsgInput] = useState("")
  const [socket, setSocket] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load user from local storage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }

    // Fetch Project Details
    const loadProject = async () => {
      try {
        const { data } = await apiClient.get(`/projects/${projectId}`)
        setProject(data)
      } catch (err) {
        console.error("Failed to load project", err)
      }
    }
    loadProject()

    // Fetch Messages immediately if member? Or try anyway and handle 401/403 if API protected
    // Currently message route might return 403 if not member? Logic check:
    // messageController doesn't check membership explicitly in my code, but it should.
    // For now, load messages.
    const loadMessages = async () => {
      try {
        const { data } = await apiClient.get(`/messages/${projectId}`)
        setMessages(data)
      } catch (err) {
        console.error("Failed to load messages", err)
      }
    }
    loadMessages()

    // Socket Connection
    const token = localStorage.getItem('token')
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001", {
      auth: { token }
    })

    newSocket.on('connect', () => {
      console.log('Socket connected')
      newSocket.emit('joinProject', projectId)
    })

    newSocket.on('newMessage', (msg: any) => {
      setMessages((prev) => [...prev, msg])
      // Scroll to bottom
      if (scrollRef.current) {
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [projectId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  const handleSend = () => {
    if (!msgInput.trim() || !socket) return
    socket.emit('sendMessage', { projectId, content: msgInput })
    setMsgInput("")
  }

  const handleJoinRequest = async () => {
    try {
      await apiClient.post(`/projects/${projectId}/join`);
      // Refresh project to show pending status
      const { data } = await apiClient.get(`/projects/${projectId}`)
      setProject(data)
      alert("Join request sent!");
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to send request");
    }
  }

  const handleAcceptInvite = async (userId: string) => {
    try {
      await apiClient.post(`/projects/${projectId}/accept-invite`, { userId });
      // Refresh
      const { data } = await apiClient.get(`/projects/${projectId}`)
      setProject(data)
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleMakeAdmin = async (userId: string) => {
    try {
      await apiClient.post(`/projects/${projectId}/make-admin`, { userId });
      // Refresh
      const { data } = await apiClient.get(`/projects/${projectId}`)
      setProject(data)
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await apiClient.put(`/projects/${projectId}`, { status: newStatus });
      const { data } = await apiClient.get(`/projects/${projectId}`)
      setProject(data)
    } catch (e: any) {
      console.error(e);
    }
  }

  if (!project || !currentUser) return (
    <DashboardLayout>
      <div className="flex items-center justify-center p-10">Loading project...</div>
    </DashboardLayout>
  )

  const isAdmin = project.admins?.some((a: any) => {
    // DEBUG LOG
    console.log('Checking Admin:', a._id, currentUser._id, a._id === currentUser._id);
    return a._id === currentUser._id
  }) || false;

  const isMember = project.members?.some((m: any) => m._id === currentUser._id) || false;
  const isPending = project.joinRequests?.some((r: any) => r._id === currentUser._id) || false;

  console.log('Project Data:', project);
  console.log('Permissions:', { isAdmin, isMember, isPending, currentUser });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={project.status}
              onValueChange={handleStatusChange}
              disabled={!isAdmin}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={project.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {!isMember && !isPending && (
              <Button onClick={handleJoinRequest}>Request to Join</Button>
            )}
            {isPending && (
              <Button disabled variant="secondary">Request Pending</Button>
            )}
            {isAdmin && (
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Split View Layout */}
        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
          {/* Left/Center: Project Details & Admin Panel */}
          <div className="space-y-6">

            {/* Admin Panel for Join Requests */}
            {isAdmin && project.joinRequests && project.joinRequests.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="h-5 w-5" /> Join Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.joinRequests.map((req: any) => (
                    <div key={req._id} className="flex items-center justify-between bg-background p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{req.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{req.name}</p>
                          <p className="text-xs text-muted-foreground">{req.email}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAcceptInvite(req._id)} className="gap-2">
                        <Check className="h-4 w-4" /> Accept
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="glass-effect">
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Team Members</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.members && project.members.map((member: any, idx: number) => {
                      const isMemberAdmin = project.admins?.some((a: any) => a._id === member._id);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 border border-border group relative"
                        >
                          <Avatar className="h-7 w-7">
                            <AvatarFallback>{member.name ? member.name[0] : "?"}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium flex items-center gap-1">
                              {member.name}
                              {isMemberAdmin && <Badge variant="secondary" className="text-[10px] h-4 px-1">Admin</Badge>}
                            </span>
                          </div>
                          {isAdmin && !isMemberAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Promote to Admin"
                              onClick={() => handleMakeAdmin(member._id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            
          </div>

          {/* Right: Real-time Chat (Only for members) */}
          <Card className="glass-effect lg:sticky lg:top-6 h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Team Chat
                  {isMember && (
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                  )}
                </CardTitle>
                {isMember && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/50">
                    Live
                  </Badge>
                )}
              </div>
              <CardDescription>Real-time team communication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {isMember ? (
                <>
                  {/* Messages */}
                  <div className="space-y-3 h-[400px] overflow-y-auto pr-2 flex flex-col">
                    {messages.map((msg, i) => {
                      const isOwn = currentUser && msg.sender && currentUser._id === msg.sender._id
                      return (
                        <div key={msg._id || i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] space-y-1 ${isOwn ? "items-end" : "items-start"}`}>
                            {!isOwn && <p className="text-xs font-medium text-muted-foreground">{msg.sender?.name}</p>}
                            <div
                              className={`rounded-2xl px-4 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-accent border border-border"
                                }`}
                            >
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={scrollRef} />
                  </div>

                  <Separator />

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      className="flex-1"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button size="icon" className="shrink-0" onClick={handleSend}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-center p-4">
                  <p className="text-muted-foreground">You must be a member to view and send messages.</p>
                  {!isPending && <Button variant="link" onClick={handleJoinRequest}>Request to join</Button>}
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
