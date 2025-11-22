import useTeams from "../../hooks/useTeams";
import { Plus, PeopleFill, Person, Trash } from "react-bootstrap-icons";
import AddTeamModal from "./AddTeamModal";
import { useState, useRef, useEffect } from "react";
import type { Team, User } from "../../types/types";
import useUsers from "../../hooks/useUsers";
import Select from "react-select";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";
import { FaTrash } from "react-icons/fa";

function TeamList() {
  const { users } = useUsers();
  const { teams, deleteTeam, addMembersToTeam, updateTeamByName } = useTeams();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<{
    [key: number]: any[];
  }>({});
  
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editingTeamName, setEditingTeamName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCloseModal = () => {
    setOpenAddModal(false);
  };

  const userOptions =
    users?.map((user: User) => ({
      value: user.id.toString(),
      label: user.username,
    })) || [];

  const handleAddMembers = (teamId: number) => {
    const selectedUserIds =
      selectedMembers[teamId]?.map((user) => parseInt(user.value)) || [];
    if (selectedUserIds.length > 0) {
      addMembersToTeam({ teamId, userIds: selectedUserIds });
      setSelectedMembers((prev) => ({ ...prev, [teamId]: [] }));
    }
  };

  const handleMemberSelectChange = (teamId: number, selectedOptions: any) => {
    setSelectedMembers((prev) => ({
      ...prev,
      [teamId]: selectedOptions || [],
    }));
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setTeamToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (teamToDelete) {
      deleteTeam(teamToDelete.id);
      setDeleteModalOpen(false);
      setTeamToDelete(null);
    }
  };

   const handleDoubleClick = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTeamName(e.target.value);
  };

  const handleNameSave = () => {
    if (editingTeamId && editingTeamName.trim()) {
      updateTeamByName({ 
        teamId: editingTeamId, 
        new_name: editingTeamName.trim() 
      });
    }
    setEditingTeamId(null);
    setEditingTeamName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditingTeamId(null);
      setEditingTeamName("");
    }
  };

  const handleBlur = () => {
    handleNameSave();
  };

  useEffect(() => {
    if (editingTeamId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTeamId]);

  return (
    <div className="team-list">
      <div className="projects-header">
        <h2 className="projects-title">
          <PeopleFill size={24} />
          Teams
        </h2>
        <button
          onClick={() => setOpenAddModal(true)}
          className="create-team-btn"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      <div className="team-list-content">
        {teams.map((team) => (
          <div key={team.id} className="team-item">
            <div className="team-item-header">
              <div className="team-name-container">
                {editingTeamId === team.id ? (
                  <TextField
                    value={editingTeamName}
                    onChange={handleNameChange}
                    onKeyPress={handleKeyPress}
                    onBlur={handleBlur}
                    inputRef={inputRef}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputBase-input': {
                        padding: '8px 12px',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                      }
                    }}
                  />
                ) : (
                  <h3 
                    className="team-name"
                    onDoubleClick={() => handleDoubleClick(team)}
                  >
                    <PeopleFill size={18} />
                    {team.name}
                  </h3>
                )}
              </div>
              <div className="team-actions">
                <button
                  className="add-member-btn"
                  onClick={() => handleAddMembers(team.id)}
                >
                  <Plus size={16} />
                  Add Member
                </button>
                <button
                  className="team-delete-btn"
                  onClick={() => handleDeleteClick(team)}
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            <div className="team-members">
              <Person size={14} />
              Members:
              <span className="member-count">{team.members.length}</span>
            </div>
            <div className="member-select-dropdown">
              <Select
                isMulti
                options={userOptions}
                value={selectedMembers[team.id] || []}
                onChange={(selected) =>
                  handleMemberSelectChange(team.id, selected)
                }
                placeholder="Select team members..."
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                    position: "fixed",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    position: "absolute",
                  }),
                  container: (base) => ({
                    ...base,
                    position: "relative",
                    zIndex: 1000,
                  }),
                  control: (base) => ({
                    ...base,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }),
                }}
              />
            </div>
            <div className="member-list">
                {team.members.length > 0 ? (
                  team.members.map((member, index) => (
                    <span key={member.id} className="member-tag">
                      {member.username}
                      {index < team.members.length - 1 && ', '}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                    No members yet
                  </span>
                )}
              </div>
          </div>
        ))}
      </div>

      <AddTeamModal
        openAddModal={openAddModal}
        handleCloseModal={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleCancelDelete}
        className="delete-confirmation-modal"
        PaperProps={{
          className: "modal-paper",
        }}
      >
        <DialogTitle className="modal-title">
          <FaTrash className="title-icon" />
          Delete Team
        </DialogTitle>

        <DialogContent className="modal-content">
          <Typography className="modal-message">
            Are you sure you want to delete "
            <span className="team-name-highlight">
              {teamToDelete?.name || "this team"}
            </span>
            "?
            <br />
            <span className="warning-text">This action cannot be undone.</span>
          </Typography>
        </DialogContent>

        <DialogActions className="modal-actions">
          <Button
            onClick={handleCancelDelete}
            className="cancel-btn"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className="confirm-delete-btn"
            variant="contained"
            startIcon={<FaTrash />}
            color="error"
          >
            Delete Team
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TeamList;