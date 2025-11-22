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
import { Calendar, Flag, ListTask, People, Search } from "react-bootstrap-icons";
import { DragDropContainer } from "./DragDropContainer";
import { SortableContext } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDebounce } from "../../hooks/useDebounce";

function Projects() {
  const [filters, setFilters] = useState<FilterState>({
    assignees: [],
    priority: "ALL",
    from_date: "",
    title: "",
  });
  const { users } = useUsers();
  const debouncedSearch = useDebounce(filters.title, 400);

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

    if (debouncedSearch) {
      params.title = debouncedSearch;
    }

    return params;
  }, [filters, debouncedSearch]);

  const { taskStatus, tasks, updateTaskStatus } = useTasks(filterParams);

  const handleTaskMove = (activeId: string, overId: string) => {
    const taskId = parseInt(activeId);
    const newStatus = overId as StatusType;

    if (taskStatus.includes(newStatus)) {
      updateTaskStatus({ id: taskId, status: newStatus });
    }
  };

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
      title: "",
    });
  };

  const hasActiveFilters =
    filters.assignees.length > 0 ||
    filters.priority !== "ALL" ||
    filters.from_date !== "";

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      title: event.target.value,
    }));
  };

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1 className="projects-title"> <ListTask className="project-icon" /> Projects</h1>
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
        <div className="d-flex gap-3 mb-3 flex-wrap">
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
              End Date
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
        <div className="search-title">
          <div className="filter-label">
            <Search size={20} />
            Search by Title
          </div>
          <TextField
            
            type="text"
            value={filters.title}
            onChange={handleTitleChange}
            label="Search tasks by title..."
            fullWidth
            sx={inputStyles}
          />
        </div>
      </div>

      <DragDropContainer onDragEnd={handleTaskMove}>
        <div className="status-grid">
          {taskStatus.map((statusName: string) => {
            const statusTasks =
              tasks.find((t) => t.status === statusName)?.tasks || [];
            const taskIds = statusTasks.map((task) => task.id.toString());

            return (
              <SortableContext
                key={statusName}
                items={[...taskIds, statusName]}
                strategy={verticalListSortingStrategy}
              >
                <StatusCard
                  statusName={statusName as StatusType}
                  tasks={statusTasks}
                />
              </SortableContext>
            );
          })}
        </div>
      </DragDropContainer>
    </div>
  );
}

export default Projects;
