import { useState } from "react"
import { Nav } from "react-bootstrap"
import { Link } from "react-router-dom"
import { House, People, FileText, Gear, BoxArrowRight, List } from "react-bootstrap-icons"
import useContextPro from "../../hooks/useContextPro"
import { FaHeart } from "react-icons/fa"

function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(true)

    const {
        state: { user },
    } = useContextPro()

    const menuItems = [
        { name: "Dashboard", icon: <House />, path: "/admin", role: "ADMIN" },
        { name: "Products", icon: <FileText />, path: "/admin/products", role: "ADMIN" },
        { name: "Categories", icon: <Gear />, path: "/admin/categories", role: "ADMIN" },
        { name: "Carousel/Slider", icon: <FaHeart />, path: "/admin/carousel", role: "ADMIN" },
        { name: "Users", icon: <People />, path: "/admin/users", role: "ADMIN" },
    ]

    const canAccess = (itemRole: string) => {
        if (!user?.roles) return false

        if (user.roles.includes("SUPER_ADMIN")) return true

        return user.roles.includes(itemRole)
    }

    return (
        <div
            className={`admin-sidebar vh-100 d-flex flex-column transition-all`}
            style={{ width: isOpen ? "220px" : "70px" }}
        >
            {/* Header */}
            <div className="sidebar-header d-flex justify-content-between align-items-center p-3">
                {isOpen && <h4 className="m-0">Admin Panel</h4>}
                <button
                    className="toggle-btn btn btn-sm"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <List />
                </button>
            </div>

            {/* Menu */}
            <Nav className="flex-column mt-3 sidebar-nav">
                {menuItems
                    .filter((item) => canAccess(item.role))
                    .map((item, i) => (
                        <Nav.Item key={i}>
                            <Nav.Link
                                as={Link}
                                to={item.path}
                                className="nav-link-item d-flex align-items-center gap-2 px-3 py-2"
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {isOpen && <span className="nav-text">{item.name}</span>}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
            </Nav>

            {/* Footer */}
            <div className="sidebar-footer mt-auto">
                <button className="logout-btn w-100 d-flex align-items-center gap-2 px-3 py-2">
                    <BoxArrowRight />
                    {isOpen && <span>Logout</span>}
                </button>
            </div>
        </div>
    )
}

export default AdminSidebar