import React, { useState } from 'react';
import { Bell, LogOut, Search } from 'lucide-react';
import DesktopNavbar from '../Components/DesktopNavbar';
import MobileTopBar from '../Components/MobileTopBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from "../context/Auth_Context"
import { useNavigate } from 'react-router';

export default function Header() {
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const { signInWithGitHub, signOut, user } = useAuth();
    const navigate = useNavigate()

    const navItems = [
        { id: 'home', icon: 'home' },
        { id: 'communities', icon: 'users' },
        { id: 'notifications', icon: 'bell' },
        { id: 'profile', icon: 'user' },
    ];



    const handleLogout = () => {
        console.log('Logout clicked');
        // Add your logout logic here
    };

    const handleCreatePost = () => {
        navigate("/create")
        // Add your create post logic here
    };

    const handleCreateCommunity = () => {
        console.log('Create Community clicked');
        // Add your create community logic here
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        console.log('Searching for:', query);
        // Add your search logic here
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Navigation - Hidden on mobile, visible on md+ */}
            <div className="hidden md:block">
                <DesktopNavbar
                    navItems={navItems}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    user={user}
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    onLogout={handleLogout}
                    onCreatePost={handleCreatePost}
                    onCreateCommunity={handleCreateCommunity}
                    signOut={signOut}
                    signInWithGitHub={signInWithGitHub}
                />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex flex-col h-screen">
                <MobileTopBar
                    user={user}
                    signOut={signOut}
                    signInWithGitHub={signInWithGitHub}
                    notificationCount={3}
                />
                {/* Main Content Area with padding for fixed mobile navbar */}
                <MobileBottomNav
                    navItems={navItems}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCreatePost={handleCreatePost}
                />
            </div>

        </div>
    );
}
