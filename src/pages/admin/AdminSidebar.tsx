
import { Nav } from "react-bootstrap"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { House, ListTask, PeopleFill, PersonCheckFill } from "react-bootstrap-icons"

function AdminSidebar() {
    const navigate = useNavigate()
    const location = useLocation() 

    const menuItems = [
        { name: "Projects", icon: <House />, path: "/projects"},
        { name: "Users", icon: <PersonCheckFill />, path: "/users" },
        {name: "Teams", icon: <PeopleFill />, path: "/teams" }
    ]


    const isActiveLink = (path: string) => {
        if (path === "/admin" && location.pathname === "/admin") {
            return true
        }
        if (path !== "/admin" && location.pathname.startsWith(path)) {
            return true
        }
        return false
    }

    return (
        <div
            className={`admin-sidebar vh-100 d-flex flex-column`}
            style={{ width: "250px" }}
        >
            <div className="sidebar-header p-4 border-bottom">
                <h4 onClick={() => navigate("/")} className="m-0 d-flex align-items-center gap-2" >
                    <ListTask className="nav-icon" />
                        Projects
                    </h4>
            </div>

            <Nav className="flex-column mt-3 sidebar-nav">
                {menuItems.map((item, i) => (
                        <Nav.Item key={i}>
                            <Nav.Link
                                as={Link}
                                to={item.path}
                                className={`nav-link-item d-flex align-items-center gap-2 px-4 py-3 ${
                                    isActiveLink(item.path) ? 'active' : ''
                                }`}
                                data-tooltip={item.name}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.name}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
            </Nav>
        </div>
    )
}

export default AdminSidebar