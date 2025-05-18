# Remote Control Implementation for Senza Platform

## Overview

This document explains how remote control functionality is implemented in the StreamVibe TV App for the Sanza platform. The implementation follows the guidelines from the [Senza Developer Documentation](https://developer.synamedia.com/senza/docs/remote-control).

## Remote Control Button Mapping

Remote control buttons are mapped to keyboard events in the browser as follows:

| Remote Button | JavaScript Key | ASCII Code |
| ------------- | -------------- | ---------- |
| OK            | Enter          | 13         |
| Back          | Escape         | 27         |
| Home          | Home           | 36         |
| Left          | ArrowLeft      | 37         |
| Up            | ArrowUp        | 38         |
| Right         | ArrowRight     | 39         |
| Down          | ArrowDown      | 40         |

## Implementation Details

The remote control implementation is based on these key components:

1. **NavigationContext (src/context/NavigationContext.tsx)**
   - Manages focus state across the application
   - Handles keyboard events for navigation
   - Maintains navigation history for back button functionality

2. **FocusableButton (src/components/ui/FocusableButton.tsx)**
   - Button component optimized for remote control interaction
   - Displays clear focus state
   - Handles Enter key presses to trigger actions

3. **Focus Indicator**
   - Visual indicators for currently focused elements
   - Animation for focus transitions
   - Scale transformations to emphasize focused items

## How Navigation Works

1. Arrow keys (Up/Down/Left/Right) move focus between UI elements
2. Enter key triggers the action of the currently focused element
3. Escape key navigates back based on navigation history
4. Home key navigates to the application main screen

## Adding Focusable Elements

To make a UI element work with the remote control:

1. Use the `FocusableButton`, `FocusableItem`, or `FocusableInput` components
2. Provide a unique ID for each focusable element
3. Specify neighbors for explicit navigation paths (optional)
4. Register focusable elements with the NavigationContext

Example:
```tsx
<FocusableButton
  id="play-button"
  onClick={handlePlay}
  neighbors={{
    up: "menu-button",
    down: "pause-button",
    left: "rewind-button",
    right: "forward-button"
  }}
>
  Play
</FocusableButton>
```

## Testing Remote Control Navigation

When testing:
1. Use keyboard navigation exclusively (no mouse)
2. Verify all UI elements can be focused
3. Check that Enter key triggers the correct actions
4. Confirm that Back (Escape) key works as expected
5. Ensure focus is visually clear from a distance

## Best Practices

1. Always provide clear visual feedback for focused elements
2. Ensure logical navigation paths between elements
3. Implement explicit neighbor relationships for key UI components
4. Test thoroughly with keyboard-only navigation
5. Design UI elements to be easily selectable from a distance

## Carousel Component & Remote Control

The Carousel component (`src/components/content/Carousel.tsx`) is optimized for remote control navigation with the following features:

1. **Group Navigation**: Each carousel is registered as a focus group
   ```tsx
   <Carousel 
     groupId="featured-content" 
     title="Featured Shows"
   >
     {/* Carousel items */}
   </Carousel>
   ```

2. **Automatic Item Registration**: Items in the carousel are automatically registered with the navigation system

3. **Arrow Key Navigation**: 
   - Left/Right: Move between items in the carousel
   - Up/Down: Move to carousel above/below

4. **Focus Retention**: When returning to a carousel, focus returns to the last selected item

### Remote Control Tips for Carousels

1. Give each carousel a unique `groupId`
2. Make sure carousel items are focusable elements
3. For best user experience, implement explicit neighbors for the first and last items
4. Limit the number of items visible at once for better performance (4-5 is recommended)
5. Test navigation with keyboard keys to ensure smooth transitions 