import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProjects, createProject, deleteProject} from "../../features/projects/projectSlice";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { formatDate } from "../../utils/format";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar, Users, ClipboardList } from "lucide-react";

const avatarColors = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];
const getColor = (name) =>
  avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const statusVariant = {
  on_track: "bg-teal-100 text-teal-700 border-teal-200",
  delayed: "bg-red-100 text-red-600 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
};

const initForm = { name: "", description: "", start_date: "", end_date: "" };

export default function ProjectList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const {
    list: projects,
    pagination,
    loading,
  } = useSelector((s) => s.projects);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(
      fetchProjects({
        search,
        status: status === "all" ? "" : status,
        page,
        limit: 8,
      }),
    );
  }, [search, status, page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await dispatch(createProject(form));
    setSubmitting(false);
    setShowModal(false);
    setForm(initForm);
    dispatch(
      fetchProjects({
        search,
        status: status === "all" ? "" : status,
        page,
        limit: 8,
      }),
    );
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this project?")) return;
    await dispatch(deleteProject(id));
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 text-sm";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {pagination?.total ?? 0} total projects
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowModal(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white gap-2"
          >
            <Plus size={16} /> New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 bg-white border-slate-200 text-slate-700 focus-visible:ring-teal-400"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44 bg-white border-slate-200 text-slate-700">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="on_track">On Track</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Card className="border-slate-200 shadow-none">
            <CardContent className="p-0">
              {projects.length === 0 && (
                <p className="text-center text-slate-400 py-12 text-sm">
                  No projects found.
                </p>
              )}
              {projects.map((project, i) => (
                <div key={project.id}>
                  <div
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <p className="font-semibold text-slate-800 truncate group-hover:text-teal-600 transition-colors">
                          {project.name}
                        </p>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize shrink-0 ${statusVariant[project.status] || "bg-slate-100 text-slate-500"}`}
                        >
                          {project.status?.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(project.start_date)} →{" "}
                          {formatDate(project.end_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {project.members?.length ?? 0} members
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardList size={12} />
                          {project.tasks_count ?? 0} tasks
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4 shrink-0">
                      {/* Avatars */}
                      <div className="hidden md:flex -space-x-2">
                        {project.members?.slice(0, 3).map((m) => (
                          <Avatar
                            key={m.id}
                            className="w-7 h-7 ring-2 ring-white"
                          >
                            <AvatarFallback
                              className={`${getColor(m.user?.name)} text-white text-xs font-semibold`}
                            >
                              {getInitials(m.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>

                      {/* Progress */}
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="font-semibold text-teal-600">
                            {project.progress ?? 0}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${project.progress ?? 0}%` }}
                          />
                        </div>
                      </div>

                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(e, project.id)}
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 w-8 h-8"
                        >
                          <Trash2 size={15} />
                        </Button>
                      )}
                    </div>
                  </div>
                  {i < projects.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="gap-1 text-slate-600"
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="text-sm text-slate-500 px-2">
                {pagination.currentPage} / {pagination.lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="gap-1 text-slate-600"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setForm(initForm);
        }}
        title="Create New Project"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Project Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Website Redesign"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Project description..."
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Start Date</label>
              <input
                required
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">End Date</label>
              <input
                required
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              {submitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
