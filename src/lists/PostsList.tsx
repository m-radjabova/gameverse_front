import { type ChangeEvent } from "react";
import usePosts from "../hooks/usePosts";
import { FiHeart, FiMessageSquare, FiBookmark, FiShare2, FiChevronLeft, FiChevronRight} from 'react-icons/fi';
import { BiLike } from 'react-icons/bi';
import { Pagination, PaginationItem } from '@mui/material';
import { InputLabel, MenuItem, Select, FormControl } from "@mui/material";

function PostsList() {
  const { posts, page, setPage, pageSize, limit, setLimit } = usePosts();

  const getRandomColor = () => {
    const colors = [
      'linear-gradient(45deg, #ff9a9e, #fad0c4)',
      'linear-gradient(45deg, #a1c4fd, #c2e9fb)',
      'linear-gradient(45deg, #ffecd2, #fcb69f)',
      'linear-gradient(45deg, #84fab0, #8fd3f4)',
      'linear-gradient(45deg, #d4fc79, #96e6a1)',
      'linear-gradient(45deg, #a6c0fe, #f68084)',
      'linear-gradient(45deg, #fbc2eb, #a6c1ee)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handlePageChange = (event: ChangeEvent<unknown>, value : number) => {
      console.log(event)
      setPage(value)
  }


  return (
    <div className="container py-5">
      <div className="row mb-5 text-center">
        <div className="col">
          <h1 className="display-4 fw-bold text-gradient-post">Posts List</h1>
        </div>
      </div>
      <div className="row mb-4">
              <div className="col-md-12 justify-content-md-end d-flex mb-3 mb-md-0">
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  <FormControl sx={{ 
                      minWidth: 150, 
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#c8cbe6ff',
                        },
                        '&:hover fieldset': {
                          borderColor: '#81a4d6ff',
                        },
                      }
                    }} size="small">
                      <InputLabel id="rows-per-page-label" sx={{ color: "#2e4a7dff" }}>
                        Items per page
                      </InputLabel>
                      <Select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                        labelId="rows-per-page-label"
                        label="Items per page"
                        className="select-items"
                        sx={{
                          color: "#1a3a5dff",
                          '& .MuiSvgIcon-root': {
                            color: "#2e4a7dff"
                          }
                        }}
                      >
                        {[7,10, 20, 30, 40].map(num => (
                          <MenuItem
                            key={num}
                            value={num}
                            sx={{ color: "#1a3a5dff" }}
                          >
                            Show {num}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                </div>
              </div>
      </div>

      <div className="row">
        {posts.map(post => (
          <div key={post.id} className="col-lg-6 col-xl-4 mb-4">
            <div className="card h-100 shadow-sm post-card">
              <div 
                className="card-header-image" 
                style={{ background: getRandomColor() }}
              >
                <div className="category-badge">post</div>
              </div>
              <div className="card-body">
                <h5 className="card-title fw-bold">{post.title}</h5>
                <p className="card-text text-muted">{post.body.substring(0, 100)}...</p>
                <p className="card-text text-muted"> User ID: {post.userId}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center">
                      <FiHeart className="me-1" /> 24
                    </button>
                    <button className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center">
                      <FiMessageSquare className="me-1" /> 7
                    </button>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-light rounded-circle">
                      <FiBookmark />
                    </button>
                    <button className="btn btn-sm btn-light rounded-circle">
                      <FiShare2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
         {posts.length > 1 && (
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
      {posts.length === 0 && (
        <div className="row text-center mt-5">
          <div className="col">
            <div className="empty-state">
              <BiLike className="empty-icon" />
              <h5 className="mt-3">Not found.</h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostsList;