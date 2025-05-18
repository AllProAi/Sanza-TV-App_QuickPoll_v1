import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import FocusableItem from '../ui/FocusableItem';

// Animation keyframes
const slideIn = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Menu Container
const MenuContainer = styled.nav`
  width: 100%;
  padding: 24px 48px;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
`;

// Header Container
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

// Logo
const Logo = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
`;

// Menu List
const MenuList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 48px;
`;

// Menu Item
interface MenuItemProps {
  active?: boolean;
  focused?: boolean;
}

const MenuItem = styled.li<MenuItemProps>`
  position: relative;
  font-size: 18px;
  font-weight: ${props => (props.active ? '700' : '500')};
  color: ${props => (props.active ? 'var(--primary-color)' : 'var(--text-color-primary)')};
  padding: 8px 0;
  transition: color 0.2s ease, transform 0.2s ease;
  animation: ${slideIn} 0.3s ease forwards;
  animation-delay: ${props => props.active ? '0s' : '0.1s'};
  
  &:hover {
    color: var(--primary-color);
  }
  
  ${props => props.focused && css`
    transform: scale(1.05);
    color: var(--primary-color);
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--primary-color);
      animation: ${fadeIn} 0.2s ease forwards;
    }
  `}
`;

// Sub Menu
const SubMenuContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: rgba(20, 20, 30, 0.95);
  border-radius: 8px;
  padding: ${props => (props.isOpen ? '12px' : '0')};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transform: ${props => (props.isOpen ? 'translateY(8px)' : 'translateY(-10px)')};
  pointer-events: ${props => (props.isOpen ? 'auto' : 'none')};
  transition: opacity 0.3s ease, transform 0.3s ease, padding 0.3s ease;
  min-width: 200px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 101;
