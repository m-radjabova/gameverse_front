import { Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button sx={{ mr: 2 , backgroundColor: 'red', color: 'white' }} onClick={() => navigate('/posts')}>Posts</Button>
      <Button sx={{ mr: 2 , backgroundColor: 'blue', color: 'white' }} onClick={() => navigate('/users')}>Users</Button>
      <Button sx={{ mr: 2 , backgroundColor: 'green', color: 'white'}}  onClick={() => navigate('/todos')}>Todos</Button>

    </Container>
  );
}

export default Home;