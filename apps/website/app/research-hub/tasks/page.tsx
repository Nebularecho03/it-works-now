import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/site";
import { Calendar, Clock, CheckCircle, Circle, AlertCircle } from "lucide-react";

export const metadata = createMetadata(
  "Research Tasks",
  "Research milestones, tasks, and progress tracking.",
  "/research-hub/tasks",
);

export const revalidate = 3600;

const researchTasks = [
  {
    id: 1,
    title: "Complete data collection for Luhya mourning rituals study",
    project: "Traditional Luhya mourning rituals",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-05-15",
    assignee: "Dr. Stephen Asatsa",
    progress: 75,
    description: "Finalize focus group discussions and behavioral observations"
  },
  {
    id: 2,
    title: "Submit manuscript to Cultural Evolution Society journal",
    project: "Traditional Luhya mourning rituals",
    status: "pending",
    priority: "medium",
    dueDate: "2024-05-30",
    assignee: "Dr. Elizabeth Shino",
    progress: 30,
    description: "Prepare and submit research findings for peer review"
  },
  {
    id: 3,
    title: "Develop training materials for mental health practitioners",
    project: "Traditional Luhya mourning rituals",
    status: "pending",
    priority: "medium",
    dueDate: "2024-06-15",
    assignee: "Research Team",
    progress: 20,
    description: "Create culturally-sensitive training modules"
  },
  {
    id: 4,
    title: "Literature review on indigenous healing practices",
    project: "Indigenous Psychology Research",
    status: "completed",
    priority: "low",
    dueDate: "2024-04-30",
    assignee: "Graduate Assistants",
    progress: 100,
    description: "Comprehensive review of existing literature"
  },
  {
    id: 5,
    title: "Prepare conference presentation for ISSBD",
    project: "Cross-cultural Psychology",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-05-20",
    assignee: "Dr. Stephen Asatsa",
    progress: 60,
    description: "Develop presentation for international society meeting"
  },
  {
    id: 6,
    title: "Analyze survey data from community wellbeing study",
    project: "Community Mental Health",
    status: "in-progress",
    priority: "medium",
    dueDate: "2024-05-25",
    assignee: "Research Analyst",
    progress: 45,
    description: "Statistical analysis of community survey responses"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'in-progress':
      return Clock;
    case 'pending':
      return Circle;
    default:
      return AlertCircle;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'in-progress':
      return 'text-blue-600 bg-blue-100';
    case 'pending':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-orange-600 bg-orange-100';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ResearchTasksPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4">Research Tasks</h1>
        <p className="text-lg text-muted-foreground">
          Track research milestones, deadlines, and task progress across all projects.
        </p>
      </div>

      {/* Task Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{researchTasks.length}</div>
          <div className="text-sm text-muted-foreground">Total Tasks</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {researchTasks.filter(t => t.status === 'in-progress').length}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {researchTasks.filter(t => t.status === 'completed').length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {researchTasks.filter(t => t.priority === 'high').length}
          </div>
          <div className="text-sm text-muted-foreground">High Priority</div>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
            {researchTasks.map((task) => {
              const StatusIcon = getStatusIcon(task.status);
              return (
              <Card key={task.id} className="p-6">
                <div className="space-y-4">
                  {/* Task Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(task.status).split(' ')[0]}`} />
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due: {task.dueDate}
                        </div>
                        <div>Assigned to: {task.assignee}</div>
                      </div>
                    </div>
                  </div>

                    {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Tag */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Project:</span>
                    <Badge variant="outline">{task.project}</Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

      {/* Upcoming Deadlines */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
        <div className="space-y-3">
          {researchTasks
            .filter(task => task.status !== 'completed')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3)
            .map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.project}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{task.dueDate}</div>
                  <Badge className={getPriorityColor(task.priority)} variant="outline">
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
