import React, { useState, useEffect } from 'react';
import useNavigation from '../../hooks/useNavigation';
import keyboardManager from '../../utils/keyboardManager';
import './NavigationDebugger.css';

interface NavigationDebuggerProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showKeyboardState?: boolean;
}

const NavigationDebugger: React.FC<NavigationDebuggerProps> = ({
  enabled = false,
  position = 'bottom-right',
  showKeyboardState = true,
}) => {
  const [isVisible, setIsVisible] = useState(enabled);
  const [isMainExpanded, setIsMainExpanded] = useState(false);
  const [isFocusExpanded, setIsFocusExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isKeyboardExpanded, setIsKeyboardExpanded] = useState(false);
  const { currentFocus, history } = useNavigation();

  // Toggle visibility with F12
  useEffect(() => {
    const toggleDebugger = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', toggleDebugger);
    return () => window.removeEventListener('keydown', toggleDebugger);
  }, []);

  // Track pressed keys for debugging
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  useEffect(() => {
    const updatePressedKeys = () => {
      setPressedKeys(Array.from(
        new Set([...pressedKeys, ...Array.from(document.querySelectorAll(':focus')).map(el => el.id)])
      ));
    };

    const keyDownHandler = () => {
      updatePressedKeys();
    };

    window.addEventListener('keydown', keyDownHandler);
    const interval = setInterval(updatePressedKeys, 500);

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      clearInterval(interval);
    };
  }, [pressedKeys]);

  if (!isVisible) return null;

  // Find the current focused element
  const focusedElement = document.querySelector(`[data-focusable-id="${currentFocus}"]`);
  const focusedElementInfo = focusedElement ? {
    id: currentFocus,
    tag: focusedElement.tagName,
    class: focusedElement.className,
    rect: focusedElement.getBoundingClientRect(),
    group: focusedElement.getAttribute('data-group-id'),
  } : null;

  return (
    <div className={`navigation-debugger ${position}`}>
      <div className="debugger-header" onClick={() => setIsMainExpanded(prev => !prev)}>
        <h3>Navigation Debugger {isMainExpanded ? '[-]' : '[+]'}</h3>
      </div>

      {isMainExpanded && (
        <div className="debugger-content">
          <div className="debugger-section">
            <h4 onClick={() => setIsFocusExpanded(prev => !prev)}>
              Current Focus {isFocusExpanded ? '[-]' : '[+]'}
            </h4>
            {isFocusExpanded && (
              <div className="section-content">
                <div>Current Focus ID: {currentFocus || 'None'}</div>
                {focusedElementInfo && (
                  <>
                    <div>Element: {focusedElementInfo.tag}</div>
                    <div>Class: {focusedElementInfo.class}</div>
                    <div>Group: {focusedElementInfo.group || 'None'}</div>
                    <div>Position: {`${Math.round(focusedElementInfo.rect.left)},${Math.round(focusedElementInfo.rect.top)}`}</div>
                    <div>Size: {`${Math.round(focusedElementInfo.rect.width)}x${Math.round(focusedElementInfo.rect.height)}`}</div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="debugger-section">
            <h4 onClick={() => setIsHistoryExpanded(prev => !prev)}>
              Navigation History {isHistoryExpanded ? '[-]' : '[+]'}
            </h4>
            {isHistoryExpanded && (
              <div className="section-content">
                <ul>
                  {history.slice(0, 5).map((entry, i) => (
                    <li key={i}>{entry.route}: {entry.focusId}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {showKeyboardState && (
            <div className="debugger-section">
              <h4 onClick={() => setIsKeyboardExpanded(prev => !prev)}>
                Keyboard State {isKeyboardExpanded ? '[-]' : '[+]'}
              </h4>
              {isKeyboardExpanded && (
                <div className="section-content">
                  <div>Context: {keyboardManager.getShortcutsForContext().length > 0 ? keyboardManager.getShortcutsForContext()[0].context || 'default' : 'default'}</div>
                  <div>Registered shortcuts: {keyboardManager.getAllShortcuts().length}</div>
                  <div>
                    Pressed keys: 
                    <div className="key-container">
                      {['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Escape'].map(key => (
                        <span 
                          key={key} 
                          className={`key ${keyboardManager.isKeyPressed(key) ? 'pressed' : ''}`}
                        >
                          {key.replace('Arrow', '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="debugger-footer">
            <button onClick={() => setIsVisible(false)}>Close</button>
            <button onClick={() => keyboardManager.enableDebugMode()}>Debug Mode</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationDebugger; 