"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
};

type TaskStatus = "Not started" | "In progress" | "Blocked" | "Complete";

type TeamTask = {
  id: string;
  title: string;
  assigneeIds: string[];
  dueDate: string;
  status: TaskStatus;
};

const initialMembers: TeamMember[] = [
  {
    id: "tm-1",
    name: "Maria Gomez",
    role: "Lead",
    email: "maria.gomez@city.gov",
  },
  {
    id: "tm-2",
    name: "Ethan Cole",
    role: "Contributor",
    email: "ethan.cole@city.gov",
  },
  {
    id: "tm-3",
    name: "Lila Yu",
    role: "Reviewer",
    email: "lila.yu@city.gov",
  },
];

const initialTasks: TeamTask[] = [
  {
    id: "task-1",
    title: "Draft project narrative outline",
    assigneeIds: ["tm-1", "tm-2"],
    dueDate: "2024-09-10",
    status: "In progress",
  },
  {
    id: "task-2",
    title: "Confirm match funding sources",
    assigneeIds: ["tm-3"],
    dueDate: "2024-09-18",
    status: "Blocked",
  },
  {
    id: "task-3",
    title: "Compile supporting data tables",
    assigneeIds: ["tm-2"],
    dueDate: "2024-09-05",
    status: "Not started",
  },
];

type GrantOverviewTeamPageProps = {
  grantId: string;
};

