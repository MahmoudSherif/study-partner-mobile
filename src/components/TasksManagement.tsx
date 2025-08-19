import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Task, Challenge, Subject, TaskProgress } from '@/lib/types'
import { 
  Plus, 
  Check, 
  Clock, 
  Flag, 
  Users, 
  Trophy,
  Calendar,
  Target,
  X,
  Copy,
  Share
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TasksManagementProps {
  tasks: Task[]
  challenges: Challenge[]
  subjects: Subject[]
  taskProgress: TaskProgress
  currentUserId: string
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onCreateChallenge: (challenge: Omit<Challenge, 'id' | 'createdAt'>) => void
  onJoinChallenge: (code: string) => void
  onAddChallengeTask: (challengeId: string, task: Omit<import('@/lib/types').ChallengeTask, 'id' | 'createdAt' | 'completedBy'>) => void
  onToggleChallengeTask: (challengeId: string, taskId: string) => void
  onSwitchProgressView: () => void
}

export function TasksManagement({
  tasks,
  challenges,
  subjects,
  taskProgress,
  currentUserId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onCreateChallenge,
  onJoinChallenge,
  onAddChallengeTask,
  onToggleChallengeTask,
  onSwitchProgressView
}: TasksManagementProps) {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false)
  const [isJoiningChallenge, setIsJoiningChallenge] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'challenges'>('tasks')
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    subjectId: '',
    estimatedTime: '',
    dueDate: ''
  })
  
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    endDate: ''
  })

  const [newChallengeTask, setNewChallengeTask] = useState({
    title: '',
    description: '',
    points: 10
  })

  const todayTasks = tasks.filter(task => {
    const today = new Date()
    const taskDate = new Date(task.createdAt)
    return taskDate.toDateString() === today.toDateString()
  })

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const task: Omit<Task, 'id' | 'createdAt'> = {
      title: newTask.title,
      description: newTask.description || undefined,
      completed: false,
      priority: newTask.priority,
      subjectId: newTask.subjectId || undefined,
      estimatedTime: newTask.estimatedTime ? parseInt(newTask.estimatedTime) : undefined,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined
    }

    onAddTask(task)
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      subjectId: '',
      estimatedTime: '',
      dueDate: ''
    })
    setIsAddingTask(false)
    toast.success('Task added successfully!')
  }

  const handleCreateChallenge = () => {
    if (!newChallenge.title.trim()) {
      toast.error('Please enter a challenge title')
      return
    }

    const challenge: Omit<Challenge, 'id' | 'createdAt'> = {
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      title: newChallenge.title,
      description: newChallenge.description,
      createdBy: currentUserId,
      participants: [currentUserId],
      tasks: [],
      isActive: true,
      endDate: newChallenge.endDate ? new Date(newChallenge.endDate) : undefined
    }

    onCreateChallenge(challenge)
    setNewChallenge({
      title: '',
      description: '',
      endDate: ''
    })
    setIsCreatingChallenge(false)
    toast.success('Challenge created successfully!')
  }

  const handleJoinChallenge = () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a challenge code')
      return
    }

    onJoinChallenge(joinCode.toUpperCase())
    setJoinCode('')
    setIsJoiningChallenge(false)
  }

  const handleAddChallengeTask = () => {
    if (!selectedChallenge || !newChallengeTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    onAddChallengeTask(selectedChallenge, {
      title: newChallengeTask.title,
      description: newChallengeTask.description || undefined,
      points: newChallengeTask.points
    })

    setNewChallengeTask({
      title: '',
      description: '',
      points: 10
    })
    toast.success('Challenge task added!')
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Challenge code copied to clipboard!')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getSubjectName = (subjectId?: string) => {
    return subjectId ? subjects.find(s => s.id === subjectId)?.name : 'General'
  }

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Today's Progress</h3>
          {taskProgress.challengeProgress && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchProgressView}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Target size={16} className="mr-2" />
              Switch View
            </Button>
          )}
        </div>

        <div className="bg-white/10 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/80">Daily Tasks</span>
            <span className="text-white font-medium">
              {taskProgress.dailyTasks.completed}/{taskProgress.dailyTasks.total}
            </span>
          </div>
          <Progress 
            value={taskProgress.dailyTasks.percentage} 
            className="h-2 bg-white/20"
          />
          
          {taskProgress.challengeProgress && (
            <>
              <div className="flex items-center justify-between mt-4">
                <span className="text-white/80">{taskProgress.challengeProgress.challengeTitle}</span>
                <span className="text-white font-medium">
                  #{taskProgress.challengeProgress.userRank}/{taskProgress.challengeProgress.totalParticipants}
                </span>
              </div>
              <Progress 
                value={taskProgress.challengeProgress.percentage} 
                className="h-2 bg-white/20"
              />
            </>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tasks' | 'challenges')}>
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger value="tasks" className="text-white data-[state=active]:bg-white/20">
            <Clock size={16} className="mr-2" />
            My Tasks
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-white data-[state=active]:bg-white/20">
            <Users size={16} className="mr-2" />
            Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Add Task Button */}
          <div className="flex gap-2">
            <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 text-primary-foreground">
                  <Plus size={16} className="mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 backdrop-blur-md border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newTask.subjectId} onValueChange={(value) => setNewTask({ ...newTask, subjectId: value })}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Subject (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Est. time (min)"
                      value={newTask.estimatedTime}
                      onChange={(e) => setNewTask({ ...newTask, estimatedTime: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddTask} className="flex-1 bg-primary hover:bg-primary/80">
                      Add Task
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingTask(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Clock size={48} className="mx-auto mb-4" />
                <p>No tasks for today. Add one to get started!</p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`bg-white/10 rounded-lg p-4 border border-white/20 ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-1 p-1 h-6 w-6 rounded-full border-2 ${
                        task.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      {task.completed && <Check size={12} />}
                    </Button>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-white/60' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteTask(task.id)}
                          className="text-white/60 hover:text-red-400 p-1 h-6 w-6"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-white/70">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getPriorityColor(task.priority)}>
                          <Flag size={12} className="mr-1" />
                          {task.priority}
                        </Badge>
                        
                        {task.subjectId && (
                          <Badge variant="outline" className="border-white/30 text-white/80">
                            {getSubjectName(task.subjectId)}
                          </Badge>
                        )}
                        
                        {task.estimatedTime && (
                          <Badge variant="outline" className="border-white/30 text-white/80">
                            <Clock size={12} className="mr-1" />
                            {task.estimatedTime}m
                          </Badge>
                        )}
                        
                        {task.dueDate && (
                          <Badge variant="outline" className="border-white/30 text-white/80">
                            <Calendar size={12} className="mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          {/* Challenge Actions */}
          <div className="flex gap-2">
            <Dialog open={isCreatingChallenge} onOpenChange={setIsCreatingChallenge}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 text-primary-foreground">
                  <Plus size={16} className="mr-2" />
                  Create Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 backdrop-blur-md border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Challenge</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Challenge title"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Textarea
                    placeholder="Challenge description"
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    type="date"
                    placeholder="End date (optional)"
                    value={newChallenge.endDate}
                    onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateChallenge} className="flex-1 bg-primary hover:bg-primary/80">
                      Create Challenge
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreatingChallenge(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isJoiningChallenge} onOpenChange={setIsJoiningChallenge}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Users size={16} className="mr-2" />
                  Join Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 backdrop-blur-md border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Join Challenge</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter challenge code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleJoinChallenge} className="flex-1 bg-primary hover:bg-primary/80">
                      Join Challenge
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsJoiningChallenge(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Challenges List */}
          <div className="space-y-4">
            {challenges.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Trophy size={48} className="mx-auto mb-4" />
                <p>No challenges yet. Create or join one to get started!</p>
              </div>
            ) : (
              challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <Trophy size={16} />
                          {challenge.title}
                        </h4>
                        <p className="text-sm text-white/70 mt-1">{challenge.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                          <span>{challenge.participants.length} participants</span>
                          {challenge.endDate && (
                            <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyInviteCode(challenge.code)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Copy size={12} className="mr-1" />
                          {challenge.code}
                        </Button>
                      </div>
                    </div>

                    {/* Challenge Tasks */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Tasks</span>
                        {challenge.createdBy === currentUserId && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedChallenge(challenge.id)}
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <Plus size={12} className="mr-1" />
                                Add Task
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-black/80 backdrop-blur-md border-white/20 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-white">Add Challenge Task</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="Task title"
                                  value={newChallengeTask.title}
                                  onChange={(e) => setNewChallengeTask({ ...newChallengeTask, title: e.target.value })}
                                  className="bg-white/10 border-white/20 text-white"
                                />
                                <Textarea
                                  placeholder="Task description"
                                  value={newChallengeTask.description}
                                  onChange={(e) => setNewChallengeTask({ ...newChallengeTask, description: e.target.value })}
                                  className="bg-white/10 border-white/20 text-white"
                                />
                                <Input
                                  type="number"
                                  placeholder="Points"
                                  value={newChallengeTask.points}
                                  onChange={(e) => setNewChallengeTask({ ...newChallengeTask, points: parseInt(e.target.value) || 10 })}
                                  className="bg-white/10 border-white/20 text-white"
                                />
                                <Button onClick={handleAddChallengeTask} className="w-full bg-primary hover:bg-primary/80">
                                  Add Task
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                      
                      {challenge.tasks.map((task) => (
                        <div key={task.id} className="bg-white/5 rounded p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onToggleChallengeTask(challenge.id, task.id)}
                              className={`p-1 h-6 w-6 rounded-full border-2 ${
                                task.completedBy.includes(currentUserId)
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-white/30 hover:border-white/50'
                              }`}
                            >
                              {task.completedBy.includes(currentUserId) && <Check size={12} />}
                            </Button>
                            <div>
                              <span className={`text-sm ${task.completedBy.includes(currentUserId) ? 'line-through text-white/60' : 'text-white'}`}>
                                {task.title}
                              </span>
                              {task.description && (
                                <p className="text-xs text-white/60">{task.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <span>{task.points} pts</span>
                            <span>{task.completedBy.length}/{challenge.participants.length}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}