import type { Dispatch, SetStateAction } from "react";
import type { AssignmentOut, SubmissionOut } from "../../../types/types";
import type { AssignmentFormState } from "./utils";
import { formatDate, getSubmitterLabel } from "./utils";
import {
  MdAssignment,
  MdEdit,
  MdDelete,
  MdAdd,
  MdUpdate,
  MdUpload,
  MdCheckCircle,
  MdSchedule,
  MdScore,
  MdGrade,
  MdPerson,
  MdDownload,
  MdAttachFile
} from "react-icons/md";
import { FiFileText, FiCalendar, FiUser } from "react-icons/fi";

type Props = {
  mode: "assignments" | "submissions";
  assignments: AssignmentOut[];
  selectedAssignmentId: string;
  setSelectedAssignmentId: Dispatch<SetStateAction<string>>;
  canManageAssignments: boolean;
  assignmentForm: AssignmentFormState;
  setAssignmentForm: Dispatch<SetStateAction<AssignmentFormState>>;
  editingAssignment: AssignmentOut | null;
  setEditingAssignment: Dispatch<SetStateAction<AssignmentOut | null>>;
  onAssignmentSubmit: () => void;
  onDeleteAssignment: (assignmentId: string) => void;
  isStudent: boolean;
  studentSubmit: { text_answer: string; file_url: string };
  setStudentSubmit: Dispatch<SetStateAction<{ text_answer: string; file_url: string }>>;
  onStudentSubmit: () => void;
  mySubmission: SubmissionOut | null;
  submissions: SubmissionOut[];
  gradeDrafts: Record<string, string>;
  setGradeDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  onGrade: (submissionId: string) => void;
};

