import { useState } from "react";
import Select, { type MultiValue } from "react-select";
import { FaSave, FaUser } from "react-icons/fa";
import useUsers from "../../../hooks/useUsers";
import { customSelectStyles } from "../../../utils";

type RoleOption = {
  value: string;
  label: string;
};

function AdminUsers() {
  const { users, updateUserRole, loading } = useUsers();
  const [selectedRoles, setSelectedRoles] = useState<{
    [key: string]: string[];
  }>({});
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});

  const roleOptions = (): RoleOption[] => [
    { value: "ADMIN", label: "ADMIN" },
    { value: "CHEF", label: "CHEF" },
    { value: "WAITER", label: "WAITER" },
    { value: "USER", label: "USER" }
  ];
  
  const handleRoleChange = (
    userId: string,
    selected: MultiValue<{ value: string; label: string }>
  ) => {
    const roles = selected.map(
      (option: { value: string; label: string }) => option.value
    );
    setSelectedRoles((prev) => ({ ...prev, [userId]: roles }));
  };

  const saveRoleChange = async (userId: string) => {
    const roles = selectedRoles[userId] ?? [];

    setIsSaving((prev) => ({ ...prev, [userId]: true }));
    try {
      await updateUserRole(userId, roles);
    } finally {
      setIsSaving((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="admin-carousel">
        <div className="loading-state">
          <div className="dash-loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4 text-center">
        <h2 className="fw-bold text-center text-gradient text-primary">
          <FaUser className="w-100 me-2" />
          User Management
        </h2>
        <p className="text-muted">Manage user roles and permissions</p>
      </div>

      <div className="card shadow-soft border-0 rounded-3 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0 h-100">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-uppercase small fw-bold">
                    User Information
                  </th>
                  <th className="py-3 text-uppercase small fw-bold">
                    Current Roles
                  </th>
                  <th className="py-3 text-uppercase small fw-bold">
                    Assign Roles
                  </th>
                  <th className="pe-4 py-3 text-uppercase small fw-bold text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const currentRoles =
                    selectedRoles[user.id] ?? user.roles ?? [];

                  return (
                    <tr key={user.id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex flex-column">
                          <span className="fw-semibold">{user.name}</span>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </td>
                      <td className="py-3">
                        {user.roles?.length ? (
                          <span className="badge bg-info-subtle text-info">
                            {user.roles.join(", ")}
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary">
                            No roles
                          </span>
                        )}
                      </td>
                      <td className="py-3" style={{ minWidth: "220px" }}>
                        <Select
                          isMulti
                          options={roleOptions()}
                          value={currentRoles.map((r: string) => ({
                            value: r,
                            label: r,
                          }))}
                          styles={customSelectStyles}
                          onChange={(selected) =>
                            handleRoleChange(user.id, selected)
                          }
                          className="basic-multi-select"
                          classNamePrefix="select"
                        />
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <button
                          className="btn btn-success btn-sm rounded-pill px-3"
                          onClick={() => saveRoleChange(user.id)}
                          disabled={isSaving[user.id]}
                        >
                          {isSaving[user.id] ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <>
                              <FaSave className="me-1" /> Save
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
