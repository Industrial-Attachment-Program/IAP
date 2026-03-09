"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  LayoutDashboard,
  FileText,
  X,
  Check,
  Plus,
  Trophy,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";


interface Student {
  id: number;
  name: string;
  supervisorId: number;
  user?: { id: number; name: string; email: string };
  phone?: string;
  address?: string;
  companyName?: string;
  companyAddress?: string;
  supervisorName?: string;
  supervisorEmail?: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SUBMITTED" | "APPROVED" | "REJECTED";
  date: string;
  studentId: number;
  student?: { user: { name: string } };
}

interface NewTask {
  studentId: number | "";
  title: string;
  description: string;
  dueDate: string;
}

interface WeeklyLog {
  id: number;
  weekNumber: number;
  studentId: number;
  startDate: string;
  endDate: string;
  mondayTask?: string;
  mondayHours?: number;
  tuesdayTask?: string;
  tuesdayHours?: number;
  wednesdayTask?: string;
  wednesdayHours?: number;
  thursdayTask?: string;
  thursdayHours?: number;
  fridayTask?: string;
  fridayHours?: number;
  totalHours?: number;
  generalStatement?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  student?: { user: { name: string } };
  grade?: string;
  supervisorName?: string;
  supervisorDate?: string;
  supervisorSignature?: boolean;
}

