import React, { useState, type ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { NavigationProvider } from '../../context/NavigationContext';
import NavigationDebugger from '../navigation/NavigationDebugger';
import { useNavigation } from '../../hooks/useNavigation';

interface AppLayoutProps {
  children: ReactNode;
  initialFocus?: string;
}

const LayoutContainer = styled.div`
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 24px;
  overflow: hidden;
`;

// Direct navigation event handler component
const KeyboardNavigationHandler: React.FC = () => {
  const navigation = useNavigation();
  
  useEffect(() => {
    const handleDirectKeyNav = (e: KeyboardEvent) => {
      console.log('Direct keyboard handler captured:', e.key);
      
      // Don't interfere with input fields
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }
      
      let handled = false;
      
      switch (e.key) {
        case 'ArrowUp':
          navigation.moveFocus('up');
          handled = true;
          break;
        case 'ArrowDown':
          navigation.moveFocus('down');
          handled = true;
          break;
        case 'ArrowLeft':
          navigation.moveFocus('left');
          handled = true;
          break;
        case 'ArrowRight':
          navigation.moveFocus('right');
          handled = true;
          break;
        case 'Enter':
          // Let the NavigationContext handle Enter
          break;
      }
      
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    // Add with capture:true to ensure we get events first
    window.addEventListener('keydown', handleDirectKeyNav, { capture: true });
    console.log('Direct keyboard navigation handler registered');
    
    return () => {
      window.removeEventListener('keydown', handleDirectKeyNav, { capture: true });
      console.log('Direct keyboard navigation handler removed');
    };
  }, [navigation]);
  
  return null;
};

// Add focus initializer component
const FocusInitializer: React.FC = () => {
  const navigation = useNavigation();
  
  useEffect(() => {
    // Give the DOM time to fully render
    const initializeTimeout = setTimeout(() => {
      // If there's no focus, try to focus the first visible element
      if (!navigation.currentFocus) {
        console.log('No current focus, initializing focus');
        
        // Find all element IDs
        const elements = document.querySelectorAll('[data-focusable-id]');
        const focusableIds = Array.from(elements).map(el => el.getAttribute('data-focusable-id') || '');
        
        if (focusableIds.length > 0) {
          console.log(`Setting initial focus to first element: ${focusableIds[0]}`);
          navigation.setFocus(focusableIds[0]);
        }
      }
    }, 500); // Wait 500ms for DOM to settle
    
    return () => clearTimeout(initializeTimeout);
  }, [navigation]);
  
  return null;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children, initialFocus }) => {
  const [showDebugger] = useState(true);
  
  return (
    <NavigationProvider initialFocus={initialFocus}>
      <LayoutContainer>
        <ContentArea>
          {children}
        </ContentArea>
        <KeyboardNavigationHandler />
        <FocusInitializer />
        {showDebugger && <NavigationDebugger />}
      </LayoutContainer>
    </NavigationProvider>
  );
};

export default AppLayout; 