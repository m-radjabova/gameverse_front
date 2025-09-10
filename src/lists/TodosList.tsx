import { type ChangeEvent } from 'react';
import useTodos from '../hooks/useTodos';
import { 
  FiCheckSquare, FiSquare, FiFilter,FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import { Pagination, PaginationItem } from '@mui/material';
import { InputLabel, MenuItem, Select, FormControl } from "@mui/material";

function TodosList() {
  const { todos, page, setPage, pageSize, limit, setLimit } = useTodos();

  const handlePageChange = (event: ChangeEvent<unknown>, value : number) => {
    console.log(event)
    setPage(value)
  }

  return (
    <div className="container py-5">
      <div className="row mb-5 text-center">
        <div className="col">
          <h1 className="display-4 fw-bold text-gradient-todos">Todo List</h1>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12 justify-content-md-end d-flex mb-3 mb-md-0">
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <FormControl sx={{ 
                minWidth: 150, 
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#c8e6c9',
                  },
                  '&:hover fieldset': {
                    borderColor: '#81c784',
                  },
                }
              }} size="small">
                <InputLabel id="rows-per-page-label" sx={{ color: "#5a8f7b" }}>
                  Items per page
                </InputLabel>
                <Select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  labelId="rows-per-page-label"
                  label="Items per page"
                  className="select-items"
                  sx={{
                    color: "#2e7d32",
                    '& .MuiSvgIcon-root': {
                      color: "#5a8f7b"
                    }
                  }}
                >
                  {[7,10, 20, 30, 40].map(num => (
                    <MenuItem
                      key={num}
                      value={num}
                      sx={{ color: "#5a8f7b" }}
                    >
                      Show {num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
          </div>
        </div>
      </div>

      <div>
        {todos.length > 0 ? (
          todos.map((todo) => (
            <div 
              key={todo.id} 
              className={`card mb-3 shadow-sm todo-card ${todo.completed ? 'completed' : ''}`}
            >
              <div className="card-body">
                <div className="d-flex align-items-start">
                  <div className="me-3 mt-1">
                    {todo.completed ? (
                      <FiCheckSquare className="text-success" size={20} />
                    ) : (
                      <FiSquare className="text-muted" size={20} />
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <h6 
                      className={`card-title mb-1 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}
                    >
                      {todo.title}
                    </h6>
                    <p className="card-text small text-muted mb-0">
                      ID: {todo.id} • User ID: {todo.userId}
                    </p>
                  </div>
                  <div className="ms-3 mt-1">
                    {todo.completed ? (
                      <span className="badge bg-success">Completed</span>
                    ) : (
                      <span className="badge bg-warning">Pending</span>
                    )}
                  </div>
    
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <FiFilter size={48} className="text-muted mb-3" />
            <h5 className="text-muted">Not found any todo</h5>
          </div>
        )}
      </div>

      {todos.length > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination
            count={pageSize}
            page={page}
            onChange={handlePageChange}
            renderItem={(item) => (
              <PaginationItem
                components={{ previous: FiChevronLeft, next: FiChevronRight }}
                {...item}
              />
            )}
            color="primary"
          />
        </div>
      )}
    </div>
  );
}

export default TodosList;