// ----- Component -----
export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "tasks" | "weekly-logs">("overview");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedWeeklyLog, setSelectedWeeklyLog] = useState<WeeklyLog | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [weeklyLogs, setWeeklyLogs] = useState<WeeklyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      const originalOverflow = mainElement.style.overflow;
      mainElement.style.overflow = 'hidden';
      return () => {
        mainElement.style.overflow = originalOverflow;
      };
    }
  }, []);


  const [newTask, setNewTask] = useState<NewTask>({
    studentId: "",
    title: "",
    description: "",
    dueDate: "",
  });
  const [ratingValue, setRatingValue] = useState(7);
  const [ratingComment, setRatingComment] = useState("");

  const params = useParams();
  const searchParams = useSearchParams();
  const supervisorIdParam = params.id as string || searchParams.get("supervisorId");
  const supervisorId = supervisorIdParam ? Number(supervisorIdParam) : undefined;

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role === "SUPERVISOR" && user.supervisorProfile?.id !== supervisorId) {
        router.replace("/login");
        return;
      }
      if (user.role !== "SUPERVISOR" && user.role !== "ADMIN") {
        router.replace("/login");
        return;
      }
      setIsAuthorized(true);
    } catch (e) {
      router.replace("/login");
    }
  }, [supervisorId, router]);

  // ----- Fetch Data -----
  const fetchStudents = async () => {
    try {
      const data = await apiFetch(`/students?supervisorId=${supervisorId}`);
      setStudents(data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await apiFetch(`/tasks?supervisorId=${supervisorId}`);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchWeeklyLogs = async () => {
    try {
      const data = await apiFetch(`/weekly-logs?supervisorId=${supervisorId}`);
      setWeeklyLogs(data.logs || []);
    } catch (error) {
      console.error("Error fetching weekly logs:", error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStudents(), fetchTasks(), fetchWeeklyLogs()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && supervisorId) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized, supervisorId]);

  if (isAuthorized === null) {
    return <div className="min-h-screen bg-background" />;
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col overflow-hidden space-y-6 animate-pulse">
        {/* Tab bar skeleton */}
        <div className="flex gap-8 border-b border-slate-100 pb-6 shrink-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-20 bg-slate-200 rounded-full" />
          ))}
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <div className="h-3 w-16 bg-slate-200 rounded-full" />
              <div className="h-7 w-10 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
        {/* Content skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 flex-1">
          <div className="h-5 w-40 bg-slate-200 rounded-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Computed Stats for Overview
  const stats = {
    totalStudents: students.length,
    pendingLogs: weeklyLogs.filter(l => l.status === 'SUBMITTED').length,
    activeTasks: tasks.filter(t => ['PENDING', 'IN_PROGRESS', 'SUBMITTED'].includes(t.status)).length,
    completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
    urgentLogs: weeklyLogs.filter(l => l.status === 'SUBMITTED').length // Placeholder for actual logic
  };


  // ----- Task Handlers -----
  const handleApproveTask = async (taskId: string) => {
    try {
      await apiFetch("/tasks", {
        method: "PATCH",
        body: JSON.stringify({ taskId, status: "COMPLETED" }),
      });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectTask = async (taskId: string) => {
    try {
      await apiFetch("/tasks", {
        method: "PATCH",
        body: JSON.stringify({ taskId, status: "PENDING" }),
      });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignTask = async () => {
    if (newTask.studentId === "" || !newTask.title) return;
    try {
      await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          studentId: newTask.studentId,
          title: newTask.title,
          description: newTask.description,
          date: newTask.dueDate || new Date().toISOString(),
        }),
      });
      setNewTask({ studentId: "", title: "", description: "", dueDate: "" });
      setShowTaskModal(false);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRateTask = async () => {
    if (!selectedTask) return;
    try {
      await apiFetch("/tasks", {
        method: "PATCH",
        body: JSON.stringify({
          taskId: selectedTask.id,
          status: "COMPLETED",
          rating: ratingValue,
          comment: ratingComment,
          supervisorId,
        }),
      });
      fetchTasks();
      setShowRatingModal(false);
      setSelectedTask(null);
      setRatingValue(7);
      setRatingComment("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproveWeeklyLog = async (logId: number, data: { grade: string; supervisorName: string; supervisorDate: string; note?: string }) => {
    setIsSaving(true);
    try {
      await apiFetch(`/weekly-logs/${logId}/approve`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      toast.success("Logbook approved and signed");
      setShowReviewModal(false);
      fetchWeeklyLogs();
    } catch (error) {
      toast.error("Approval failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectWeeklyLog = async (logId: number, note: string) => {
    setIsSaving(true);
    try {
      await apiFetch(`/weekly-logs/${logId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ note })
      });
      toast.success("Logbook sent back for corrections");
      setShowReviewModal(false);
      fetchWeeklyLogs();
    } catch (error) {
      toast.error("Rejection failed");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral/10 pb-6 shrink-0">
        <div className="flex gap-8 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "students", label: "My Students", icon: Users },
            { id: "tasks", label: "Task Board", icon: Check },
            { id: "weekly-logs", label: "Review Logs", icon: FileText },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer", activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-primary/60 hover:text-primary")}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'weekly-logs' && stats.pendingLogs > 0 && (
                <span className="ml-1 h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {stats.pendingLogs}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStudents();
              fetchTasks();
              fetchWeeklyLogs();
              toast.success("Data refreshed");
            }}
            className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 font-bold cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto space-y-8 pr-2 hide-scrollbar"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Active Students", value: stats.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Pending Reviews", value: stats.pendingLogs, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Tasks Oversight", value: stats.activeTasks, icon: Check, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Completed Goals", value: stats.completedTasks, icon: Trophy, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                      </div>
                      <div className={cn("p-3 rounded-2xl", stat.bg)}>
                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Actions / Recent Activity */}
              <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Priority Actions
                  </CardTitle>
                  <CardDescription>Items requiring your immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyLogs.filter(l => l.status === 'SUBMITTED').length === 0 ? (
                      <div className="py-8 text-center text-slate-400 italic text-sm border-2 border-dashed border-slate-100 rounded-2xl">
                        No pending actions at the moment.
                      </div>
                    ) : (
                      weeklyLogs.filter(l => l.status === 'SUBMITTED').map(log => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center font-bold text-primary shadow-sm">
                              {log.student?.user.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{log.student?.user.name}</p>
                              <p className="text-xs text-slate-500">Submitted Week {log.weekNumber} Logbook</p>
                            </div>
                          </div>
                          <Button size="sm" className="cursor-pointer" onClick={() => { setSelectedWeeklyLog(log); setShowReviewModal(true); setActiveTab('weekly-logs'); }}>Review</Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Student Summary */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Quick Student View</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {students.slice(0, 5).map(student => (
                      <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-700">{student.user?.name || student.name}</span>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary" onClick={() => setActiveTab('students')}>View Details</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "students" && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 pb-10 pr-2 hide-scrollbar"
          >
            {students.map((student) => {
              const studentTasks = tasks.filter((t) => t.studentId === student.id);
              const totalTasks = studentTasks.length || 0;
              const completed = studentTasks.filter((t) => t.status === "COMPLETED").length;
              const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
              const initials = student.user?.name
                ? student.user.name.split(" ").map((n: any) => n[0]).join("")
                : "ST";
              const status =
                progress >= 80 ? "Excellent" : progress < 50 && totalTasks > 0 ? "Behind" : "On Track";

              return (
                <Card key={student.id} className="hover:border-primary/50 transition-colors group cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      {/* Progress Ring */}
                      <div className="h-24 w-24 rounded-full border-4 border-neutral/10 flex items-center justify-center relative">
                        <svg
                          className="absolute inset-0 h-full w-full -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-primary"
                            strokeDasharray={`${progress * 2.89} 289`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center text-xl font-bold text-primary">
                          {initials}
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-white border border-neutral/10 flex items-center justify-center shadow-sm">
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            status === "Excellent"
                              ? "bg-green-500"
                              : status === "Behind"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          )}
                        ></span>
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-primary mb-1">
                      {student.user?.name || student.name}
                    </h3>
                    <p className="text-sm text-primary mb-1">{progress}% Tasks Completed</p>
                    <p className="text-xs text-muted-foreground mb-4">{completed}/{totalTasks} tasks done</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Tasks</span>
                        <span className="text-sm font-bold text-slate-700">{tasks.filter(t => t.studentId === student.id).length} Total</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Pending</span>
                        <span className="text-sm font-bold text-amber-600">{tasks.filter(t => t.studentId === student.id && t.status === 'SUBMITTED').length} Review</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full pt-4">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-9 cursor-pointer"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowProfileModal(true);
                          }}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-9 cursor-pointer"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowRatingModal(true);
                          }}
                        >
                          Rate Student
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        className="w-full text-xs h-10 bg-primary text-white hover:bg-primary/90 shadow-md transition-all active:scale-95 cursor-pointer"
                        onClick={() => {
                          setNewTask({ ...newTask, studentId: student.id });
                          setShowTaskModal(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Assign New Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}

        {activeTab === "tasks" && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4 min-h-0"
          >
            {[
              { status: "PENDING", label: "To Do", color: "bg-slate-100 text-slate-700" },
              { status: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-700" },
              { status: "SUBMITTED", label: "Needs Review", color: "bg-amber-100 text-amber-700 border border-amber-200" },
              { status: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-700" },
            ].map(column => (
              <div key={column.status} className="flex flex-col gap-4 h-full min-h-0">
                <div className={cn("p-3 rounded-xl font-bold text-sm flex items-center justify-between shrink-0", column.color)}>
                  {column.label}
                  <span className="bg-white/50 px-2 py-0.5 rounded text-[10px]">{tasks.filter(t => t.status === column.status).length}</span>
                </div>
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto bg-slate-50/50 p-2 rounded-2xl border-2 border-dashed border-slate-200 min-h-0 hide-scrollbar">
                  {tasks.filter(t => t.status === column.status).map(task => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer group shrink-0" onClick={() => { setSelectedTask(task); if (task.status === 'SUBMITTED') setShowRatingModal(true); }}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {task.student?.user?.name.split(" ").map(n => n[0]).join("") || "ST"}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{task.student?.user?.name}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">{task.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-medium">{new Date(task.date).toLocaleDateString()}</span>
                          {column.status === 'SUBMITTED' && (
                            <Button size="sm" variant="secondary" className="h-6 text-[10px] font-bold rounded-lg px-2">Review</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tasks.filter(t => t.status === column.status).length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-slate-300 text-xs italic">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "weekly-logs" && (
          <motion.div
            key="weekly-logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto space-y-6 pr-2 hide-scrollbar"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weeklyLogs.filter(l => l.status === 'SUBMITTED').length === 0 ? (
                <Card className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 bg-slate-50/30 rounded-3xl">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                      <FileText className="h-10 w-10 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                      <p className="text-sm text-slate-500 max-w-[280px] mx-auto mt-1">No pending weekly logbooks require your review at this time.</p>
                    </div>
                  </div>
                </Card>
              ) : (
                weeklyLogs.filter(l => l.status === 'SUBMITTED').map(log => (
                  <Card key={log.id} className="hover:shadow-xl transition-all border-amber-200 bg-amber-50/30 shadow-sm cursor-pointer group rounded-2xl overflow-hidden border-2" onClick={() => { setSelectedWeeklyLog(log); setShowReviewModal(true); }}>
                    <CardHeader className="pb-3 border-b border-amber-100 bg-white/50">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shadow-sm border border-primary/10">
                            {log.student?.user.name.split(" ").map(n => n[0]).join("") || "ST"}
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold text-slate-900">{log.student?.user.name}</CardTitle>
                            <CardDescription className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Submitted Week {log.weekNumber}</CardDescription>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
                          Pending
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5 bg-white">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Period:</span>
                          <span className="font-bold text-slate-900">{new Date(log.startDate).toLocaleDateString()} - {new Date(log.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Work Hours:</span>
                          <span className="font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{log.totalHours || 0} Hours</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 italic border-l-2 border-slate-200 pl-3 py-1 mt-2">
                          "{log.generalStatement || "No summary provided."}"
                        </p>
                        <div className="pt-4 flex justify-end items-center gap-2">
                          <Button size="sm" variant="outline" className="h-9 text-xs font-bold rounded-xl border-slate-200 text-slate-600 cursor-pointer">View Draft</Button>
                          <Button size="sm" className="h-9 px-5 text-xs font-bold rounded-xl bg-primary text-white shadow-md shadow-primary/10 group-hover:scale-[1.02] transition-transform cursor-pointer">Review Now</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Assign New Task</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-primary hover:text-primary/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-primary mb-2 block">Task Title *</label>
                  <Input
                    placeholder="e.g., Design database schema"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-primary mb-2 block">Description</label>
                  <textarea
                    className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px]"
                    placeholder="Describe task..."
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-primary mb-2 block">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-6 bg-primary/5 border-t border-primary/10 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button
                  onClick={handleAssignTask}
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={!newTask.title || !newTask.studentId}
                >
                  <Check className="h-4 w-4 mr-2" /> Assign Task
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (selectedStudent || selectedTask) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">
                  {selectedTask ? `Rate Task: ${selectedTask.title}` : `Rate ${selectedStudent?.name}`}
                </h3>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedTask(null);
                  }}
                  className="text-primary hover:text-primary/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {selectedTask && (
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm text-primary font-medium mb-2">Task Description:</p>
                    <p className="text-sm text-primary">{selectedTask.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-primary mb-3 block">Overall Rating (1-10)</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={ratingValue}
                    className="w-full accent-primary"
                    onChange={(e) => setRatingValue(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-primary mt-1">
                    <span>Poor (1)</span>
                    <span>Excellent (10)</span>
                  </div>
                  <p className="text-center text-sm text-primary mt-2">Selected: {ratingValue}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-primary mb-2 block">Comments</label>
                  <textarea
                    placeholder="Optional feedback..."
                    className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary min-h-20"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-6 bg-primary/5 border-t border-primary/10 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowRatingModal(false)}>Cancel</Button>
                <Button
                  onClick={handleRateTask}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Check className="h-4 w-4 mr-2" /> Submit Rating
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedStudent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Student Profile</h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-primary hover:text-primary/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-2xl font-bold text-primary mb-3">
                    {selectedStudent.user?.name?.split(" ").map((n) => n[0]).join("") || "ST"}
                  </div>
                  <h4 className="font-bold text-lg text-primary">{selectedStudent.user?.name}</h4>
                  <p className="text-sm text-primary/60">{selectedStudent.user?.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Contact Info</label>
                    <div className="mt-1 p-3 bg-neutral/5 rounded-lg">
                      <p className="text-sm text-primary flex items-center gap-2">
                        <span className="font-medium">Phone:</span> {selectedStudent.phone || "N/A"}
                      </p>
                      <p className="text-sm text-primary flex items-center gap-2 mt-1">
                        <span className="font-medium">Address:</span> {selectedStudent.address || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Internship Placement</label>
                    <div className="mt-1 p-3 bg-neutral/5 rounded-lg">
                      <p className="text-sm text-primary font-bold">{selectedStudent.companyName || "No Company Assigned"}</p>
                      <p className="text-sm text-primary/80">{selectedStudent.companyAddress}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Field Supervisor</label>
                    <div className="mt-1 p-3 bg-neutral/5 rounded-lg">
                      <p className="text-sm text-primary font-medium">{selectedStudent.supervisorName || "N/A"}</p>
                      <p className="text-xs text-primary/60">{selectedStudent.supervisorEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-primary/5 border-t border-primary/10 flex justify-end">
                <Button onClick={() => setShowProfileModal(false)}>Close</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Weekly Log Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedWeeklyLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                    {selectedWeeklyLog.weekNumber}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Review Week {selectedWeeklyLog.weekNumber}</h3>
                    <p className="text-sm text-slate-500">{selectedWeeklyLog.student?.user.name} • {new Date(selectedWeeklyLog.startDate || "").toLocaleDateString()} - {new Date(selectedWeeklyLog.endDate || "").toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => setShowReviewModal(false)} className="h-10 w-10 rounded-full hover:bg-white hover:shadow-sm flex items-center justify-center transition-all group">
                  <X className="h-5 w-5 text-slate-400 group-hover:text-slate-900" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Content Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" /> Daily Activities
                      </h4>
                      <div className="space-y-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                          const taskKey = `${day.toLowerCase()}Task` as keyof WeeklyLog;
                          const hoursKey = `${day.toLowerCase()}Hours` as keyof WeeklyLog;
                          return (
                            <div key={day} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase">{day}</span>
                                <span className="text-xs font-bold text-primary">{(selectedWeeklyLog[hoursKey] as number) || 0} hrs</span>
                              </div>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{(selectedWeeklyLog[taskKey] as string) || "No activity recorded."}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                      <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-4">Weekly Summary</h4>
                      <p className="text-sm text-slate-700 leading-relaxed italic">&quot;{selectedWeeklyLog.generalStatement || "No summary provided."}&quot;</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Supervisor Assessment</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Grade (A-E)</label>
                          <select
                            id="review-grade"
                            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                            defaultValue={selectedWeeklyLog.grade || ""}
                            disabled={selectedWeeklyLog.status === 'APPROVED' || isSaving}
                          >
                            <option value="" disabled>Select...</option>
                            <option value="A">A - Excellent</option>
                            <option value="B">B - Good</option>
                            <option value="C">C - Satisfactory</option>
                            <option value="D">D - Poor</option>
                            <option value="E">E - Unacceptable</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Date</label>
                          <input
                            type="date"
                            id="review-date"
                            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                            defaultValue={selectedWeeklyLog.supervisorDate || new Date().toISOString().split('T')[0]}
                            disabled={selectedWeeklyLog.status === 'APPROVED' || isSaving}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-xs font-bold text-slate-500">Print Name</label>
                          <input
                            type="text"
                            id="review-name"
                            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                            placeholder="Your Full Name"
                            defaultValue={selectedWeeklyLog.supervisorName || ""}
                            disabled={selectedWeeklyLog.status === 'APPROVED' || isSaving}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-xs font-bold text-slate-500">Feedback / Note (Optional)</label>
                          <textarea
                            id="review-note"
                            className="w-full h-24 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none resize-none disabled:bg-slate-50 disabled:text-slate-400"
                            placeholder="Add comments for the student..."
                            disabled={selectedWeeklyLog.status === 'APPROVED' || isSaving}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Verification</span>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  {selectedWeeklyLog.status !== 'APPROVED' ? (
                    <>
                      <Button
                        variant="ghost"
                        className="flex-1 md:flex-none h-12 px-8 rounded-xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                        disabled={isSaving}
                        onClick={() => {
                          const note = (document.getElementById('review-note') as HTMLTextAreaElement).value;
                          handleRejectWeeklyLog(selectedWeeklyLog.id, note);
                        }}
                      >
                        Reject Log
                      </Button>
                      <Button
                        className="flex-1 md:flex-none h-12 px-10 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        disabled={isSaving}
                        onClick={() => {
                          const grade = (document.getElementById('review-grade') as HTMLSelectElement).value;
                          const date = (document.getElementById('review-date') as HTMLInputElement).value;
                          const name = (document.getElementById('review-name') as HTMLInputElement).value;
                          const note = (document.getElementById('review-note') as HTMLTextAreaElement).value;
                          if (!grade || !name) {
                            toast.error("Grade and Name are required");
                            return;
                          }
                          handleApproveWeeklyLog(selectedWeeklyLog.id, {
                            grade,
                            supervisorName: name,
                            supervisorDate: date,
                            note
                          });
                        }}
                      >
                        {isSaving ? "Processing..." : "Approve & Sign Log"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-12 px-10 rounded-xl font-bold border-green-500 text-green-600 bg-green-50"
                      onClick={() => setShowReviewModal(false)}
                    >
                      <Check className="h-4 w-4 mr-2" /> Log Approved
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="top-right" />
    </div>
  );
}
