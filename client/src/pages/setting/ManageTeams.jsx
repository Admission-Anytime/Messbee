import { useState } from "react";
import {
  UserGroupIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ManageTeams = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "Sales Team",
      description: "Handles all sales-related inquiries",
      members: 5,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Support Team",
      description: "Customer support and assistance",
      members: 8,
      createdAt: "2024-01-20",
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [deleteTeamId, setDeleteTeamId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleCreateTeam = (e) => {
    e.preventDefault();
    const newTeam = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      members: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTeams([...teams, newTeam]);
    setFormData({ name: "", description: "" });
    setIsCreateModalOpen(false);
  };

  const handleEditTeam = (e) => {
    e.preventDefault();
    setTeams(
      teams.map((team) =>
        team.id === selectedTeam.id
          ? { ...team, name: formData.name, description: formData.description }
          : team
      )
    );
    setIsEditModalOpen(false);
    setSelectedTeam(null);
    setFormData({ name: "", description: "" });
  };

  const handleDeleteTeam = () => {
    setTeams(teams.filter((team) => team.id !== deleteTeamId));
    setDeleteTeamId(null);
  };

  const openEditModal = (team) => {
    setSelectedTeam(team);
    setFormData({ name: team.name, description: team.description });
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">Manage Teams</h1>
            <button className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
              ?
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Total teams: {teams.length}
            </span>

            <button
              onClick={() => {
                setFormData({ name: "", description: "" });
                setIsCreateModalOpen(true);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Team</span>
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              No teams created yet. Create your first team to get started.
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-xs text-gray-500">
                        {team.members} {team.members === 1 ? "member" : "members"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(team)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTeamId(team.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                <p className="text-xs text-gray-400">Created: {team.createdAt}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Team</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="px-6 py-5">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-800 mb-2">Team Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sales Team"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the team's purpose"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Team</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTeam} className="px-6 py-5">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-800 mb-2">Team Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTeamId(null)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Delete Team?</h3>
              <p className="mt-1 text-sm text-gray-600">
                This action cannot be undone. All team data will be permanently deleted.
              </p>
            </div>

            <div className="p-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTeamId(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeams;
