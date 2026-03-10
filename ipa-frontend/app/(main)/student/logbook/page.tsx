"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    Plus, Loader2, FileText, CheckSquare, MessageSquare,
    Star, Building2, User, Calendar, ChevronDown,
    ChevronUp, Download, CheckCircle2, AlertCircle,
    ShieldCheck, LockKeyhole
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast, Toaster } from "react-hot-toast";
import DOMPurify from "dompurify";

const sanitize = (html: string) => ({ __html: DOMPurify.sanitize(html) });

// Subcomponents
function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-500 group-hover:text-primary transition-colors">{label}</label>
            <div className="h-12 w-full rounded-lg bg-white border border-slate-200 flex items-center px-4 text-sm font-medium text-slate-800 shadow-sm transition-all group-hover:border-primary/30">
                {value || "—"}
            </div>
        </div>
    );
}

function LogbookInput({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange: (v: string) => void; type?: string }) {
    return (
        <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-500 group-hover:text-primary transition-colors">{label}</label>
            <input
                type={type}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm outline-none"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isApproved = status === "APPROVED";
    return (
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-2 transition-all ${isApproved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${isApproved ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
            {status}
        </div>
    );
}

function SurveyButton({ label, active, onClick, onDecline }: { label: string; active?: boolean | string; onClick: () => void; onDecline: () => void }) {
    return (
        <div className="flex flex-col gap-3 group">
            <span className="text-xs font-semibold text-slate-500 text-center group-hover:text-primary transition-colors">{label}</span>
            <div className="flex gap-3">
                <button
                    onClick={onClick}
                    className={`flex-1 h-12 rounded-lg font-bold text-sm transition-all border-2 ${active === true || active === "Excellent" || active === "YES" ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-primary/50 hover:text-primary'}`}
                >Yes</button>
                <button
                    onClick={onDecline}
                    className={`flex-1 h-12 rounded-lg font-bold text-sm transition-all border-2 ${active === false || active === "Poor" || active === "NO" ? 'bg-red-500 border-red-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500'}`}
                >No</button>
            </div>
        </div>
    );
}

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    date: string;
    submissionContent?: string;
    rating?: number;
    comments?: { id: number; content: string; createdAt: string }[];
}

// FIX 1: index signature first, startDate/endDate optional
interface WeeklyLog {
    [key: string]: any;
    id?: number;
    weekNumber: number;
    studentId?: number;
    startDate?: string;
    endDate?: string;
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
    grade?: 'A' | 'B' | 'C' | 'D' | 'E';
    supervisorName?: string;
    supervisorDate?: string;
    supervisorSignature?: boolean;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}

interface IapReport {
    isUseful?: boolean;
    improvedUnderstanding?: boolean;
    providedExperiences?: boolean;
    loVisitCount?: number;
    programmeTypes: string[];
    otherProgrammeDetails?: string;
    satisfactionIndustry?: 'Excellent' | 'Average' | 'Poor';
    satisfactionMajor?: 'Excellent' | 'Average' | 'Poor';
    satisfactionPractical?: 'Excellent' | 'Average' | 'Poor';
    satisfactionInstructors?: 'Excellent' | 'Average' | 'Poor';
    notableAchievements?: string;
    futureCareerPlan?: string;
    suggestions?: string;
}

export default function StudentLogbookPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [user, setUser] = useState<any>(null);
    const [student, setStudent] = useState<any>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [weeklyLogs, setWeeklyLogs] = useState<WeeklyLog[]>([]);
    const [report, setReport] = useState<IapReport>({ programmeTypes: [] });

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

    const steps = [
        { id: 1, title: "Guidelines", icon: FileText },
        { id: 2, title: "Details & Attendance", icon: User },
        { id: 3, title: "Weekly Logs", icon: Calendar },
        { id: 4, title: "Result Report", icon: Building2 },
        { id: 5, title: "Assessment Vault", icon: CheckSquare }
    ];

    // FIX 2: explicit return type + fully-typed baseLog with all required fields
    const getSafeLog = (weekNum: number): WeeklyLog => {
        const weekData = generatedWeeksList.find(w => w.number === weekNum);
        const existing = weeklyLogs.find(l => l.weekNumber === weekNum);

        const baseLog: WeeklyLog = {
            weekNumber: weekNum,
            studentId: student?.id ?? 0,
            startDate: weekData?.start ?? "",
            endDate: weekData?.end ?? "",
            mondayTask: "",
            mondayHours: 0,
            tuesdayTask: "",
            tuesdayHours: 0,
            wednesdayTask: "",
            wednesdayHours: 0,
            thursdayTask: "",
            thursdayHours: 0,
            fridayTask: "",
            fridayHours: 0,
            totalHours: 0,
            generalStatement: "",
            supervisorSignature: false,
            supervisorName: "",
            supervisorDate: "",
            status: "DRAFT"
        };

        return existing ? { ...baseLog, ...existing } : baseLog;
    };

    useEffect(() => {
        fetchData();
        // Removed auto-refresh to prevent data loss while typing
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const storedUserRaw = localStorage.getItem("user");
            if (!storedUserRaw || storedUserRaw === "{}") {
                return; // MainLayout handles redirect
            }

            const storedUser = JSON.parse(storedUserRaw);
            const studentId = storedUser.studentProfile?.id || storedUser.id;

            if (!studentId) {
                return;
            }

            setUser(storedUser);

            console.log("Fetching data for studentId:", studentId);

            try {
                const result = await apiFetch(`/students/${studentId}`);
                if (result.ok && result.data) {
                    const studentData = result.data.student || result.data;
                    setStudent({
                        ...studentData,
                        ratings: studentData.ratings || []
                    });
                }
            } catch (e: any) {
                if (e.message !== 'Not Found' && e.message !== 'Student not found') {
                    console.error("Error fetching student:", e);
                    toast.error("Failed to load profile details");
                }
            }

            try {
                const result = await apiFetch(`/tasks?studentId=${studentId}`);
                if (result.ok) {
                    setTasks(result.data?.tasks || []);
                }
            } catch (e) {
                console.error("Error fetching tasks:", e);
            }

            try {
                const result = await apiFetch(`/weekly-logs?studentId=${studentId}`);
                if (result.ok) {
                    setWeeklyLogs(result.data?.logs || []);
                }
            } catch (e) {
                console.error("Error fetching weekly logs:", e);
            }

            try {
                const result = await apiFetch(`/iap-reports?studentId=${studentId}`);
                if (result.ok && result.data) {
                    setReport(result.data);
                }
            } catch (e) {
                console.warn("No prior report found or fetch failed");
            }


        } catch (error) {
            console.error("General sync error:", error);
            toast.error("Failed to synchronize with server");
        } finally {
            setLoading(false);
        }
    };

    const calculateWeeks = () => {
        if (!student?.internshipStart || !student?.internshipEnd) return [];
        const start = new Date(student.internshipStart);
        const end = new Date(student.internshipEnd);

        const firstMonday = new Date(start);
        while (firstMonday.getDay() !== 1) {
            firstMonday.setDate(firstMonday.getDate() + 1);
        }

        const weeks: { number: number; start: string; end: string }[] = [];
        let currentMonday = new Date(firstMonday);
        let weekNum = 1;

        while (currentMonday < end) {
            const currentFriday = new Date(currentMonday);
            currentFriday.setDate(currentFriday.getDate() + 4);

            weeks.push({
                number: weekNum++,
                start: currentMonday.toISOString().split('T')[0],
                end: currentFriday.toISOString().split('T')[0]
            });

            currentMonday.setDate(currentMonday.getDate() + 7);
        }
        return weeks;
    };

    const generatedWeeksList = calculateWeeks();

    const handleSaveStudentInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const result = await apiFetch(`/students/${student.id}`, {
                method: "PATCH",
                body: JSON.stringify(student)
            });
            if (result.ok) {
                toast.success("Profile records updated");
                fetchData();
            } else {
                toast.error(result.error || "Update failed");
            }
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveWeeklyLog = async (log: WeeklyLog) => {
        setIsSaving(true);
        try {
            const result = await apiFetch("/weekly-logs", {
                method: "POST",
                body: JSON.stringify({ ...log, studentId: student.id })
            });
            if (result.ok) {
                toast.success(`Week ${log.weekNumber} activity synced`);
                fetchData();
            } else {
                toast.error(result.error || "Synchronization failed");
            }
        } catch (error) {
            toast.error("Synchronization failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmitWeeklyLog = async (log: WeeklyLog) => {
        setIsSaving(true);
        try {
            const saveResult = await apiFetch("/weekly-logs", {
                method: "POST",
                body: JSON.stringify({ ...log, studentId: student.id })
            });

            if (!saveResult.ok) {
                toast.error("Failed to save log details before submission");
                setIsSaving(false);
                return;
            }

            const updatedLogId = log.id || saveResult.data?.id || saveResult.data?.log?.id;

            if (!updatedLogId) {
                toast.error("Could not verify log ID for submission. Save draft first.");
                setIsSaving(false);
                return;
            }

            const result = await apiFetch(`/weekly-logs/${updatedLogId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: "SUBMITTED" })
            });
            if (result.ok) {
                toast.success("Logbook submitted to supervisor");
                fetchData();
            } else {
                toast.error(result.error || "Submission failed");
            }
        } catch (error) {
            toast.error("Submission failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveReport = async () => {
        setIsSaving(true);
        try {
            const result = await apiFetch("/iap-reports", {
                method: "POST",
                body: JSON.stringify({ ...report, studentId: student.id })
            });
            if (result.ok) {
                toast.success("Final report encrypted and saved");
            } else {
                toast.error(result.error || "Analysis save failed");
            }
        } catch (error) {
            toast.error("Analysis save failed");
        } finally {
            setIsSaving(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF() as any;

        // Jost is a clean geometric sans-serif. Since embedding custom TTF requires a local file or base64,
        // we'll use Helvetica/Arial as the standard geometric sans fallback which looks similar in PDF prints.
        const fontName = "helvetica";
        const primaryColor: [number, number, number] = [26, 38, 74];

        // PAGE 1: COVER
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);

        doc.setFontSize(22);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont(fontName, "bold");
        doc.text("INDUSTRIAL ATTACHMENT", 105, 50, { align: "center" });
        doc.setFontSize(30);
        doc.text("LOGBOOK", 105, 65, { align: "center" });

        // Student details
        let y = 100;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Student details:", 20, y);
        y += 10;
        doc.text(`Name of Student: ${student?.fullName || "__________________________________________"}`, 25, y);
        y += 8;
        doc.text(`Date of Birth: ${student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "_____________________________________________"}`, 25, y);
        y += 8;
        doc.text(`ID/Passport No.: ${student?.idOrPassport || "__________________________________________"}`, 25, y);
        y += 8;
        doc.text(`Reg No.: ${student?.studentNumber || "_________________________________________________"}`, 25, y);
        y += 8;
        doc.text(`Cell Phone No.: ${student?.phone || "___________________________________________"}`, 25, y);

        // Company details
        y += 20;
        doc.text("Company/Institution details:", 20, y);
        y += 10;
        doc.text(`Name: ${student?.companyName || "___________________________________________________"}`, 25, y);
        y += 8;
        doc.text(`Address/Location: ${student?.companyAddress || "__________________________________________"}`, 25, y);
        y += 8;
        doc.text(`Tel No.: ${student?.companyPhone || "__________________________________________________"}`, 25, y);
        y += 8;
        doc.text(`Email: ${student?.companyEmail || "___________________________________________________"}`, 25, y);
        y += 8;
        doc.text(`P.O.Box: ${student?.companyPOBox || "_________________________________________________"}`, 25, y);

        // Supervisor details
        y += 20;
        doc.text("Supervisor details:", 20, y);
        y += 10;
        doc.text(`IAP Company Supervisor Name: ${student?.supervisorName || "_______________________________"}`, 25, y);
        y += 8;
        doc.text(`Designation/Title: ${student?.supervisorDesignation || "__________________________________________"}`, 25, y);
        y += 8;
        doc.text(`Tel No.: ${student?.supervisorPhone || "__________________________________________________"}`, 25, y);
        y += 8;
        doc.text(`Email: ${student?.supervisorEmail || "___________________________________________________"}`, 25, y);

        doc.addPage();
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text("IAP OBJECTIVES & GUIDELINES", 105, 13, { align: "center" });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        const objectives = [
            "To develop students and enhance their range of technical and transferable skills.",
            "To expose students to industry practices, trends, and real-world challenges.",
            "To build professional networks and establish industry connections.",
            "To explore career interests and clarify professional goals.",
            "To foster professional growth, resilience, and adaptability.",
            "To integrate academic learning with practical industrial application."
        ];

        let yPos = 35;
        doc.setFont(fontName, "bold");
        doc.text("Primary Objectives:", 20, yPos);
        doc.setFont(fontName, "normal");
        yPos += 8;
        objectives.forEach(obj => {
            doc.text(`• ${obj}`, 25, yPos);
            yPos += 6;
        });

        yPos += 10;
        doc.setFont(fontName, "bold");
        doc.text("Key Compulsory Guidelines for Students:", 20, yPos);
        doc.setFont(fontName, "normal");
        yPos += 8;
        const guidelines = [
            "Maintain regular attendance and puncuality throughout the attachment.",
            "Ensure the logbook is updated daily and reviewed by the supervisor weekly.",
            "Adhere to all safety regulations and company policies at all times.",
            "Maintain a professional attitude and foster positive relationships with colleagues.",
            "Notify the liaison officer immediately in case of any challenges or absence."
        ];
        guidelines.forEach(g => {
            const splitG = doc.splitTextToSize(`- ${g}`, 170);
            doc.text(splitG, 25, yPos);
            yPos += splitG.length * 5 + 1;
        });

        // WEEKLY LOGS
        const drawCheckbox = (x: number, y: number, checked: boolean) => {
            doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(x, y - 3, 4, 4);
            if (checked) {
                doc.setLineWidth(0.5);
                doc.line(x + 1, y - 1, x + 2, y + 1);
                doc.line(x + 2, y + 1, x + 4, y - 3);
                doc.setLineWidth(0.1);
            }
        };

        generatedWeeksList.forEach((week) => {
            const log = getSafeLog(week.number);
            doc.addPage();

            // Header Bar
            doc.setFillColor(245, 247, 250);
            doc.rect(0, 0, 210, 45, 'F');
            doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setLineWidth(1);
            doc.line(0, 45, 210, 45);

            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFontSize(18);
            doc.setFont(fontName, "bold");
            doc.text(`WEEK ${week.number}`, 20, 20);
            doc.setFontSize(10);
            doc.text(`${new Date(week.start).toLocaleDateString()} - ${new Date(week.end).toLocaleDateString()}`, 20, 28);

            // Weekly Summary Box
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(120, 10, 70, 25, 3, 3, 'FD');
            doc.setFontSize(8);
            doc.text("TOTAL WEEKLY HOURS", 130, 20);
            doc.setFontSize(14);
            doc.text(`${log.totalHours || 0} Hours`, 130, 30);

            const days = [
                { name: 'Monday', task: log.mondayTask, hours: log.mondayHours },
                { name: 'Tuesday', task: log.tuesdayTask, hours: log.tuesdayHours },
                { name: 'Wednesday', task: log.wednesdayTask, hours: log.wednesdayHours },
                { name: 'Thursday', task: log.thursdayTask, hours: log.thursdayHours },
                { name: 'Friday', task: log.fridayTask, hours: log.fridayHours },
            ];

            autoTable(doc, {
                startY: 55,
                head: [['DAY', 'NATURE OF WORK / ACTIVITY DESCRIPTION', 'HOURS']],
                body: days.map(d => [d.name.toUpperCase(), d.task || '-', d.hours || 0]),
                theme: 'grid',
                headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 5, font: fontName },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 30 },
                    2: { halign: 'center', cellWidth: 20 }
                }
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;

            // Statement box
            doc.setFontSize(10);
            doc.setFont(fontName, "bold");
            doc.text("General Statement of student's progress:", 20, yPos);
            yPos += 5;
            doc.setFont(fontName, "normal");
            const stmt = doc.splitTextToSize(log.generalStatement || "No summary provided.", 170);
            doc.text(stmt, 25, yPos);
            yPos += stmt.length * 5 + 10;

            // Grading & Approval
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.1);
            doc.line(20, yPos, 190, yPos);
            yPos += 10;

            doc.setFont(fontName, "bold");
            doc.text("Supervisor's Assessment:", 20, yPos);
            yPos += 10;

            const grades = ['A', 'B', 'C', 'D', 'E'];
            let xGrade = 25;
            grades.forEach(g => {
                drawCheckbox(xGrade, yPos, log.grade === g);
                doc.text(g, xGrade + 6, yPos);
                xGrade += 20;
            });

            yPos += 15;
            doc.setFontSize(9);
            doc.text(`Print Name: ${log.supervisorName || '____________________'}`, 20, yPos);
            doc.text(`Date: ${log.supervisorDate || '_____________________'}`, 120, yPos);
            yPos += 10;
            doc.text(`Signature: ${log.supervisorSignature ? '[Signed Digitally]' : '____________________'}`, 20, yPos);
        });

        doc.addPage();
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont(fontName, "bold");
        doc.text("Industrial Attachment Assessment (Employer Copy)", 105, 16, { align: "center" });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont(fontName, "normal");

        yPos = 35;
        doc.text(`Student Name: ${student?.fullName || 'N/A'}`, 20, yPos);
        doc.text(`Department: ${student?.year || 'N/A'}`, 120, yPos);
        yPos += 12;

        doc.setFont(fontName, "bold");
        doc.text("Detailed Marking Scheme", 20, yPos);

        const latestRating = student?.ratings?.[0] || {};
        const knowledgeScore = (latestRating?.knowledgeWirelessOps || 0) + (latestRating?.knowledgeWirelessEst || 0) + (latestRating?.knowledgeWirelessMaint || 0) + (latestRating?.knowledgeApplication || 0);
        const responsibilityScore = (latestRating?.responsibility || 0) + (latestRating?.cooperativeness || 0) + (latestRating?.complianceEtiquette || 0);
        const safetyScore = (latestRating?.safetyAwareness || 0) + (latestRating?.safetyCompliance || 0) + (latestRating?.safetyArrangement || 0);

        autoTable(doc, {
            startY: yPos + 5,
            head: [['Evaluation Category & Items', 'Max', 'Actual']],
            body: [
                [{ content: '1. RELATED KNOWLEDGE', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }, '40', knowledgeScore],
                ['   - Support for wireless network ops', '10', latestRating?.knowledgeWirelessOps || '0'],
                ['   - Establishment of wireless network', '10', latestRating?.knowledgeWirelessEst || '0'],
                ['   - Maintenance of wireless comm room', '10', latestRating?.knowledgeWirelessMaint || '0'],
                ['   - Related knowledge application', '10', latestRating?.knowledgeApplication || '0'],
                [{ content: '2. RESPONSIBILITY & ATTITUDE', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }, '30', responsibilityScore],
                ['   - Reliability & Engagement', '10', latestRating?.responsibility || '0'],
                ['   - Cooperativeness with team', '10', latestRating?.cooperativeness || '0'],
                ['   - Compliance & Etiquette', '10', latestRating?.complianceEtiquette || '0'],
                [{ content: '3. SAFETY MANAGEMENT', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }, '30', safetyScore],
                ['   - Awareness of safety protocols', '10', latestRating?.safetyAwareness || '0'],
                ['   - Compliance with safety rules', '10', latestRating?.safetyCompliance || '0'],
                ['   - Maintenance of safety gear', '10', latestRating?.safetyArrangement || '0'],
                [{ content: 'TOTAL ASSESSMENT SCORE', styles: { fontStyle: 'bold', textColor: primaryColor } }, '100', latestRating?.rating || '0'],
            ],
            theme: 'grid',
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
            styles: { fontSize: 8.5, cellPadding: 4, font: fontName },
            columnStyles: { 0: { cellWidth: 120 } }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.setFont(fontName, "bold");
        doc.text(`Days of Absence: ${student?.absentDays || 0} Days`, 20, yPos);
        yPos += 8;
        doc.setFont(fontName, "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("* 10 points deducted for each unauthorised absence. Unauthorised late arrival (3x) = 1 day absence.", 20, yPos);

        yPos += 15;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont(fontName, "bold");
        doc.text("Overall Performance Review:", 20, yPos);
        yPos += 6;
        doc.setFont(fontName, "normal");
        const review = doc.splitTextToSize(latestRating?.comment || "No formal review submitted yet.", 170);
        doc.text(review, 25, yPos);

        yPos += (review.length * 5) + 20;
        doc.setLineWidth(0.5);
        doc.setDrawColor(0);
        doc.line(20, yPos, 80, yPos);
        doc.line(120, yPos, 180, yPos);
        doc.text("Evaluator Signature", 20, yPos + 5);
        doc.text("Company Stamp", 120, yPos + 5);

        // SATISFACTION & STUDENT REPORT
        doc.addPage();
        doc.setFontSize(16);
        doc.setFont(fontName, "bold");
        doc.text("Industrial Attachment Result Report", 105, 20, { align: "center" });

        autoTable(doc, {
            startY: 30,
            body: [
                ['Student Name', student?.fullName || 'N/A'],
                ['Company Name', student?.companyName || 'N/A'],
                ['IAP Duration', `${student?.internshipStart ? new Date(student.internshipStart).toLocaleDateString() : 'N/A'} to ${student?.internshipEnd ? new Date(student.internshipEnd).toLocaleDateString() : 'N/A'}`],
            ],
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 5, font: fontName },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [248, 250, 252] } }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(12);
        doc.setFont(fontName, "bold");
        doc.text("Student Satisfaction Matrix", 20, yPos);

        autoTable(doc, {
            startY: yPos + 5,
            head: [['Engagement Category', 'Excellent', 'Average', 'Poor']],
            body: [
                ['Satisfaction with Industry Environment', report.satisfactionIndustry === 'Excellent' ? 'TICK' : '', report.satisfactionIndustry === 'Average' ? 'TICK' : '', report.satisfactionIndustry === 'Poor' ? 'TICK' : ''],
                ['Satisfaction with Academic Relevance', report.satisfactionMajor === 'Excellent' ? 'TICK' : '', report.satisfactionMajor === 'Average' ? 'TICK' : '', report.satisfactionMajor === 'Poor' ? 'TICK' : ''],
                ['Satisfaction with Practical Workflow', report.satisfactionPractical === 'Excellent' ? 'TICK' : '', report.satisfactionPractical === 'Average' ? 'TICK' : '', report.satisfactionPractical === 'Poor' ? 'TICK' : ''],
                ['Satisfaction with Instructor Support', report.satisfactionInstructors === 'Excellent' ? 'TICK' : '', report.satisfactionInstructors === 'Average' ? 'TICK' : '', report.satisfactionInstructors === 'Poor' ? 'TICK' : ''],
            ],
            theme: 'grid',
            styles: { fontSize: 9, font: fontName, halign: 'center' },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(12);
        doc.setFont(fontName, "bold");
        doc.text("Programme Activity Checklist", 20, yPos);
        yPos += 8;
        doc.setFont(fontName, "normal");
        doc.setFontSize(10);

        const activities = [
            "Assisting in software development and coding tasks.",
            "Participating in the design, implementation, and testing of SW systems.",
            "Debugging and troubleshooting software issues.",
            "Collaborating with the development team to enhance existing software applications.",
            "Conducting research and feasibility studies for new SW features or technologies.",
            "Writing and maintaining technical documentation and user manuals.",
            "Participating in code reviews and providing feedback on code quality.",
            "Assisting in the development of embedded systems firmware or software.",
            "Testing and validating embedded systems functionality.",
            "Collaborating with HW engineers in the integration of SW and HW components.",
            "Conducting performance optimization and memory management for embedded systems."
        ];

        activities.forEach(a => {
            const isChecked = report.programmeTypes?.includes(a);
            doc.text(`[${isChecked ? 'X' : ' '}] ${a}`, 25, yPos);
            yPos += 6;
        });

        if (report.otherProgrammeDetails) {
            doc.text(`[X] Others: ${report.otherProgrammeDetails}`, 25, yPos);
            yPos += 8;
        }

        yPos = Math.max(yPos + 20, 260);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
        doc.text("Signature of Student: _______________________", 120, yPos);

        doc.save(`RCA_IAP_Portfolio_${student?.fullName?.replace(/\s+/g, '_')}.pdf`);
        toast.success("Professional Portfolio Generated!");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-slate-50">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-primary font-semibold text-sm">Loading Records...</p>
            </div>
        );
    }

    const isAfterInternship = student?.internshipEnd ? new Date() > new Date(student.internshipEnd) : false;

    // FIX 3: helper to update a log field, used to reduce repetition and avoid inline type issues
    const updateLogField = (weekNum: number, field: string, value: any) => {
        const nextLogs = [...weeklyLogs];
        const idx = nextLogs.findIndex(l => l.weekNumber === weekNum);
        const ent: WeeklyLog = getSafeLog(weekNum);
        ent[field] = value;

        if (field.endsWith("Hours")) {
            ent.totalHours =
                (ent.mondayHours ?? 0) +
                (ent.tuesdayHours ?? 0) +
                (ent.wednesdayHours ?? 0) +
                (ent.thursdayHours ?? 0) +
                (ent.fridayHours ?? 0);
        }

        if (idx >= 0) nextLogs[idx] = ent;
        else nextLogs.push(ent);
        setWeeklyLogs(nextLogs);
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 min-h-screen bg-slate-50 font-sans">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-primary/10 pb-8 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Industrial Attachment Logbook</h1>
                    <p className="text-slate-500 text-sm font-medium">Official student placement records and evaluation</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button
                        onClick={generatePDF}
                        disabled={!isAfterInternship && !student?.ratings?.[0]?.rating}
                        className={`rounded-xl h-12 px-6 font-semibold text-sm shadow-sm transition-all ${isAfterInternship || student?.ratings?.[0]?.rating ? 'bg-primary text-white hover:bg-primary/90' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        {isAfterInternship || student?.ratings?.[0]?.rating
                            ? <><Download className="h-4 w-4 mr-2" /> Download Logbook PDF</>
                            : "PDF available after assessment"
                        }
                    </Button>
                </div>
            </div>

            {/* Step Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {steps.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all border ${currentStep === step.id ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                        <step.icon className={`h-4 w-4 ${currentStep === step.id ? 'text-white' : 'text-slate-400'}`} />
                        <span className="text-sm font-semibold whitespace-nowrap">{step.title}</span>
                    </button>
                ))}
            </div>

            <main className="relative min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* STEP 1: GUIDELINES */}
                        {currentStep === 1 && (
                            <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                                <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                    <CardTitle className="text-2xl font-bold text-slate-900">IAP Guidelines & Instructions</CardTitle>
                                    <p className="text-slate-500 text-sm mt-2">Please read the following rules and objectives carefully.</p>
                                </CardHeader>
                                <CardContent className="p-8 prose prose-sm max-w-none text-slate-600">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">IAP Objectives</h3>
                                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                                <li>To develop students and enhance their range of skills that are valuable for future careers, including technical skills and transferable skills such as communication, problem-solving, critical thinking, teamwork, adaptability, and time management.</li>
                                                <li>To expose students to the industry they are interested in or studying, allowing them to gain a deeper understanding of industry practices, trends, challenges, and opportunities.</li>
                                                <li>Opportunity for students to build professional networks and establish connections with industry professionals, facilitating future job opportunities, mentorship, and valuable industry contacts.</li>
                                                <li>Students can explore their career interests and clarify their goals by experiencing a real work environment and gaining insights into different roles, industries, and work cultures.</li>
                                                <li>To foster professional growth in students, challenging them, providing new experiences, and offering feedback to develop self-confidence, resilience, adaptability, and a growth mind-set.</li>
                                                <li>To integrate academic learning with practical application, helping students understand how theoretical concepts and classroom learning align with real-world scenarios, enhancing their overall educational experience.</li>
                                            </ul>

                                            <h3 className="text-lg font-bold text-slate-900 mt-8">Key Points (Compulsory)</h3>
                                            <div className="space-y-4 mt-4">
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                    <h4 className="font-semibold text-slate-900 text-sm mb-2">Before IAP</h4>
                                                    <p>1. Did you meet your IAP coordinator or any Liaison Officer (LO)?</p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                    <h4 className="font-semibold text-slate-900 text-sm mb-2">During IAP</h4>
                                                    <p>2. Did your company supervisor assess you weekly and record on your Log Book?</p>
                                                    <p>3. Did your LO assess your Log Book when you are visited?</p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                    <h4 className="font-semibold text-slate-900 text-sm mb-2">After IAP</h4>
                                                    <p>4. Did you send a Thank You letter to your IAP Company/Institution and give a copy to your LO with a reception stamp & signature? (Compulsory)</p>
                                                    <p>5. Did you complete the Student&apos;s Report Form?</p>
                                                    <p>6. Did you submit your Log Book plus your IAP-Report to your LO for grading within TWO weeks after the completion of IAP?</p>
                                                    <p>7. Did the LO sign your Log Book pages?</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-lg font-bold text-slate-900">IAP Instructions</h3>
                                            <div>
                                                <h4 className="font-bold text-slate-800">1. Rules and Regulations</h4>
                                                <ul className="list-disc pl-5 space-y-2 mt-2 text-sm">
                                                    <li>Once your IAP placement has been confirmed, you are not permitted to change your attachment or withdraw from the program without obtaining approval from the RCA IAP coordinator.</li>
                                                    <li>It is mandatory for you to adhere to the rules and regulations that govern employees of the IAP company or institution to which you are attached.</li>
                                                    <li>Any instances of absenteeism, insubordination, tardiness, or misconduct reported against you will result in disciplinary action.</li>
                                                    <li>Direct negotiation with the company regarding matters such as the duration of your attachment, allowance, working hours, leave of absence, working conditions, and rules is strictly prohibited.</li>
                                                    <li>During your attachment, you are not entitled to any leave or days off, including returning to RCA or your home. However, in case of emergencies, please seek permission from your supervisor for a leave of absence. Your LO must also be notified.</li>
                                                    <li>For non-emergency situations, you must apply for a leave of absence from the company or institution&apos;s supervision and inform your LO. Please contact them during regular working hours, excluding weekends.</li>
                                                    <li>If you become ill, please inform your supervisor that you will be consulting a doctor. A Medical Certificate must be submitted to your supervisor on the day you return to work.</li>
                                                    <li>As an intern, you do not possess the authority to negotiate or influence company-wide decisions, such as changes to the organizational structure, budget allocations, or major strategic initiatives.</li>
                                                    <li>Harassment of any kind, including but not limited to sexual harassment, verbal abuse, or discrimination, will not be tolerated.</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">2. Allowance & Accident</h4>
                                                <ul className="list-disc pl-5 space-y-2 mt-2 text-sm">
                                                    <li>The provision of an allowance by the company you are attached to is not guaranteed, unless specifically mentioned in your Placement Notice.</li>
                                                    <li>In the event of any injuries or hazards, promptly seek medical assistance or contact emergency services.</li>
                                                    <li>It is crucial to inform your supervisor at the IAP site about any accidents that occur.</li>
                                                    <li>Please be aware that you are covered under the RCA student&apos;s Accident Insurance Policy.</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">3. Log Book</h4>
                                                <ul className="list-disc pl-5 space-y-2 mt-2 text-sm">
                                                    <li>Please read the instructions given in this Log Book as well as those written on the forms before completing them. If in doubt, please consult your LO.</li>
                                                    <li>At the end of each day, take some time to reflect on your activities and write down a detailed account of what you worked on.</li>
                                                    <li>Use clear and concise language when describing your activities, focusing on key points and outcomes rather than excessive detail.</li>
                                                    <li>Treat your log book as a valuable resource for self-reflection and future reference.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-12 pt-8 border-t border-slate-200 flex justify-end">
                                        <Button onClick={() => setCurrentStep(2)} className="h-12 px-8 rounded-lg bg-primary text-white font-bold shadow-sm hover:bg-primary/90">
                                            I have read and understood
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* STEP 2: DETAILS & ATTENDANCE */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                                    <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                        <CardTitle className="text-2xl font-bold text-slate-900">Student Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <LogbookInput label="Name of Student" value={student?.fullName} onChange={(v) => setStudent({ ...student, fullName: v })} />
                                            <LogbookInput label="Date of Birth" type="date" value={student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : ''} onChange={(v) => setStudent({ ...student, dateOfBirth: v })} />
                                            <LogbookInput label="Sex" value={student?.sex} onChange={(v) => setStudent({ ...student, sex: v })} />
                                            <LogbookInput label="ID/Passport No." value={student?.idOrPassport} onChange={(v) => setStudent({ ...student, idOrPassport: v })} />
                                            <LogbookInput label="Reg No." value={student?.studentNumber} onChange={(v) => setStudent({ ...student, studentNumber: v })} />
                                            <LogbookInput label="Graduation Year" value={student?.graduationYear} onChange={(v) => setStudent({ ...student, graduationYear: v })} />
                                            <LogbookInput label="Cell Phone No." value={student?.phone} onChange={(v) => setStudent({ ...student, phone: v })} />
                                            <LogbookInput label="Internship Start Date" type="date" value={student?.internshipStart ? new Date(student.internshipStart).toISOString().split('T')[0] : ''} onChange={(v) => setStudent({ ...student, internshipStart: v })} />
                                            <LogbookInput label="Internship End Date" type="date" value={student?.internshipEnd ? new Date(student.internshipEnd).toISOString().split('T')[0] : ''} onChange={(v) => setStudent({ ...student, internshipEnd: v })} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                                    <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                        <CardTitle className="text-2xl font-bold text-slate-900">Company/Institution Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <LogbookInput label="Name" value={student?.companyName} onChange={(v) => setStudent({ ...student, companyName: v })} />
                                            <LogbookInput label="Address/Location" value={student?.companyAddress} onChange={(v) => setStudent({ ...student, companyAddress: v })} />
                                            <LogbookInput label="Tel No." value={student?.companyPhone} onChange={(v) => setStudent({ ...student, companyPhone: v })} />
                                            <LogbookInput label="Email" value={student?.companyEmail} onChange={(v) => setStudent({ ...student, companyEmail: v })} />
                                            <LogbookInput label="P.O.Box" value={student?.companyPOBox} onChange={(v) => setStudent({ ...student, companyPOBox: v })} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                                    <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                        <CardTitle className="text-2xl font-bold text-slate-900">Supervisor Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <LogbookInput label="IAP Company Supervisor Name" value={student?.supervisorName} onChange={(v) => setStudent({ ...student, supervisorName: v })} />
                                            <LogbookInput label="Supervisor Designation/Title" value={student?.supervisorDesignation} onChange={(v) => setStudent({ ...student, supervisorDesignation: v })} />
                                            <LogbookInput label="Supervisor Department" value={student?.supervisorDepartment} onChange={(v) => setStudent({ ...student, supervisorDepartment: v })} />
                                            <LogbookInput label="Supervisor Tel No." value={student?.supervisorPhone} onChange={(v) => setStudent({ ...student, supervisorPhone: v })} />
                                            <LogbookInput label="Supervisor Email" value={student?.supervisorEmail} onChange={(v) => setStudent({ ...student, supervisorEmail: v })} />
                                            <LogbookInput label="RCA Liaison Officer Name" value={student?.liaisonOfficerName} onChange={(v) => setStudent({ ...student, liaisonOfficerName: v })} />
                                            <LogbookInput label="Liaison Officer Tel No." value={student?.liaisonOfficerPhone} onChange={(v) => setStudent({ ...student, liaisonOfficerPhone: v })} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                                    <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                        <div className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-slate-900">Trainee&apos;s Attendance Matrix</CardTitle>
                                                <p className="text-slate-500 text-sm mt-1">15-week presence and absence tracker</p>
                                            </div>
                                            <div className="flex gap-4 text-xs font-semibold">
                                                <span className="flex items-center gap-1 text-slate-600"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Present</span>
                                                <span className="flex items-center gap-1 text-slate-600"><div className="w-3 h-3 bg-red-400 rounded-sm"></div> Absent</span>
                                                <span className="flex items-center gap-1 text-slate-600"><div className="w-3 h-3 bg-slate-200 rounded-sm"></div> Blank</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 overflow-x-auto">
                                        <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                                            <thead>
                                                <tr>
                                                    <th className="border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-700 w-24">Week</th>
                                                    <th className="border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-700 w-32">Date From</th>
                                                    <th className="border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-700 w-32">Date To</th>
                                                    <th className="border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-700">Days Present</th>
                                                    <th className="border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-700">Days Absent</th>
                                                    <th className="border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-700">Supervisor Signature</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {generatedWeeksList.map((weekData, index) => {
                                                    const weekNum = weekData.number;
                                                    const log = weeklyLogs.find(l => l.weekNumber === weekNum);

                                                    const filledDaysCount = [
                                                        log?.mondayTask, log?.tuesdayTask, log?.wednesdayTask,
                                                        log?.thursdayTask, log?.fridayTask
                                                    ].filter(t => t && t.trim().length > 0).length;

                                                    return (
                                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                            <td className="border border-slate-200 p-3 font-medium text-slate-900 text-center">Wk {weekNum}</td>
                                                            <td className="border border-slate-200 p-3 text-slate-600">{weekData ? new Date(weekData.start).toLocaleDateString() : '—'}</td>
                                                            <td className="border border-slate-200 p-3 text-slate-600">{weekData ? new Date(weekData.end).toLocaleDateString() : '—'}</td>
                                                            <td className="border border-slate-200 p-3 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                        <div key={i} className={`w-4 h-4 rounded-sm border ${i < filledDaysCount ? 'bg-green-500 border-green-600' : 'bg-slate-100 border-slate-200'}`}></div>
                                                                    ))}
                                                                    <span className="font-bold text-slate-700 ml-2 w-4">{filledDaysCount}</span>
                                                                </div>
                                                            </td>
                                                            <td className="border border-slate-200 p-3 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {Array.from({ length: 5 - filledDaysCount }).map((_, i) => (
                                                                        <div key={i} className="w-4 h-4 rounded-sm border bg-red-400 border-red-500"></div>
                                                                    ))}
                                                                    <span className="font-bold text-slate-700 ml-2 w-4">{5 - filledDaysCount}</span>
                                                                </div>
                                                            </td>
                                                            <td className="border border-slate-200 p-3 text-center">
                                                                {log?.status === "APPROVED" || log?.supervisorSignature ? (
                                                                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest px-2 py-1 bg-green-50 rounded">Signed & Approved</span>
                                                                ) : log?.status === "SUBMITTED" ? (
                                                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-2 py-1 bg-blue-50 rounded">Submitted</span>
                                                                ) : log?.status === "REJECTED" ? (
                                                                    <span className="text-xs font-bold text-red-600 uppercase tracking-widest px-2 py-1 bg-red-50 rounded">Rejected</span>
                                                                ) : (
                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                    <div className="p-8 border-t border-slate-200 bg-slate-50 flex justify-end">
                                        <Button onClick={handleSaveStudentInfo} disabled={isSaving} className="h-12 px-8 rounded-lg bg-primary text-white font-bold shadow-sm hover:bg-primary/90">
                                            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Save Details & Attendance"}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* STEP 3: WEEKLY LOGS */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                {generatedWeeksList.length === 0 ? (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
                                        <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                                        <h2 className="text-xl font-bold text-slate-700">No Schedule Defined</h2>
                                        <p className="text-slate-500 mt-2 text-sm">Update your profile with internship dates to generate your weekly schedule.</p>
                                        <Button onClick={() => setCurrentStep(2)} className="mt-6">Go to Details</Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Sidebar: Week List */}
                                        <div className="w-full lg:w-1/4 flex flex-col gap-3 max-h-[800px] overflow-y-auto pr-2 pb-4">
                                            {generatedWeeksList.map(w => {
                                                const log = weeklyLogs.find(l => l.weekNumber === w.number);
                                                const isFilled = !!(log?.mondayTask || log?.tuesdayTask || log?.wednesdayTask || log?.thursdayTask || log?.fridayTask);
                                                const isSelected = expandedWeek === w.number;

                                                return (
                                                    <button
                                                        key={w.number}
                                                        onClick={() => setExpandedWeek(w.number)}
                                                        className={`flex items-center justify-between p-4 rounded-xl transition-all border text-left ${isSelected ? 'bg-primary border-primary text-white shadow-md' : isFilled ? 'bg-green-50/50 border-green-200 hover:bg-green-50' : 'bg-white border-slate-200 hover:border-primary/30 hover:bg-slate-50'}`}
                                                    >
                                                        <div>
                                                            <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>Week {w.number}</div>
                                                            <div className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                                                                {new Date(w.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(w.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                {isFilled && <CheckCircle2 className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-green-500'}`} />}
                                                                {log?.status && log.status !== 'DRAFT' && (
                                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${log.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                                        log.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                                                                            'bg-red-100 text-red-700'
                                                                        }`}>
                                                                        {log.status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Main Area: Log Details */}
                                        <div className="w-full lg:w-3/4">
                                            {expandedWeek ? (
                                                <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                                                    <CardHeader className="bg-slate-50 p-6 border-b border-slate-200">
                                                        <div className="flex flex-row items-center justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    <CardTitle className="text-xl font-bold text-slate-900">Week {expandedWeek} Log</CardTitle>
                                                                    <span className="text-xs font-semibold text-slate-500 px-2 py-1 bg-slate-200 rounded-md">
                                                                        {new Date(generatedWeeksList.find(w => w.number === expandedWeek)?.start || "").toLocaleDateString()} — {new Date(generatedWeeksList.find(w => w.number === expandedWeek)?.end || "").toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <p className="text-slate-500 text-sm">Record your daily technical activities and hours below.</p>
                                                            </div>
                                                            <Button variant="ghost" size="sm" onClick={() => setExpandedWeek(null)} className="text-slate-500 hover:text-slate-900 lg:hidden">
                                                                Close
                                                            </Button>
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="p-0">
                                                        {/* Daily Logs Table */}
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-sm text-left">
                                                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                                                    <tr>
                                                                        <th className="p-4 font-semibold w-24">Day</th>
                                                                        <th className="p-4 font-semibold">Description of Work / Activity</th>
                                                                        <th className="p-4 font-semibold w-24 text-center">Hours</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                                                                        const dayKey = day.toLowerCase();
                                                                        const log = getSafeLog(expandedWeek);
                                                                        const isLocked = log.status !== 'DRAFT';

                                                                        return (
                                                                            <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                                                                                <td className="p-4 font-medium text-slate-700">{day}</td>
                                                                                <td className="p-4">
                                                                                    <textarea
                                                                                        disabled={isLocked}
                                                                                        className={`w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-800 resize-none min-h-[80px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${isLocked ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
                                                                                        placeholder={isLocked ? "Log is locked" : `Describe tasks performed on ${day}...`}
                                                                                        value={log[`${dayKey}Task`] || ""}
                                                                                        onChange={(e) => updateLogField(expandedWeek, `${dayKey}Task`, e.target.value)}
                                                                                    />
                                                                                </td>
                                                                                <td className="p-4">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        max="24"
                                                                                        disabled={isLocked}
                                                                                        className={`w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-center text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${isLocked ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
                                                                                        value={log[`${dayKey}Hours`] || ""}
                                                                                        onChange={(e) => updateLogField(expandedWeek, `${dayKey}Hours`, parseFloat(e.target.value) || 0)}
                                                                                    />
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                                <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-900">
                                                                    <tr>
                                                                        <td colSpan={2} className="p-4 text-right">Total Hours for the Week:</td>
                                                                        <td className="p-4 text-center">{getSafeLog(expandedWeek).totalHours || 0}</td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        </div>

                                                        {/* Summary & Supervisor Area */}
                                                        <div className="p-6 border-t border-slate-200 bg-white grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-primary"/> Student's
General
Statement on
Attachment
                                                                    </h4>
                                                                    {/* <p className="text-xs text-slate-500 mt-1">Brief summary of the week&apos;s overall progress and learnings.</p> */}
                                                                </div>
                                                                <textarea
                                                                    disabled={getSafeLog(expandedWeek).status !== 'DRAFT'}
                                                                    className={`w-full h-32 bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-800 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${getSafeLog(expandedWeek).status !== 'DRAFT' ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
                                                                    placeholder="(e.g. After learning the process of production along with an overview of the company's
products in the second week of practice, I was able to understand the characteristics of
company A's products anew. It was also a time to feel once again why production
management is important in product production.)"
                                                                    value={getSafeLog(expandedWeek).generalStatement || ""}
                                                                    onChange={(e) => updateLogField(expandedWeek, 'generalStatement', e.target.value)}
                                                                />
                                                            </div>

                                                            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                                                <div className="w-full">
                                                                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                                                                        <CheckSquare className="h-4 w-4 text-primary" /> Supervisor&apos;s Grading
                                                                    </h4>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-semibold text-slate-500">Grade Awarded</label>
                                                                            <select
                                                                                disabled={true}
                                                                                className="w-full h-10 border border-slate-200 rounded-md px-3 text-sm bg-slate-100 cursor-not-allowed"
                                                                                value={getSafeLog(expandedWeek).grade || ""}
                                                                            >
                                                                                <option value="" disabled>Select A-E...</option>
                                                                                <option value="A">A - Excellent</option>
                                                                                <option value="B">B - Good</option>
                                                                                <option value="C">C - Satisfactory</option>
                                                                                <option value="D">D - Poor</option>
                                                                                <option value="E">E - Unacceptable</option>
                                                                            </select>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-semibold text-slate-500">Date</label>
                                                                            <input
                                                                                type="date"
                                                                                disabled={true}
                                                                                className="w-full h-10 border border-slate-200 rounded-md px-3 text-sm bg-slate-100 cursor-not-allowed"
                                                                                value={getSafeLog(expandedWeek).supervisorDate || ""}
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 space-y-2">
                                                                            <label className="text-xs font-semibold text-slate-500">Supervisor Name</label>
                                                                            <input
                                                                                type="text"
                                                                                disabled={true}
                                                                                className="w-full h-10 border border-slate-200 rounded-md px-3 text-sm bg-slate-100 cursor-not-allowed"
                                                                                value={getSafeLog(expandedWeek).supervisorName || ""}
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-2 flex items-center justify-between mt-2 pt-4 border-t border-slate-200">
                                                                            <label className="text-sm font-semibold text-slate-700">Digital Signature</label>
                                                                            <button
                                                                                disabled={true}
                                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-not-allowed ${getSafeLog(expandedWeek).supervisorSignature ? 'bg-green-500' : 'bg-slate-200'}`}
                                                                            >
                                                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${getSafeLog(expandedWeek).supervisorSignature ? 'translate-x-6' : 'translate-x-1'}`} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
                                                            {getSafeLog(expandedWeek).status === 'DRAFT' ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => handleSaveWeeklyLog(getSafeLog(expandedWeek))}
                                                                        disabled={isSaving}
                                                                        className="h-12 px-8 rounded-lg border-primary text-primary hover:bg-primary/5 font-bold"
                                                                    >
                                                                        Save Draft
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => {
                                                                            handleSubmitWeeklyLog(getSafeLog(expandedWeek));
                                                                        }}
                                                                        disabled={isSaving}
                                                                        className="h-12 px-8 rounded-lg bg-primary text-white font-bold shadow-sm"
                                                                    >
                                                                        {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Submit for Review</>}
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-slate-500 font-bold">
                                                                    <LockKeyhole className="h-5 w-5" />
                                                                    Log is {getSafeLog(expandedWeek).status}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                                                    <FileText className="h-12 w-12 text-slate-300 mb-4" />
                                                    <h3 className="text-xl font-bold text-slate-700">Select a Week</h3>
                                                    <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                                                        Choose a week from the sidebar to view, edit, or submit your daily technical logs.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: RESULT REPORT */}
                        {currentStep === 4 && (
                            <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                                <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                    <CardTitle className="text-2xl font-bold text-slate-900">Engagement Analysis</CardTitle>
                                    <p className="text-slate-500 text-sm mt-1">Final outcome reporting and suggestion vault</p>
                                </CardHeader>
                                <CardContent className="p-8 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <LogbookInput label="LO Visit Count" type="number" value={report.loVisitCount?.toString()} onChange={(v) => setReport({ ...report, loVisitCount: parseInt(v) || 0 })} />
                                        <SurveyButton label="IAP was useful?" active={report.isUseful} onClick={() => setReport({ ...report, isUseful: true })} onDecline={() => setReport({ ...report, isUseful: false })} />
                                        <SurveyButton label="Improved Understanding?" active={report.improvedUnderstanding} onClick={() => setReport({ ...report, improvedUnderstanding: true })} onDecline={() => setReport({ ...report, improvedUnderstanding: false })} />
                                        <SurveyButton label="Provided Experience?" active={report.providedExperiences} onClick={() => setReport({ ...report, providedExperiences: true })} onDecline={() => setReport({ ...report, providedExperiences: false })} />
                                    </div>

                                    <div className="pt-8 border-t border-slate-200">
                                        <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Programme Activity Checklist</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                "Assisting in software development and coding tasks.",
                                                "Participating in the design, implementation, and testing of SW systems.",
                                                "Debugging and troubleshooting software issues.",
                                                "Collaborating with the development team to enhance existing software applications.",
                                                "Conducting research and feasibility studies for new SW features or technologies.",
                                                "Writing and maintaining technical documentation and user manuals.",
                                                "Participating in code reviews and providing feedback on code quality.",
                                                "Assisting in the development of embedded systems firmware or software.",
                                                "Testing and validating embedded systems functionality.",
                                                "Collaborating with HW engineers in the integration of SW and HW components.",
                                                "Conducting performance optimization and memory management for embedded systems."
                                            ].map((activity) => (
                                                <label key={activity} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={report.programmeTypes?.includes(activity)}
                                                        onChange={(e) => {
                                                            const types = report.programmeTypes || [];
                                                            if (e.target.checked) {
                                                                setReport({ ...report, programmeTypes: [...types, activity] });
                                                            } else {
                                                                setReport({ ...report, programmeTypes: types.filter(t => t !== activity) });
                                                            }
                                                        }}
                                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                                                    />
                                                    <span className="text-sm text-slate-700 leading-tight group-hover:text-slate-900 transition-colors">{activity}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-4">
                                            <LogbookInput label="Others (Please describe)" value={report.otherProgrammeDetails} onChange={(v) => setReport({ ...report, otherProgrammeDetails: v })} />
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-200 space-y-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Satisfaction Matrix</h3>
                                            <div className="bg-slate-100 p-1 rounded-lg flex gap-2">
                                                {['Excellent', 'Average', 'Poor'].map(level => (
                                                    <div key={level} className="px-3 py-1 text-[10px] font-bold uppercase text-slate-500">{level}</div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { label: 'Satisfaction with industry', key: 'satisfactionIndustry' },
                                                { label: 'Satisfaction with relevant major', key: 'satisfactionMajor' },
                                                { label: 'Satisfaction with practical work', key: 'satisfactionPractical' },
                                                { label: 'Satisfaction with instructors', key: 'satisfactionInstructors' }
                                            ].map(({ label, key }) => (
                                                <div key={key} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 bg-white">
                                                    <span className="text-sm font-medium text-slate-700">{label}</span>
                                                    <div className="flex gap-4 mt-3 md:mt-0">
                                                        {['Excellent', 'Average', 'Poor'].map((level) => (
                                                            <button
                                                                key={level}
                                                                onClick={() => setReport({ ...report, [key]: level })}
                                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${report[key as keyof IapReport] === level
                                                                    ? 'bg-primary border-primary text-white shadow-md'
                                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                {level}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8 pt-8 border-t border-slate-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Notable Achievements</label>
                                                <textarea
                                                    value={report.notableAchievements || ""}
                                                    onChange={(e) => setReport({ ...report, notableAchievements: e.target.value })}
                                                    className="w-full h-40 rounded-xl bg-white border border-slate-200 p-4 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                                    placeholder="List your key achievements here..."
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Future Career Plans</label>
                                                <textarea
                                                    value={report.futureCareerPlan || ""}
                                                    onChange={(e) => setReport({ ...report, futureCareerPlan: e.target.value })}
                                                    className="w-full h-40 rounded-xl bg-white border border-slate-200 p-4 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                                    placeholder="Detail your career trajectory here..."
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Suggestions to Department</label>
                                            <textarea
                                                value={report.suggestions || ""}
                                                onChange={(e) => setReport({ ...report, suggestions: e.target.value })}
                                                className="w-full h-32 rounded-xl bg-white border border-slate-200 p-4 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                                placeholder="Any feedback for the department..."
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-200 flex justify-end">
                                        <Button onClick={handleSaveReport} disabled={isSaving} className="h-12 px-8 rounded-lg bg-primary text-white font-bold shadow-sm hover:bg-primary/90">
                                            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Save Report"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* STEP 5: ASSESSMENT VAULT */}
                        {currentStep === 5 && (
                            <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                                <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <CardTitle className="text-2xl font-bold text-slate-900">Assessment Vault</CardTitle>
                                            <p className="text-slate-500 text-sm mt-1">Protected supervisor evaluations and final grading</p>
                                        </div>
                                        <div className="h-20 w-24 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</span>
                                            <span className="text-3xl font-black text-primary">
                                                {student?.ratings?.[0]?.rating !== undefined ? `${student.ratings[0].rating}` : "—"}
                                            </span>
                                            {student?.ratings?.[0]?.rating !== undefined && (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">/100</span>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    {student?.ratings?.[0] ? (
                                        <>
                                            {/* Rating Breakdown */}
                                            <div className="space-y-6">
                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3">
                                                    <div className="h-px w-8 bg-slate-200"></div> Detailed Assessment Breakdown
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Knowledge */}
                                                    <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/50 space-y-3">
                                                        <h5 className="text-xs font-black text-blue-700 uppercase tracking-wider">Related Knowledge (40%)</h5>
                                                        {[
                                                            { label: 'Wireless Network Ops', key: 'knowledgeWirelessOps' },
                                                            { label: 'Wireless Network Est.', key: 'knowledgeWirelessEst' },
                                                            { label: 'Wireless Comm Room Maint.', key: 'knowledgeWirelessMaint' },
                                                            { label: 'Knowledge Application', key: 'knowledgeApplication' },
                                                        ].map(item => (
                                                            <div key={item.key} className="flex justify-between items-center">
                                                                <span className="text-xs text-slate-600">{item.label}</span>
                                                                <span className="text-sm font-black text-blue-700">{student.ratings[0][item.key] ?? 0}/10</span>
                                                            </div>
                                                        ))}
                                                        <div className="pt-2 border-t border-blue-200 flex justify-between">
                                                            <span className="text-xs font-bold text-blue-800">Subtotal</span>
                                                            <span className="text-sm font-black text-blue-800">
                                                                {(student.ratings[0].knowledgeWirelessOps || 0) + (student.ratings[0].knowledgeWirelessEst || 0) + (student.ratings[0].knowledgeWirelessMaint || 0) + (student.ratings[0].knowledgeApplication || 0)}/40
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Responsibility */}
                                                    <div className="p-5 rounded-xl border border-amber-100 bg-amber-50/50 space-y-3">
                                                        <h5 className="text-xs font-black text-amber-700 uppercase tracking-wider">Responsibility & Attitude (30%)</h5>
                                                        {[
                                                            { label: 'Responsibility', key: 'responsibility' },
                                                            { label: 'Cooperativeness', key: 'cooperativeness' },
                                                            { label: 'Compliance & Etiquette', key: 'complianceEtiquette' },
                                                        ].map(item => (
                                                            <div key={item.key} className="flex justify-between items-center">
                                                                <span className="text-xs text-slate-600">{item.label}</span>
                                                                <span className="text-sm font-black text-amber-700">{student.ratings[0][item.key] ?? 0}/10</span>
                                                            </div>
                                                        ))}
                                                        <div className="pt-2 border-t border-amber-200 flex justify-between">
                                                            <span className="text-xs font-bold text-amber-800">Subtotal</span>
                                                            <span className="text-sm font-black text-amber-800">
                                                                {(student.ratings[0].responsibility || 0) + (student.ratings[0].cooperativeness || 0) + (student.ratings[0].complianceEtiquette || 0)}/30
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Safety */}
                                                    <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-3">
                                                        <h5 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Safety Management (30%)</h5>
                                                        {[
                                                            { label: 'Safety Awareness', key: 'safetyAwareness' },
                                                            { label: 'Safety Compliance', key: 'safetyCompliance' },
                                                            { label: 'Safety Arrangement', key: 'safetyArrangement' },
                                                        ].map(item => (
                                                            <div key={item.key} className="flex justify-between items-center">
                                                                <span className="text-xs text-slate-600">{item.label}</span>
                                                                <span className="text-sm font-black text-emerald-700">{student.ratings[0][item.key] ?? 0}/10</span>
                                                            </div>
                                                        ))}
                                                        <div className="pt-2 border-t border-emerald-200 flex justify-between">
                                                            <span className="text-xs font-bold text-emerald-800">Subtotal</span>
                                                            <span className="text-sm font-black text-emerald-800">
                                                                {(student.ratings[0].safetyAwareness || 0) + (student.ratings[0].safetyCompliance || 0) + (student.ratings[0].safetyArrangement || 0)}/30
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Comment */}
                                                {student.ratings[0].comment && (
                                                    <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                                                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Supervisor Review</h5>
                                                        <p className="text-sm text-slate-700 italic leading-relaxed">&quot;{student.ratings[0].comment}&quot;</p>
                                                    </div>
                                                )}

                                                {/* Total score display */}
                                                <div className="p-5 rounded-2xl bg-slate-900 text-white flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Final Assessment Score</p>
                                                        <p className="text-3xl font-black">{student.ratings[0].rating} <span className="text-lg text-white/50">/ 100</span></p>
                                                    </div>
                                                    <div className={`h-14 w-14 rounded-full border-2 border-white/20 flex items-center justify-center font-black text-sm ${student.ratings[0].rating >= 80 ? 'bg-green-500/30 text-green-300' :
                                                        student.ratings[0].rating >= 60 ? 'bg-amber-500/30 text-amber-300' :
                                                            'bg-red-500/30 text-red-300'
                                                        }`}>
                                                        {student.ratings[0].rating >= 80 ? 'EX' : student.ratings[0].rating >= 60 ? 'GD' : 'NI'}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-12 text-center text-slate-400 space-y-2">
                                            <LockKeyhole className="h-10 w-10 mx-auto text-slate-300" />
                                            <p className="font-bold text-slate-600">No Assessment Submitted Yet</p>
                                            <p className="text-sm">Your supervisor has not yet submitted the industrial assessment form. Ratings will appear here once submitted.</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-3">
                                                <div className="h-px w-8 bg-slate-200"></div> Industrial Status
                                            </h4>
                                            <div className="flex items-center justify-between p-6 rounded-xl bg-slate-50 border border-slate-200">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-full flex shrink-0 items-center justify-center ${student?.supervisorSignature ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                                        <CheckSquare className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Supervisor Verification</p>
                                                        <p className={`text-xs font-semibold uppercase tracking-wider ${student?.supervisorSignature ? 'text-green-600' : 'text-slate-500'}`}>
                                                            {student?.supervisorSignature ? 'Authenticated' : 'Pending Review'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-3">
                                                <div className="h-px w-8 bg-slate-200"></div> Administrative Status
                                            </h4>
                                            <div className="flex items-center justify-between p-6 rounded-xl bg-slate-50 border border-slate-200">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-full flex shrink-0 items-center justify-center ${student?.loAssigned ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                                                        <ShieldCheck className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Liaison Officer</p>
                                                        <p className={`text-xs font-semibold uppercase tracking-wider ${student?.loAssigned ? 'text-blue-600' : 'text-slate-500'}`}>
                                                            {student?.loAssigned ? 'Assigned & Reviewing' : 'Unassigned'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-4">
                                        <LockKeyhole className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-amber-900">Secure Environment</h4>
                                            <p className="text-amber-800/80 text-sm mt-1 leading-relaxed">
                                                Final grades and assessments in this vault are strictly imported from sealed supervisor documentation. Direct modifications by students are logged and heavily monitored. Discrepancies may result in immediate placement termination.
                                            </p>
                                        </div>
                                    </div>

                                    {student?.ratings?.[0]?.rating && (
                                        <div className="pt-4 flex justify-center">
                                            <Button onClick={generatePDF} className="bg-primary text-white gap-2 h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                                <Download className="h-5 w-5" /> Download Final Logbook Report
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}