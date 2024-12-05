import React from 'react';

const Sidebar = ({ isSidebarOpen, toggleSidebar, handleNewDiscussion, handleSearchHistory }) => (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
            <div className="logo">U</div>
            <nav>
                <button className="icon-button" onClick={handleNewDiscussion} aria-label="New Discussion">
                    <span className="icon">+</span>
                    <span className="text">Nouvelle Discussion</span>
                </button>
                <button className="icon-button" onClick={handleSearchHistory} aria-label="Search History">
                    <span className="icon">H</span>
                    <span className="text">Historique</span>
                </button>
            </nav>
            <button className="icon-button toggle-sidebar" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                <span className="icon">{isSidebarOpen ? '<' : '>'}</span>
            </button>
        </div>
    </aside>
);

export default Sidebar;
