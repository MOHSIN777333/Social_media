import { useLocation, useNavigate, useSearchParams } from 'react-router';
import DesktopNavbar from '../Components/DesktopNavbar';
import MobileTopBar from '../Components/MobileTopBar';
import MobileBottomNav from '../Components/MobileBottomNav';
import { useAuth } from "../context/Auth_Context";
import { useToast } from "../context/Toast_Context";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { info } = useToast();
    const { signOut, user, openAuthModal } = useAuth();
    
    const searchQuery = searchParams.get('search') || '';

    const activeTab = location.pathname.startsWith('/communities')
        ? 'communities'
        : location.pathname.startsWith('/profile')
        ? 'profile'
        : location.pathname.startsWith('/create')
        ? 'create'
        : 'home';

    const navItems = [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'communities', label: 'Communities', icon: 'users' },
        { id: 'notifications', label: 'Notifications', icon: 'bell' },
        { id: 'profile', label: 'Profile', icon: 'user' },
    ];

    const handleTabChange = (tabId) => {
        if (tabId === 'home') navigate('/');
        else if (tabId === 'communities') navigate('/communities');
        else if (tabId === 'profile') navigate('/profile');
        else if (tabId === 'notifications') info('No new notifications');
    };

    const handleCreatePost = () => {
        navigate('/create');
    };

    const handleSearch = (query) => {
        const trimmed = query.trim();
        if (trimmed) {
            navigate(`/?search=${encodeURIComponent(trimmed)}`);
        } else {
            navigate('/');
        }
    };

    return (
        <>
            {/* Desktop Navigation */}
            <div className="hidden md:block">
                <DesktopNavbar
                    user={user}
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    signOut={signOut}
                    signInWithGitHub={openAuthModal}
                    openAuthModal={openAuthModal}
                />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <MobileTopBar
                    user={user}
                    signOut={signOut}
                    signInWithGitHub={openAuthModal}
                    openAuthModal={openAuthModal}
                    notificationCount={0}
                    onSearch={handleSearch}
                    searchQuery={searchQuery}
                />
                <MobileBottomNav
                    navItems={navItems}
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    onCreatePost={handleCreatePost}
                />
            </div>
        </>
    );
}
