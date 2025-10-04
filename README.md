# Windows-Style Portfolio Website

A Windows desktop-inspired portfolio website similar to bychudy.com but with a Windows aesthetic.

## Features

### Desktop Interface
- **Windows-style desktop** with gradient background
- **Square desktop icons** arranged in a grid (like Windows desktop)
- **Draggable icons** - click and drag icons around the desktop
- **Auto-open on drag** - windows open automatically when you release a dragged icon
- **Click to open** - single-click icons to open their respective windows

### Window Management
- **Windows-style windows** with proper title bars
- **Window controls** - minimize, maximize, and close buttons
- **Draggable windows** - drag windows by their title bar
- **Resizable windows** - resize windows by dragging corners
- **Multiple windows** can be open simultaneously
- **Window layering** - clicking a window brings it to front

### Taskbar
- **Windows-style taskbar** at the bottom
- **Start button** with Windows logo
- **Centered taskbar icons** (like Windows 10/11)
- **System tray** with current time
- **Tooltips** on taskbar icons

### Interactive Elements
- **Smooth animations** for window opening/closing
- **Hover effects** on all interactive elements
- **Keyboard shortcuts**:
  - Alt + F4: Close active window
  - Windows + D: Show desktop (minimize all windows)

## Customization Guide

### Adding Your Own Images to Icons

Replace the placeholder icon styling in `styles.css`:

```css
/* Find this section and modify for each icon */
.icon-image::before {
    content: '';
    /* Replace with background-image: url('your-image.jpg'); */
    background-size: cover;
    background-position: center;
}
```

### Adding New Desktop Icons

1. Add a new icon in `index.html`:
```html
<div class="desktop-icon" data-window="your-project">
    <div class="icon-image"></div>
    <span class="icon-label">YOUR PROJECT</span>
</div>
```

2. Add corresponding window:
```html
<div class="window" id="your-project-window">
    <div class="window-header">
        <span class="window-title">YOUR PROJECT</span>
        <div class="window-controls">
            <button class="window-btn minimize">−</button>
            <button class="window-btn maximize">□</button>
            <button class="window-btn close">×</button>
        </div>
    </div>
    <div class="window-content">
        <!-- Your content here -->
    </div>
</div>
```

### Adding Project Content

Replace the placeholder content in each window's `.project-content` div:

```html
<div class="project-content">
    <h2>Your Project Title</h2>
    <p>Your project description...</p>
    <img src="your-project-image.jpg" alt="Project Image" style="width: 100%; border-radius: 4px;">
    <!-- Add more content as needed -->
</div>
```

### Customizing Colors

Main color variables in `styles.css`:
- Desktop background: `background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);`
- Window title bar: `background: linear-gradient(180deg, #4a90e2 0%, #357abd 100%);`
- Taskbar: `background: linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%);`

### Responsive Design

The website is responsive and adapts to different screen sizes:
- Icons resize and reposition on smaller screens
- Windows become fullscreen on mobile devices
- Taskbar remains functional across all devices

## File Structure

```
coolass_website/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design with touch support

## Usage Tips

1. **Desktop Icons**: Click or drag any icon to open its window
2. **Window Management**: Drag windows by title bar, resize by corners
3. **Multiple Windows**: Open multiple projects simultaneously
4. **Taskbar**: Use taskbar icons for quick navigation
5. **Keyboard Shortcuts**: Use Alt+F4 to close windows, Win+D to minimize all

## Customization Examples

### Change Icon Images
```css
/* Example: Custom icon for NEWONCE project */
.desktop-icon[data-window="newonce"] .icon-image::before {
    background-image: url('images/newonce-icon.jpg');
    background-size: cover;
    content: '';
}
```

### Add More Taskbar Icons
```html
<div class="taskbar-icon" data-tooltip="Gallery">
    <div class="taskbar-icon-image gallery-icon"></div>
</div>
```

### Custom Window Sizes
```css
/* Make specific windows larger */
#newonce-window {
    width: 800px;
    height: 600px;
}
```

Enjoy your Windows-style portfolio website! 🪟✨
