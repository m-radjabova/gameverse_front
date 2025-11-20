import StatusCard from "./StatusCard";
import useTasks from "../../hooks/useTasks";
import Select from "react-select";
import useUsers from "../../hooks/useUsers";
import { TextField, Button } from "@mui/material";
import { useState, useMemo } from "react";
import type {
  User,
  FilterState,
  FilterParams,
  UserOption,
  SelectOption,
  StatusType,
  PriorityType,
} from "../../types/types";
import { inputStyles } from "../../utils";
import { Calendar, Flag, People } from "react-bootstrap-icons";

function Projects() {
  const [filters, setFilters] = useState<FilterState>({
    assignees: [],
    priority: "ALL",
    from_date: "",
  });

  const filterParams = useMemo((): FilterParams => {
    const params: FilterParams = {};

    if (filters.assignees.length > 0) {
      params.assignee_id = filters.assignees[0];
    }

    if (filters.priority && filters.priority !== "ALL") {
      params.priority = filters.priority as PriorityType;
    }

    if (filters.from_date) {
      params.from_date = filters.from_date;
    }

    return params;
  }, [filters]);

  const { taskStatus, tasks } = useTasks(filterParams);
  const { users } = useUsers();

  const userOptions: UserOption[] =
    users?.map((user: User) => ({
      value: user.id.toString(),
      label: user.username,
    })) || [];

  const priorityOptions: SelectOption[] = [
    { value: "ALL", label: "All Priorities" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  const handleAssigneeChange = (
    selectedOptions: readonly UserOption[] | null
  ) => {
    const selectedIds = selectedOptions
      ? selectedOptions.map((option: UserOption) => parseInt(option.value))
      : [];

    setFilters((prev) => ({
      ...prev,
      assignees: selectedIds,
    }));
  };

  const handlePriorityChange = (selectedOption: SelectOption | null) => {
    setFilters((prev) => ({
      ...prev,
      priority: selectedOption?.value || "ALL",
    }));
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      from_date: event.target.value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      assignees: [],
      priority: "ALL",
      from_date: "",
    });
  };

  const hasActiveFilters =
    filters.assignees.length > 0 ||
    filters.priority !== "ALL" ||
    filters.from_date !== "";

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1 className="projects-title">Projects</h1>
        <Button
          variant="outlined"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="clear-filters-btn"
        >
          Clear Filters
        </Button>
      </div>

      <div className="projects-filters">
        <div className="user-filter">
          <div className="filter-label">
            <People size={20} />
            Team Members
          </div>
          <Select<UserOption, true>
            isMulti
            options={userOptions}
            placeholder="Select team members..."
            className="react-select-container"
            classNamePrefix="react-select"
            value={userOptions.filter((option) =>
              filters.assignees.includes(parseInt(option.value))
            )}
            onChange={handleAssigneeChange}
          />
        </div>

        <div className="priority-filter">
          <div className="filter-label">
            <Flag size={20} />
            Priority
          </div>
          <Select<SelectOption, false>
            className="react-select-container"
            classNamePrefix="react-select"
            value={
              priorityOptions.find(
                (option) => option.value === filters.priority
              ) || priorityOptions[0]
            }
            options={priorityOptions}
            onChange={handlePriorityChange}
          />
        </div>

        <div className="start-date-filter">
          <div className="filter-label">
            <Calendar size={20} />
            From Date
          </div>
          <TextField
            type="date"
            value={filters.from_date}
            onChange={handleDateChange}
            label=""
            InputLabelProps={{ shrink: false }}
            fullWidth
            sx={inputStyles}
          />
        </div>
      </div>

      <div className="status-grid">
        {taskStatus.map((statusName: string) => (
          <StatusCard
            key={statusName}
            statusName={statusName as StatusType}
            tasks={tasks.find((t) => t.status === statusName)?.tasks || []}
          />
        ))}
      </div>
    </div>
  );
}

export default Projects;
