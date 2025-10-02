import { useState } from 'react';
import { FaSearch, FaUtensils, FaUser, FaCalendar, FaArrowRight, FaHeart, FaComment, FaClock,FaTag
} from 'react-icons/fa';
import useLoading from '../../hooks/useLoading';
import IsLoading from '../IsLoading';

const BlogPage = () => {
    const { loading} = useLoading();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

  if( loading) return <IsLoading />;

  const categories = [
    { id: 'all', name: 'All', count: 12 },
    { id: 'recipes', name: 'Recipes', count: 5 },
    { id: 'nutrition', name: 'Nutrition', count: 4 },
    { id: 'tips', name: 'Tips', count: 3 }
  ];

  const blogPosts = [
    {
      id: 1,
      title: '10 Healthy Breakfast Ideas',
      excerpt: 'Start your day with these nutritious and delicious breakfast options that will keep you energized.',
      category: 'Recipes',
      author: 'Jane Smith',
      date: 'May 15, 2023',
      likes: 24,
      comments: 8,
      readTime: '5 min'
    },
    {
      id: 2,
      title: 'The Importance of Protein in Breakfast',
      excerpt: 'Learn why protein is crucial for your morning meal and how to incorporate it effectively.',
      category: 'Nutrition',
      author: 'John Doe',
      date: 'May 10, 2023',
      likes: 32,
      comments: 12,
      readTime: '7 min'
    },
    {
      id: 3,
      title: 'Quick Breakfasts for Busy Mornings',
      excerpt: 'Time-saving breakfast ideas for those hectic mornings when every minute counts.',
      category: 'Tips',
      author: 'Sarah Johnson',
      date: 'May 5, 2023',
      likes: 18,
      comments: 5,
      readTime: '4 min'
    },
    {
      id: 4,
      title: 'Traditional Breakfasts Around the World',
      excerpt: 'Explore how different cultures start their day with unique and flavorful breakfast dishes.',
      category: 'Recipes',
      author: 'Michael Brown',
      date: 'April 28, 2023',
      likes: 41,
      comments: 15,
      readTime: '9 min'
    },
    {
      id: 5,
      title: 'Healthy Breakfast Smoothies',
      excerpt: 'Delicious and nutritious smoothies made with fruits and vegetables for a healthy start to your day.',
      category: 'Recipes',
      author: 'Emily Davis',
      date: 'April 22, 2023',
      likes: 27,
      comments: 10,
      readTime: '6 min'
    }
  ];

  const recentPosts = [
    { id: 1, title: '10 Healthy Breakfast Ideas', date: 'May 15, 2023' },
    { id: 2, title: 'The Importance of Protein in Breakfast', date: 'May 10, 2023' },
    { id: 3, title: 'Quick Breakfasts for Busy Mornings', date: 'May 5, 2023' },
    { id: 4, title: 'Traditional Breakfasts Around the World', date: 'April 28, 2023' }
  ];

  const allTags = ['Breakfast', 'Healthy', 'Recipes', 'Nutrition', 'Tips', 'Quick', 'Protein', 'World Cuisine'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || post.category.toLowerCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="blog-page" data-aos="fade-up">
      <section className="blog-hero">
        <div className="container">
          <div className="blog-hero-content">
            <div className="blog-hero-text">
              <h1 className="blog-hero-title">
                Perfect Breakfast Blog
              </h1>
              <p className="blog-hero-subtitle">
                Breakfast ideas, healthy eating tips and news
              </p>
              <div className="blog-search-box">
                <FaSearch className="blog-search-icon" />
                <input
                  type="text"
                  className="blog-search-input"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="blog-hero-image">
              <div className="icon-circle">
                <FaUtensils className="blog-hero-icon" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="blog-content">
        <div className="container">
          <div className="content-wrapper">
            {/* Blog Posts */}
            <div className="posts-column">
              {/* Category Filters */}
              <div className="category-filters">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                    <span className="category-count">{category.count}</span>
                  </button>
                ))}
              </div>

              <div className="posts-grid">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="post-card">
                    <div className="post-image">
                        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWtmbGF8ZW58MHx8MHx8fDA%3D&w=1000&q=80" alt="" />
                      <FaUtensils className="post-icon" />
                    </div>
                    <div className="post-body">
                      <div className="post-category">
                        <span className="category-badge">{post.category}</span>
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-excerpt">{post.excerpt}</p>
                      <div className="post-meta">
                        <div className="meta-info">
                          <span className="meta-item">
                            <FaUser className="meta-icon" />
                            {post.author}
                          </span>
                          <span className="meta-item">
                            <FaCalendar className="meta-icon" />
                            {post.date}
                          </span>
                        </div>
                        <FaArrowRight className="arrow-icon" />
                      </div>
                      <div className="post-footer">
                        <div className="post-stats">
                          <span className="stat-item">
                            <FaHeart className="stat-icon" />
                            {post.likes}
                          </span>
                          <span className="stat-item">
                            <FaComment className="stat-icon" />
                            {post.comments}
                          </span>
                        </div>
                        <span className="read-time">
                          <FaClock className="time-icon" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar">
              <div className="sidebar-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Posts</h3>
                </div>
                <div className="card-body">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="recent-post">
                      <div className="recent-post-icon">
                        <FaUtensils className="post-small-icon" />
                      </div>
                      <div className="recent-post-content">
                        <h4 className="recent-post-title">{post.title}</h4>
                        <div className="recent-post-meta">
                          <FaCalendar className="meta-small-icon" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sidebar-card">
                <div className="card-header">
                  <h3 className="card-title">Categories</h3>
                </div>
                <div className="card-body">
                  {categories.map((category) => (
                    <div key={category.id} className="blog-category-item">
                      <span className="blog-category-name">{category.name}</span>
                      <span className="blog-category-badge-small">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="sidebar-card">
                <div className="card-header">
                  <h3 className="card-title">Tags</h3>
                </div>
                <div className="card-body">
                  <div className="tags-container">
                    {allTags.map((tag) => (
                      <span key={tag} className="tag">
                        <FaTag className="tag-icon" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;