function AssignmentsSection({
  mode,
  assignments,
  selectedAssignmentId,
  setSelectedAssignmentId,
  canManageAssignments,
  assignmentForm,
  setAssignmentForm,
  editingAssignment,
  setEditingAssignment,
  onAssignmentSubmit,
  onDeleteAssignment,
  isStudent,
  studentSubmit,
  setStudentSubmit,
  onStudentSubmit,
  mySubmission,
  submissions,
  gradeDrafts,
  setGradeDrafts,
  onGrade
}: Props) {
  const selectedAssignment = assignments.find((item) => item.id === selectedAssignmentId) ?? null;

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200/50 bg-gradient-to-b from-white to-slate-50/50 p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 p-3 text-white">
            <MdAssignment size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {mode === "assignments" ? "Course Assignments" : "Submissions"}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === "assignments" ? "Manage and track all assignments" : "Review student submissions"}
            </p>
          </div>
        </div>
        
        <div className="rounded-full bg-gradient-to-r from-cyan-50 to-emerald-50 px-4 py-2 border border-cyan-200/50">
          <span className="text-sm font-semibold text-cyan-700">
            Total: {assignments.length}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {!assignments.length && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50/80 to-white p-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center">
            <MdAssignment className="text-slate-400" size={32} />
          </div>
          <p className="text-slate-600 font-medium">No assignments available</p>
          <p className="text-sm text-slate-500 mt-1">
            {canManageAssignments ? "Create your first assignment to get started" : "No assignments have been created yet"}
          </p>
        </div>
      )}

      {/* Assignments List */}
      {!!assignments.length && (
        <div className="space-y-3">
          {assignments
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((assignment) => {
              const isSelected = selectedAssignmentId === assignment.id;
              
              return (
                <div
                  key={assignment.id}
                  className={`group rounded-2xl border p-4 transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-50/80 to-emerald-50/80 border-2 border-cyan-400 shadow-lg shadow-cyan-200/30"
                      : "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md"
                  }`}
                >
                  <button 
                    className="w-full text-left"
                    onClick={() => setSelectedAssignmentId(assignment.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                            : "bg-gradient-to-b from-slate-100 to-slate-200 text-slate-600"
                        }`}>
                          <span className="text-lg font-bold">#{assignment.order}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-base font-semibold text-slate-900">{assignment.title}</p>
                            {assignment.is_required && (
                              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                            {assignment.description || "No description provided"}
                          </p>
                          
                          {/* Stats */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                              <FiCalendar size={12} />
                              Due: {formatDate(assignment.due_at)}
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                              <MdScore size={12} />
                              Max score: {assignment.max_score ?? "N/A"}
                            </div>
                            {mode === "submissions" && selectedAssignmentId === assignment.id && (
                              <div className="flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 text-xs text-cyan-700">
                                <FiUser size={12} />
                                {submissions.length} submissions
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Selection indicator */}
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500"
                          : "border-slate-300 group-hover:border-cyan-400"
                      }`}>
                        {isSelected && (
                          <div className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Admin Actions */}
                  {canManageAssignments && mode === "assignments" && (
                    <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
                      <button
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-50 to-emerald-50 px-4 py-2 text-sm font-medium text-cyan-700 hover:shadow-md transition-all duration-300 border border-cyan-200"
                        onClick={() => {
                          setEditingAssignment(assignment);
                          setAssignmentForm({
                            title: assignment.title,
                            description: assignment.description || "",
                            order: assignment.order,
                            due_at: assignment.due_at ? new Date(assignment.due_at).toISOString().slice(0, 16) : "",
                            max_score: assignment.max_score ? String(assignment.max_score) : "",
                            is_required: assignment.is_required,
                          });
                        }}
                      >
                        <MdEdit size={16} />
                        Edit
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-2 text-sm font-medium text-rose-700 hover:shadow-md transition-all duration-300 border border-rose-200"
                        onClick={() => onDeleteAssignment(assignment.id)}
                      >
                        <MdDelete size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Assignment Form (Admin Only) */}
      {canManageAssignments && mode === "assignments" && (
        <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50/80 border border-slate-200/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 p-2 text-white">
              {editingAssignment ? <MdUpdate size={20} /> : <MdAdd size={20} />}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingAssignment ? "Update Assignment" : "Create New Assignment"}
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                value={assignmentForm.title}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Enter assignment title"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={assignmentForm.description}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Provide detailed instructions"
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none transition-all resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Order</label>
                <input
                  type="number"
                  value={assignmentForm.order}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none transition-all"
                  placeholder="Sequence number"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Max Score</label>
                <input
                  type="number"
                  value={assignmentForm.max_score}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, max_score: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none transition-all"
                  placeholder="Maximum points"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Due Date</label>
                <input
                  type="datetime-local"
                  value={assignmentForm.due_at}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, due_at: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_required"
                checked={assignmentForm.is_required}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, is_required: event.target.checked }))}
                className="h-5 w-5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-400"
              />
              <label htmlFor="is_required" className="text-sm font-medium text-slate-700">
                Required Assignment
              </label>
            </div>
            
            <button
              onClick={onAssignmentSubmit}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-white hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {editingAssignment ? (
                <>
                  <MdUpdate size={18} />
                  Update Assignment
                </>
              ) : (
                <>
                  <MdAdd size={18} />
                  Create Assignment
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Student Submission Form */}
      {isStudent && selectedAssignmentId && mode === "submissions" && (
        <div className="rounded-2xl bg-gradient-to-b from-white to-emerald-50/30 border border-emerald-200/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 p-2 text-white">
              <MdUpload size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Submit Assignment: <span className="text-emerald-700">{selectedAssignment?.title}</span>
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Text Answer</label>
              <textarea
                value={studentSubmit.text_answer}
                onChange={(event) => setStudentSubmit((prev) => ({ ...prev, text_answer: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all resize-none"
                placeholder="Type your answer here..."
                rows={4}
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">File URL</label>
              <div className="flex gap-2">
                <input
                  value={studentSubmit.file_url}
                  onChange={(event) => setStudentSubmit((prev) => ({ ...prev, file_url: event.target.value }))}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                  placeholder="https://example.com/your-file.pdf"
                />
                <button className="rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-3 text-sm font-semibold text-white hover:shadow-md transition-all duration-300 flex items-center gap-2">
                  <MdAttachFile size={16} />
                  Attach
                </button>
              </div>
            </div>
            
            <button 
              onClick={onStudentSubmit}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-semibold text-white hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MdUpload size={18} />
              Submit Assignment
            </button>
            
            {/* Submission Status */}
            {mySubmission ? (
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-emerald-500" size={24} />
                    <div>
                      <p className="font-semibold text-emerald-700">Submission Submitted</p>
                      <p className="text-sm text-emerald-600">
                        Status: <span className="font-medium capitalize">{mySubmission.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-600">Submitted on</p>
                    <p className="font-medium text-emerald-700">{formatDate(mySubmission.submitted_at)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
                <MdSchedule className="mx-auto text-slate-400 mb-3" size={32} />
                <p className="text-slate-600 font-medium">Not Submitted Yet</p>
                <p className="text-sm text-slate-500 mt-1">Complete and submit your assignment</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructor Grading Section */}
      {canManageAssignments && selectedAssignmentId && mode === "submissions" && (
        <div className="rounded-2xl bg-gradient-to-b from-white to-violet-50/30 border border-violet-200/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 p-2 text-white">
                <MdGrade size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Submissions</h3>
                <p className="text-sm text-slate-500">
                  {selectedAssignment?.title} • {submissions.length} submissions
                </p>
              </div>
            </div>
            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-md transition-all duration-300 flex items-center gap-2">
              <MdDownload size={16} />
              Export All
            </button>
          </div>
          
          {!submissions.length ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
              <FiFileText className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-slate-600 font-medium">No submissions yet</p>
              <p className="text-sm text-slate-500 mt-1">Students haven't submitted this assignment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                        <MdPerson className="text-slate-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{getSubmitterLabel(item)}</p>
                        <p className="text-sm text-slate-500">
                          Submitted: {formatDate(item.submitted_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.status === 'graded' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : item.status === 'submitted'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Grading Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Grade</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={gradeDrafts[item.id] ?? ""}
                          onChange={(event) => setGradeDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
                          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                          placeholder="Enter score"
                          min="0"
                        />
                        <span className="text-sm text-slate-500">/ {selectedAssignment?.max_score}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => onGrade(item.id)}
                        className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                      >
                        <MdGrade size={16} />
                        Grade
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default AssignmentsSection;