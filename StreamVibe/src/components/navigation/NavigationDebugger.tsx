import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigation } from '../../hooks/useNavigation';
import keyboardManager from '../../utils/keyboardManager';
import './NavigationDebugger.css';

// Styled Components
const DebuggerContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  border: 1px solid #00ff00;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
`;

const DebuggerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: rgba(0, 100, 0, 0.8);
  border-bottom: 1px solid #00ff00;
`;

const Title = styled.div`
  font-weight: bold;
`;

const DebuggerContent = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
`;

const DebuggerFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background-color: rgba(0, 50, 0, 0.8);
  border-top: 1px solid #00ff00;
`;

const Button = styled.button`
  background-color: #006400;
  color: #00ff00;
  border: 1px solid #00ff00;
  border-radius: 3px;
  padding: 4px 8px;
  font-family: monospace;
  cursor: pointer;
  
  &:hover {
    background-color: #008800;
  }
`;

const ButtonSmall = styled(Button)`
  padding: 2px 4px;
  margin-left: 5px;
`;

const InfoSection = styled.div`
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(0, 255, 0, 0.3);
`;

const Label = styled.div`
  color: #88ff88;
  font-weight: bold;
  margin-bottom: 4px;
`;

const Value = styled.div`
  word-break: break-all;
`;

const FocusablesList = styled.div`
  margin-top: 8px;
`;

const FocusableItem = styled.div<{ isActive: boolean }>`
  padding: 4px;
  margin-bottom: 2px;
  background-color: ${props => props.isActive ? 'rgba(0, 100, 0, 0.5)' : 'transparent'};
  border: 1px solid ${props => props.isActive ? '#00ff00' : 'rgba(0, 255, 0, 0.3)'};
  border-radius: 2px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 100, 0, 0.3);
  }
`;

const LogList = styled.div`
  margin-top: 8px;
  max-height: 150px;
  overflow-y: auto;
`;

const LogItem = styled.div`
  padding: 4px;
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
  font-size: 11px;
`;

interface LogEntry {
  message: string;
  timestamp: number;
}

const NavigationDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [focusablesSnapshot, setFocusablesSnapshot] = useState<string[]>([]);
  const navigation = useNavigation();
  
  // Add keyboard shortcut for toggling the debugger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'D' && e.shiftKey) {
        console.log('Toggle debugger visibility');
        setIsVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Collect data about focusable elements
  useEffect(() => {
    const updateFocusables = () => {
      const elements = document.querySelectorAll('[data-focusable-id]');
      const focusableIds = Array.from(elements).map(el => el.getAttribute('data-focusable-id') || '');
      setFocusablesSnapshot(focusableIds);
    };
    
    // Update initially and whenever focus changes
    updateFocusables();
    
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(updateFocusables);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['data-focusable-id', 'data-focused']
    });
    
    return () => observer.disconnect();
  }, [navigation.currentFocus]);
  
  // Log navigation events
  useEffect(() => {
    const addLog = (message: string) => {
      setLogs(prev => {
        const newLogs = [
          { message, timestamp: Date.now() },
          ...prev
        ].slice(0, 50); // Keep only the last 50 logs
        return newLogs;
      });
    };
    
    // Log focus changes
    if (navigation.currentFocus) {
      addLog(`Focus changed to: ${navigation.currentFocus}`);
    }
    
    // Override console.log to capture navigation logs
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog(...args);
      
      // Only capture navigation-related logs
      const message = args.join(' ');
      if (
        message.includes('focus') || 
        message.includes('Focus') || 
        message.includes('navigation') || 
        message.includes('key pressed') ||
        message.includes('Arrow')
      ) {
        addLog(message);
      }
    };
    
    return () => {
      console.log = originalConsoleLog;
    };
  }, [navigation.currentFocus]);
  
  const handleClearLogs = () => {
    setLogs([]);
  };
  
  const handleFocusElement = (id: string) => {
    navigation.setFocus(id);
  };
  
  const handleRefreshFocusables = () => {
    const elements = document.querySelectorAll('[data-focusable-id]');
    const focusableIds = Array.from(elements).map(el => el.getAttribute('data-focusable-id') || '');
    setFocusablesSnapshot(focusableIds);
  };
  
  if (!isVisible) {
    return (
      <Button 
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}
        onClick={() => setIsVisible(true)}
      >
        Show Debug
      </Button>
    );
  }
  
  return (
    <DebuggerContainer>
      <DebuggerHeader>
        <Title>Navigation Debugger</Title>
        <ButtonSmall onClick={() => setIsVisible(false)}>Hide</ButtonSmall>
      </DebuggerHeader>
      
      <DebuggerContent>
        <InfoSection>
          <Label>Current Focus:</Label>
          <Value>{navigation.currentFocus || 'None'}</Value>
        </InfoSection>
        
        <InfoSection>
          <Label>Focus History:</Label>
          <Value>
            {navigation.history.length > 0 
              ? navigation.history.map((item, i) => (
                  <div key={i}>
                    {item.route}: {item.focusId}
                  </div>
                )).slice(0, 3) 
              : 'No history yet'}
            {navigation.history.length > 3 && '...'}
          </Value>
        </InfoSection>
        
        <InfoSection>
          <Label>
            Focusable Elements: 
            <ButtonSmall onClick={handleRefreshFocusables}>Refresh</ButtonSmall>
          </Label>
          <FocusablesList>
            {focusablesSnapshot.map(id => (
              <FocusableItem 
                key={id}
                isActive={navigation.currentFocus === id}
                onClick={() => handleFocusElement(id)}
              >
                {id}
              </FocusableItem>
            ))}
          </FocusablesList>
        </InfoSection>
        
        <InfoSection>
          <Label>Navigation Logs:</Label>
          <LogList>
            {logs.map((log, i) => (
              <LogItem key={i}>
                [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
              </LogItem>
            ))}
          </LogList>
        </InfoSection>
      </DebuggerContent>
      
      <DebuggerFooter>
        <Button onClick={handleClearLogs}>Clear Logs</Button>
        <div>Press Shift+D to toggle</div>
      </DebuggerFooter>
    </DebuggerContainer>
  );
};

export default NavigationDebugger; 