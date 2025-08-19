import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import { StudySession, Subject } from '@/lib/types'
import { getWeeklyData, getMonthlyData, getDailyData, getSubjectWeeklyData, getSubjectMonthlyData, getSubjectComparison } from '@/lib/chartUtils'
import { Calendar, TrendingUp, Clock, BookOpen } from '@phosphor-icons/react'
import { useState } from 'react'

interface ProgressChartsProps {
  sessions: StudySession[]
  subjects: Subject[]
}

export function ProgressCharts({ sessions, subjects }: ProgressChartsProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  
  const weeklyData = getWeeklyData(sessions)
  const monthlyData = getMonthlyData(sessions)
  const dailyData = getDailyData(sessions, subjects)
  const subjectWeeklyData = getSubjectWeeklyData(sessions, subjects)
  const subjectMonthlyData = getSubjectMonthlyData(sessions, subjects)
  const subjectComparison = getSubjectComparison(sessions, subjects)

  // Set default selected subject to first available subject
  const defaultSubject = selectedSubject || (subjects.length > 0 ? subjects[0].id : '')
  const currentSubject = subjects.find(s => s.id === defaultSubject)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weekly" className="text-xs">
            <Calendar size={16} className="mr-1" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs">
            <TrendingUp size={16} className="mr-1" />
            Monthly
          </TabsTrigger>
          <TabsTrigger value="daily" className="text-xs">
            <Clock size={16} className="mr-1" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="subjects" className="text-xs">
            <BookOpen size={16} className="mr-1" />
            Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Weekly Study Time</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your study patterns over the last 4 weeks
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <XAxis 
                      dataKey="week" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Weekly Sessions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Number of study sessions per week
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis 
                      dataKey="week" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Bar 
                      dataKey="sessions" 
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Monthly Trends</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your study progress over the last 6 months
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs text-muted-foreground">Study Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span className="text-xs text-muted-foreground">Sessions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Daily Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your study time for the last 7 days
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Bar 
                      dataKey="minutes" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {dailyData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Study Consistency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {dailyData.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        {day.day}
                      </div>
                      <div 
                        className={`h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                          day.minutes > 0 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {day.minutes > 0 ? `${day.minutes}m` : '0'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-muted-foreground">
                    {dailyData.filter(d => d.minutes > 0).length} days active this week
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          {subjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BookOpen size={48} className="text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No Subjects Yet</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Add subjects to view individual topic performance
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Subject Selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Individual Topic Analysis</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track progress for specific subjects
                  </p>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={defaultSubject} 
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: subject.color }}
                            ></div>
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Subject Weekly Progress */}
              {currentSubject && subjectWeeklyData[defaultSubject] && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: currentSubject.color }}
                      ></div>
                      {currentSubject.name} - Weekly Progress
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Study time over the last 4 weeks
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={subjectWeeklyData[defaultSubject]}>
                          <XAxis 
                            dataKey="week" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="minutes" 
                            stroke={currentSubject.color}
                            fill={currentSubject.color}
                            fillOpacity={0.15}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subject Monthly Trends */}
              {currentSubject && subjectMonthlyData[defaultSubject] && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: currentSubject.color }}
                      ></div>
                      {currentSubject.name} - Monthly Trends
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Long-term progress over 6 months
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={subjectMonthlyData[defaultSubject]}>
                          <XAxis 
                            dataKey="month" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="minutes" 
                            stroke={currentSubject.color}
                            strokeWidth={3}
                            dot={{ fill: currentSubject.color, strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subject Comparison */}
              {subjectComparison.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Subject Comparison</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      This week vs last week performance
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectComparison} layout="horizontal">
                          <XAxis 
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            width={80}
                          />
                          <Bar 
                            dataKey="thisWeek" 
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                            name="This Week"
                          />
                          <Bar 
                            dataKey="lastWeek" 
                            fill="hsl(var(--muted))"
                            radius={[0, 4, 4, 0]}
                            name="Last Week"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-xs text-muted-foreground">This Week</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-muted"></div>
                        <span className="text-xs text-muted-foreground">Last Week</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subject Performance Insights */}
              {currentSubject && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Study Time</span>
                        <span className="font-medium">{currentSubject.totalTime} minutes</span>
                      </div>
                      
                      {subjectWeeklyData[defaultSubject] && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">This Week</span>
                          <span className="font-medium">
                            {subjectWeeklyData[defaultSubject][3]?.minutes || 0} minutes
                          </span>
                        </div>
                      )}
                      
                      {subjectWeeklyData[defaultSubject] && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Weekly Average</span>
                          <span className="font-medium">
                            {Math.round(
                              subjectWeeklyData[defaultSubject].reduce((sum, week) => sum + week.minutes, 0) / 4
                            )} minutes
                          </span>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Target Progress</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {Math.round((currentSubject.totalTime / (currentSubject.targetHours * 60)) * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              of {currentSubject.targetHours}h goal
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, (currentSubject.totalTime / (currentSubject.targetHours * 60)) * 100)}%`,
                              backgroundColor: currentSubject.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}