`;

const SubMenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SubMenuItem = styled.li<{ focused?: boolean }>`
  padding: 12px 16px;
  font-size: 16px;
  color: var(--text-color-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
  border-radius: 4px;
  
  &:not(:last-child) {
    margin-bottom: 4px;
  }
  
  ${props => props.focused && css`
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--primary-color);
  `}
`;

// User Menu
const UserMenuContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #000;
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: var(--text-color-primary);
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
  }
`;

interface MainMenuProps {
  onSearch?: () => void;
}

interface MenuItemData {
  id: string;
  label: string;
  path: string;
  subMenu?: Array<{
    id: string;
    label: string;
    path: string;
  }>;
}

// Custom focusable menu item component
interface FocusableMenuItemProps {
  item: MenuItemData;
  isActive: boolean;
  index: number;
  onMenuItemClick: (path: string) => void;
  activeSubMenu: string | null;
  onSubMenuToggle: (id: string) => void;
}

const FocusableMenuItem: React.FC<FocusableMenuItemProps> = ({
  item,
  isActive,
  index,
  onMenuItemClick,
  activeSubMenu,
  onSubMenuToggle
}) => {
  const hasSubMenu = item.subMenu && item.subMenu.length > 0;
  const isSubMenuOpen = activeSubMenu === item.id;
  
  const handleClick = () => {
    if (hasSubMenu) {
      onSubMenuToggle(item.id);
    } else {
      onMenuItemClick(item.path);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };
  
  return (
    <FocusableItem
      id={`menu-${item.id}`}
      groupId="main-menu"
      onFocus={() => {
        if (hasSubMenu && activeSubMenu !== item.id) {
          onSubMenuToggle(item.id);
        }
      }}
    >
      <MenuItem 
        active={isActive} 
        focused={false}
        style={{animationDelay: `${0.1 * index}s`}}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-href={!hasSubMenu ? item.path : undefined}
      >
        {item.label}
        
        {hasSubMenu && (
          <SubMenuContainer isOpen={isSubMenuOpen}>
            <SubMenuList>
              {item.subMenu!.map((subItem) => (
                <FocusableSubmenuItem
                  key={subItem.id}
                  subItem={subItem}
                  parentId={item.id}
                  onMenuItemClick={onMenuItemClick}
                />
              ))}
            </SubMenuList>
          </SubMenuContainer>
        )}
      </MenuItem>
    </FocusableItem>
  );
};

// Custom focusable submenu item component
interface FocusableSubmenuItemProps {
  subItem: {
    id: string;
    label: string;
    path: string;
  };
  parentId: string;
  onMenuItemClick: (path: string) => void;
}

const FocusableSubmenuItem: React.FC<FocusableSubmenuItemProps> = ({
  subItem,
  parentId,
  onMenuItemClick
}) => {
  const handleClick = () => {
    onMenuItemClick(subItem.path);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };
  
  return (
    <FocusableItem
      id={`submenu-${subItem.id}`}
      groupId={`submenu-${parentId}`}
    >
      <SubMenuItem 
        focused={false}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-href={subItem.path}
      >
        {subItem.label}
      </SubMenuItem>
    </FocusableItem>
  );
};

const mainMenuItems: MenuItemData[] = [
  { id: 'home', label: 'Home', path: '/' },
  { 
    id: 'movies', 
    label: 'Movies', 
    path: '/movies',
    subMenu: [
      { id: 'action', label: 'Action', path: '/movies/action' },
      { id: 'comedy', label: 'Comedy', path: '/movies/comedy' },
      { id: 'drama', label: 'Drama', path: '/movies/drama' },
      { id: 'sci-fi', label: 'Sci-Fi', path: '/movies/sci-fi' },
    ]
  },
  { 
    id: 'tv-shows', 
    label: 'TV Shows', 
    path: '/tv-shows',
    subMenu: [
      { id: 'drama-shows', label: 'Drama', path: '/tv-shows/drama' },
      { id: 'comedy-shows', label: 'Comedy', path: '/tv-shows/comedy' },
      { id: 'documentary', label: 'Documentary', path: '/tv-shows/documentary' },
    ]
  },
  { id: 'new', label: 'New & Popular', path: '/new' },
  { id: 'my-list', label: 'My List', path: '/my-list' },
];

const MainMenu: React.FC<MainMenuProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  
  // Get current active menu item
  const getActiveMenuItem = () => {
    const pathname = location.pathname;
    return mainMenuItems.find(item => pathname === item.path || pathname.startsWith(`${item.path}/`));
  };
  
  // Handle menu item click
  const handleMenuItemClick = (path: string) => {
    // Use both methods to ensure navigation works
    navigate(path);
    
    // Add a small delay to ensure the navigation completes
    setTimeout(() => {
      window.location.href = path;
    }, 50);
  };
  
  // Handle sub menu visibility
  const handleSubMenuToggle = (id: string) => {
    if (activeSubMenu === id) {
      setActiveSubMenu(null);
    } else {
      setActiveSubMenu(id);
    }
  };
  
  // Render menu items
  const renderMenuItems = () => {
    return mainMenuItems.map((item, index) => {
      const isActive = getActiveMenuItem()?.id === item.id;
      
      return (
        <FocusableMenuItem
          key={item.id}
          item={item}
          isActive={isActive}
          index={index}
          onMenuItemClick={handleMenuItemClick}
          activeSubMenu={activeSubMenu}
          onSubMenuToggle={handleSubMenuToggle}
        />
      );
    });
  };
  
  const handleSearchClick = () => {
    if (onSearch) onSearch();
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  return (
    <MenuContainer>
      <HeaderContainer>
        <Logo>StreamVibe</Logo>
        
        <UserMenuContainer>
          <FocusableItem
            id="search-button"
            groupId="user-menu"
          >
            <SearchButton 
              style={{ color: undefined }}
              onClick={handleSearchClick}
            >
              Search
            </SearchButton>
          </FocusableItem>
          
          <FocusableItem
            id="user-profile"
            groupId="user-menu"
          >
            <UserAvatar 
              style={{ 
                transform: undefined,
                boxShadow: undefined 
              }}
              onClick={handleProfileClick}
            >
              U
            </UserAvatar>
          </FocusableItem>
        </UserMenuContainer>
      </HeaderContainer>
      
      <MenuList>
        {renderMenuItems()}
      </MenuList>
    </MenuContainer>
  );
};

export default MainMenu; 