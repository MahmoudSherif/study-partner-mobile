import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash, Palette } from '@phosphor-icons/react'
import { Subject } from '@/lib/types'
import { SUBJECT_COLORS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'

interface SubjectManagementProps {
  subjects: Subject[]
  onAddSubject: (subject: Omit<Subject, 'id'>) => void
  onDeleteSubject: (id: string) => void
  onSelectSubject: (subject: Subject) => void
  selectedSubject: Subject | null
}

export function SubjectManagement({ 
  subjects, 
  onAddSubject, 
  onDeleteSubject,
  onSelectSubject,
  selectedSubject 
}: SubjectManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0])

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      onAddSubject({
        name: newSubjectName.trim(),
        color: selectedColor,
        totalTime: 0
      })
      setNewSubjectName('')
      setSelectedColor(SUBJECT_COLORS[0])
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Study Subjects</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={16} className="mr-1" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject Name</label>
                <Input
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g., Mathematics, History..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddSubject} className="w-full">
                Add Subject
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Palette size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No subjects yet. Add your first subject to start studying!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {subjects.map((subject) => (
            <Card 
              key={subject.id} 
              className={`cursor-pointer transition-all ${
                selectedSubject?.id === subject.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectSubject(subject)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(subject.totalTime)} studied
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSubject(subject.id)
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}