export default function GrantOverviewTeamPage({
  grantId,
}: GrantOverviewTeamPageProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [tasks, setTasks] = useState<TeamTask[]>(initialTasks);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "Contributor",
    email: "",
  });
  const [newTask, setNewTask] = useState({
    title: "",
    assigneeIds: [] as string[],
    dueDate: "",
    status: "Not started" as TaskStatus,
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState({
    title: "",
    assigneeIds: [] as string[],
    dueDate: "",
    status: "Not started" as TaskStatus,
  });

  const addMember = () => {
    if (!newMember.name.trim() || !newMember.role.trim()) {
      return;
    }
    const id = `tm-${Date.now()}`;
    setMembers((prev) => [
      ...prev,
      {
        id,
        name: newMember.name.trim(),
        role: newMember.role.trim(),
        email: newMember.email.trim() || "unknown@city.gov",
      },
    ]);
    setNewMember({
      name: "",
      role: "Contributor",
      email: "",
    });
  };

  const removeMember = (memberId: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
    setTasks((prev) =>
      prev.map((task) =>
        task.assigneeIds.includes(memberId)
          ? {
              ...task,
              assigneeIds: task.assigneeIds.filter((id) => id !== memberId),
            }
          : task
      )
    );
  };

  const updateMemberRole = (memberId: string, role: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role } : member
      )
    );
  };

  const addTask = () => {
    if (!newTask.title.trim()) {
      return;
    }
    const id = `task-${Date.now()}`;
    setTasks((prev) => [
      ...prev,
      {
        id,
        title: newTask.title.trim(),
        assigneeIds: newTask.assigneeIds,
        dueDate: newTask.dueDate,
        status: newTask.status,
      },
    ]);
    setNewTask({
      title: "",
      assigneeIds: [],
      dueDate: "",
      status: "Not started",
    });
  };

  const toggleNewTaskAssignee = (assigneeId: string) => {
    setNewTask((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(assigneeId)
        ? prev.assigneeIds.filter((id) => id !== assigneeId)
        : [...prev.assigneeIds, assigneeId],
    }));
  };

  const toggleEditTaskAssignee = (assigneeId: string) => {
    setEditTask((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(assigneeId)
        ? prev.assigneeIds.filter((id) => id !== assigneeId)
        : [...prev.assigneeIds, assigneeId],
    }));
  };

  const startEditTask = (task: TeamTask) => {
    setEditingTaskId(task.id);
    setEditTask({
      title: task.title,
      assigneeIds: task.assigneeIds,
      dueDate: task.dueDate,
      status: task.status,
    });
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
  };

  const saveEditTask = (taskId: string) => {
    if (!editTask.title.trim()) {
      return;
    }
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: editTask.title.trim(),
              assigneeIds: editTask.assigneeIds,
              dueDate: editTask.dueDate,
              status: editTask.status,
            }
          : task
      )
    );
    setEditingTaskId(null);
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-72 h-screen sticky top-0 flex-none bg-[#0d2a2b] text-slate-100 px-6 py-8 flex flex-col gap-10">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition"
            href="/dashboard"
          >
            <span aria-hidden="true">&lt;-</span>
            Dashboard
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f9d48f]">
              Pubsup
            </p>
            <h1 className="text-2xl font-semibold font-['Fraunces'] mt-3">
              Grant Command
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Coordinate the team and assign ownership for grant tasks.
            </p>
          </div>
          <nav className="space-y-2 text-sm">
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}`}
            >
              Overview
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}/questions`}
            >
              Questions
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}/documents`}
            >
              Documents
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 bg-white/10 text-white font-medium"
              href={`/overview/${grantId}/team`}
            >
              Team
            </Link>
          </nav>
        </aside>

        <main className="flex-1 px-10 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Grant team
              </p>
              <h2 className="text-4xl font-semibold font-['Fraunces'] mt-3">
                Team ownership
              </h2>
              <p className="text-slate-600 mt-3 max-w-2xl">
                Add collaborators, update their status, and assign tasks to keep
                this grant moving.
              </p>
            </div>
          </div>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Team members
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Update availability, roles, and remove members as needed.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  placeholder="Full name"
                  value={newMember.name}
                  onChange={(event) =>
                    setNewMember((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
                <select
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  value={newMember.role}
                  onChange={(event) =>
                    setNewMember((prev) => ({
                      ...prev,
                      role: event.target.value,
                    }))
                  }
                >
                  <option value="Lead">Lead</option>
                  <option value="Contributor">Contributor</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <input
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  placeholder="Email"
                  value={newMember.email}
                  onChange={(event) =>
                    setNewMember((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <Button
                className="mt-4 bg-[#0d2a2b] hover:bg-[#133d3f] text-white font-semibold"
                onClick={addMember}
              >
                Add member
              </Button>

              <div className="mt-6 space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-2xl outline outline-1 outline-slate-200/60 border border-white/70 bg-white/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {member.role}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {member.email}
                        </p>
                      </div>
                      <button
                        className="text-xs font-semibold text-[#8b4b1a] hover:underline"
                        type="button"
                        onClick={() => removeMember(member.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-600">
                      <span>Role</span>
                      <select
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                        value={member.role}
                        onChange={(event) =>
                          updateMemberRole(member.id, event.target.value)
                        }
                      >
                        <option value="Lead">Lead</option>
                        <option value="Contributor">Contributor</option>
                        <option value="Reviewer">Reviewer</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-6">
              <h3 className="text-lg font-semibold text-slate-900">Tasks</h3>
              <p className="text-sm text-slate-600 mt-2">
                Assign tasks to team members and track status.
              </p>

              <div className="mt-6 space-y-3">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(event) =>
                      setNewTask((prev) => ({
                        ...prev,
                        dueDate: event.target.value,
                      }))
                    }
                  />
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    value={newTask.status}
                    onChange={(event) =>
                      setNewTask((prev) => ({
                        ...prev,
                        status: event.target.value as TaskStatus,
                      }))
                    }
                  >
                    <option value="Not started">Not started</option>
                    <option value="In progress">In progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Assign to
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-700">
                    {members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1"
                      >
                        <input
                          checked={newTask.assigneeIds.includes(member.id)}
                          onChange={() => toggleNewTaskAssignee(member.id)}
                          type="checkbox"
                        />
                        {member.name}
                      </label>
                    ))}
                  </div>
                </div>
                <Button
                  className="bg-[#f29f5c] text-[#0d2a2b] hover:bg-[#f6b57f] font-semibold"
                  onClick={addTask}
                >
                  Add task
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                {tasks.map((task) => {
                  const assignees = members.filter((member) =>
                    task.assigneeIds.includes(member.id)
                  );
                  const isEditing = editingTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-xl outline outline-1 outline-slate-200/60 border border-white/70 bg-white/80 px-4 py-3"
                    >
                      {!isEditing ? (
                        <>
                          <div className="flex items-start justify-between gap-4 w-full">
                            <div>
                              <p className="font-semibold text-slate-900 wrap-anywhere">
                                {task.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-2">
                                Due {task.dueDate || "TBD"}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                                {(assignees.length > 0
                                  ? assignees
                                  : [{ id: "na", name: "Unassigned" }]
                                ).map((member) => (
                                  <span
                                    key={member.id}
                                    className="rounded-full bg-white/80 px-3 py-1"
                                  >
                                    {member.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="rounded-full bg-[#0d2a2b]/10 px-3 py-1 font-semibold text-[#0d2a2b]">
                                {task.status}
                              </span>
                              <button
                                className="text-xs font-semibold text-[#0d2a2b] hover:underline"
                                type="button"
                                onClick={() => startEditTask(task)}
                              >
                                Edit
                              </button>
                              <button
                                className="text-xs font-semibold text-[#8b4b1a] hover:underline"
                                type="button"
                                onClick={() => removeTask(task.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <input
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                            value={editTask.title}
                            onChange={(event) =>
                              setEditTask((prev) => ({
                                ...prev,
                                title: event.target.value,
                              }))
                            }
                          />
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                              type="date"
                              value={editTask.dueDate}
                              onChange={(event) =>
                                setEditTask((prev) => ({
                                  ...prev,
                                  dueDate: event.target.value,
                                }))
                              }
                            />
                            <select
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                              value={editTask.status}
                              onChange={(event) =>
                                setEditTask((prev) => ({
                                  ...prev,
                                  status: event.target.value as TaskStatus,
                                }))
                              }
                            >
                              <option value="Not started">Not started</option>
                              <option value="In progress">In progress</option>
                              <option value="Blocked">Blocked</option>
                              <option value="Complete">Complete</option>
                            </select>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              Assigned to
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-700">
                              {members.map((member) => (
                                <label
                                  key={member.id}
                                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1"
                                >
                                  <input
                                    checked={editTask.assigneeIds.includes(
                                      member.id
                                    )}
                                    onChange={() =>
                                      toggleEditTaskAssignee(member.id)
                                    }
                                    type="checkbox"
                                  />
                                  {member.name}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              className="bg-[#0d2a2b] hover:bg-[#133d3f] text-white font-semibold"
                              onClick={() => saveEditTask(task.id)}
                            >
                              Save
                            </Button>
                            <button
                              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                              type="button"
                              onClick={cancelEditTask}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
