"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookOpen, User, CheckCircle, XCircle, FileText, CheckSquare, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";

// Mock interface
interface Student {
    id: number;
    user: { name: string; email: string };
    studentId: string;
    profileCompleted: boolean;
}

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    date: string;
    submissionContent?: string;
    submittedAt?: string;
    rating?: number;
    comments?: { id: number; content: string; createdAt: string }[];
}

interface LogEntry {
    id: number;
    content: string;
    date: string;
}

export default function SupervisorStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [activeTab, setActiveTab] = useState<"tasks" | "logs">("tasks");

    const [tasks, setTasks] = useState<Task[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "" });

    // Assessment State
    const [assessingTask, setAssessingTask] = useState<number | null>(null);
    const [assessmentComment, setAssessmentComment] = useState("");
    const [assessmentRating, setAssessmentRating] = useState<number>(0);

    const [supervisorId, setSupervisorId] = useState<number | null>(null);

    useEffect(() => {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                const supId = user.supervisorId || user.supervisorProfile?.id;

                if (supId) {
                    setSupervisorId(supId);
                    apiFetch(`/students?supervisorId=${supId}`)
                        .then(result => {
                            if (result.ok) {
                                setStudents(result.data.students || []);
                            } else {
                                console.error("Error fetching students:", result.error);
                            }
                            setLoading(false);
                        })
                        .catch(err => {
                            console.error(err);
                            setLoading(false);
                        });
                }
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }
    }, [activeTab]);

    const handleViewStudent = async (student: Student) => {
        setSelectedStudent(student);
        setActiveTab("tasks");
        fetchTasks(student.id);
        fetchLogs(student.id);
    };

    const fetchTasks = async (studentId: number) => {
        try {
            const result = await apiFetch(`/tasks?studentId=${studentId}`);
            if (result.ok) {
                setTasks(result.data.tasks || []);
            }
        } catch (err) { console.error(err); }
    };

    const fetchLogs = async (studentId: number) => {
        try {
            const result = await apiFetch(`/daily-log?studentId=${studentId}`);
            if (result.ok) {
                setLogs(result.data.logs || []);
            }
        } catch (err) { console.error(err); }
    };

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        setAssigning(true);
        try {
            await apiFetch("/tasks", {
                method: "POST",
                body: JSON.stringify({
                    studentId: selectedStudent.id,
                    title: newTask.title,
                    description: newTask.description
                })
            });
            setShowTaskForm(false);
            setNewTask({ title: "", description: "" });
            fetchTasks(selectedStudent.id);
        } catch (error) {
            console.error("Error assigning task:", error);
        } finally {
            setAssigning(false);
        }
    };

    const handleAssessTask = async (taskId: number, status: string) => {
        if (!supervisorId) return;
        try {
            const body: any = { taskId, status, supervisorId };
            if (assessmentComment) body.feedback = assessmentComment;
            if (status === 'APPROVED' && assessmentRating > 0) body.rating = assessmentRating;

            await apiFetch("/tasks", {
                method: "PATCH",
                body: JSON.stringify(body)
            });

            setAssessingTask(null);
            setAssessmentComment("");
            setAssessmentRating(0);
            if (selectedStudent) fetchTasks(selectedStudent.id);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-primary">My Students</h1>
                <p className="text-primary/60">Manage your assigned students</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                    <Card key={student.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{student.user.name}</CardTitle>
                                <CardDescription>{student.studentId}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-primary text-white" onClick={() => handleViewStudent(student)}>
                                <BookOpen className="h-4 w-4 mr-2" />
                                View Logbook
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {students.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No students assigned.
                    </div>
                )}
            </div>
        </div>
    );
}
