type KeyHandler = (event: KeyboardEvent) => void;

interface KeyboardShortcut {
  key: string | string[];
  handler: KeyHandler;
  context?: string;
  description?: string;
  preventDefault?: boolean;
  priority?: number;
}

class KeyboardManager {
  private shortcuts: KeyboardShortcut[] = [];
  private activeContext: string = 'default';
  private enabled: boolean = true;
  private pressedKeys: Set<string> = new Set();
  private debugMode: boolean = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.push({
      priority: 0,
      preventDefault: true,
      ...shortcut
    });
    
    // Sort shortcuts by priority (highest first)
    this.shortcuts.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  public registerShortcuts(shortcuts: KeyboardShortcut[]): void {
    shortcuts.forEach(shortcut => this.registerShortcut(shortcut));
  }

  public unregisterShortcut(key: string, context?: string): void {
    this.shortcuts = this.shortcuts.filter(s => {
      // If key is an array, compare each element
      if (Array.isArray(s.key)) {
        return !(s.key.includes(key) && (!context || s.context === context));
      }
      return !(s.key === key && (!context || s.context === context));
    });
  }

  public setContext(context: string): void {
    this.activeContext = context;
    if (this.debugMode) {
      console.log(`Keyboard context changed to: ${context}`);
    }
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public enableDebugMode(): void {
    this.debugMode = true;
  }

  public disableDebugMode(): void {
    this.debugMode = false;
  }

  public isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key.toLowerCase());
  }

  public getShortcutsForContext(context?: string): KeyboardShortcut[] {
    return this.shortcuts.filter(s => !s.context || s.context === (context || this.activeContext));
  }

  public getAllShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  public cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;
    
    const key = event.key.toLowerCase();
    this.pressedKeys.add(key);
    
    if (this.debugMode) {
      console.log(`Key pressed: ${key}, Active context: ${this.activeContext}`);
      console.log('Currently pressed keys:', Array.from(this.pressedKeys));
    }
    
    // Only process shortcuts for the current context and global shortcuts with no context
    const applicableShortcuts = this.shortcuts.filter(s => 
      !s.context || s.context === this.activeContext
    );
    
    for (const shortcut of applicableShortcuts) {
      if (this.matchesShortcut(shortcut)) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        
        shortcut.handler(event);
        
        if (this.debugMode) {
          console.log(`Triggered shortcut:`, shortcut);
        }
        
        break; // Only trigger the highest priority matching shortcut
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.pressedKeys.delete(key);
    
    if (this.debugMode) {
      console.log(`Key released: ${key}`);
    }
  }

  private matchesShortcut(shortcut: KeyboardShortcut): boolean {
    const targetKeys = Array.isArray(shortcut.key) ? shortcut.key : [shortcut.key];
    
    for (const keyCombo of targetKeys) {
      const keys = keyCombo.toLowerCase().split('+').map(k => k.trim());
      
      // Check if all required keys are pressed
      const allKeysPressed = keys.every(k => this.pressedKeys.has(k));
      
      // Check if only these keys are pressed (no extra keys)
      const noExtraKeys = keys.length === this.pressedKeys.size;
      
      if (allKeysPressed && noExtraKeys) {
        return true;
      }
    }
    
    return false;
  }
}

// Create and export a singleton instance
const keyboardManager = new KeyboardManager();
export default keyboardManager; 