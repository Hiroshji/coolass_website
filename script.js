class WindowsDesktop {
    constructor() {
        this.isDragging = false;
        this.dragElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.windows = new Map();
        this.zIndex = 100;

        this.init();
    }

    init() {
        this.setupDesktopIcons();
        this.setupWindowControls();
        this.setupTaskbar();
        this.updateTime();
        this.setupWindowDragging();

        // Update time every second
        setInterval(() => this.updateTime(), 1000);
    }

    setupDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');

        icons.forEach(icon => {
            let iconDragStarted = false;
            let startX, startY;

            // Mouse down - start tracking
            icon.addEventListener('mousedown', (e) => {
                iconDragStarted = false;
                startX = e.clientX;
                startY = e.clientY;

                this.isDragging = true;
                this.dragElement = icon;
                this.dragElement.startX = startX;
                this.dragElement.startY = startY;
                const rect = icon.getBoundingClientRect();
                this.dragOffset.x = e.clientX - rect.left;
                this.dragOffset.y = e.clientY - rect.top;
                e.preventDefault();
            });

            // Mouse up - handle click or end drag
            document.addEventListener('mouseup', (e) => {
                if (this.dragElement === icon) {
                    if (!iconDragStarted) {
                        // It's a click - toggle window
                        this.toggleWindow(icon.dataset.window);
                    }
                    iconDragStarted = false;
                }
            });

            // Store reference for cleanup
            icon.iconDragStarted = () => iconDragStarted;
            icon.setDragStarted = (value) => { iconDragStarted = value; };
        });

        // Global mouse events for dragging icons only
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.dragElement && this.dragElement.classList.contains('desktop-icon')) {
                const deltaX = Math.abs(e.clientX - (this.dragElement.startX || 0));
                const deltaY = Math.abs(e.clientY - (this.dragElement.startY || 0));

                // If mouse moved more than 5px, consider it a drag
                if (deltaX > 5 || deltaY > 5) {
                    if (this.dragElement.setDragStarted) {
                        this.dragElement.setDragStarted(true);
                    }
                    this.dragElement.classList.add('dragging');

                    const x = e.clientX - this.dragOffset.x;
                    const y = e.clientY - this.dragOffset.y;

                    // Keep elements within viewport bounds
                    const maxX = window.innerWidth - this.dragElement.offsetWidth;
                    const maxY = window.innerHeight - this.dragElement.offsetHeight - 48; // Account for taskbar

                    const boundedX = Math.max(0, Math.min(x, maxX));
                    const boundedY = Math.max(0, Math.min(y, maxY));

                    this.dragElement.style.left = boundedX + 'px';
                    this.dragElement.style.top = boundedY + 'px';
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging && this.dragElement && this.dragElement.classList.contains('desktop-icon')) {
                this.dragElement.classList.remove('dragging');
                this.isDragging = false;
                this.dragElement = null;
            }
        });
    }

    toggleWindow(windowId) {
        const windowElement = document.getElementById(`${windowId}-window`);
        if (!windowElement) return;

        // If window is already open, close it
        if (windowElement.classList.contains('active')) {
            this.closeWindow(windowId);
            return;
        }

        // Position window if not already positioned
        if (!this.windows.has(windowId)) {
            // Position windows in a cascade style
            const openWindows = document.querySelectorAll('.window.active').length;
            const offsetX = openWindows * 30;
            const offsetY = openWindows * 30;
            const x = 100 + offsetX;
            const y = 100 + offsetY;

            windowElement.style.left = `${Math.min(x, window.innerWidth - 650)}px`;
            windowElement.style.top = `${Math.min(y, window.innerHeight - 450)}px`;

            this.windows.set(windowId, {
                element: windowElement,
                isMaximized: false,
                originalPosition: { x, y },
                originalSize: { width: 600, height: 400 }
            });
        }

        // Show window with animation
        windowElement.classList.add('opening');
        windowElement.classList.add('active');
        windowElement.style.zIndex = ++this.zIndex;

        // Remove animation class after animation completes
        setTimeout(() => {
            windowElement.classList.remove('opening');
        }, 200);
    }

    openWindow(windowId) {
        // Keep this method for compatibility, but use toggle
        this.toggleWindow(windowId);
    }

    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        windowData.element.classList.remove('active');
        this.windows.delete(windowId);
    }

    closeAllWindows() {
        document.querySelectorAll('.window.active').forEach(window => {
            window.classList.remove('active');
        });
        this.windows.clear();
    }

    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        windowData.element.style.transform = 'scale(0.1)';
        windowData.element.style.opacity = '0';

        setTimeout(() => {
            windowData.element.classList.remove('active');
            windowData.element.style.transform = '';
            windowData.element.style.opacity = '';
        }, 200);
    }

    maximizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        if (windowData.isMaximized) {
            // Restore window
            windowData.element.classList.remove('maximized');
            windowData.element.style.left = `${windowData.originalPosition.x}px`;
            windowData.element.style.top = `${windowData.originalPosition.y}px`;
            windowData.element.style.width = `${windowData.originalSize.width}px`;
            windowData.element.style.height = `${windowData.originalSize.height}px`;
            windowData.isMaximized = false;
        } else {
            // Maximize window
            windowData.originalPosition = {
                x: parseInt(windowData.element.style.left) || 0,
                y: parseInt(windowData.element.style.top) || 0
            };
            windowData.originalSize = {
                width: windowData.element.offsetWidth,
                height: windowData.element.offsetHeight
            };

            windowData.element.classList.add('maximized');
            windowData.isMaximized = true;
        }
    }

    setupWindowControls() {
        document.addEventListener('click', (e) => {
            // Check if clicked on window controls area (any of the buttons)
            if (e.target.classList.contains('window-btn') || e.target.closest('.window-controls')) {
                const window = e.target.closest('.window');
                const windowId = window.id.replace('-window', '');

                // All buttons just close the window
                this.closeWindow(windowId);
                e.stopPropagation();
            }
        });
    }

    // Replace your old setupWindowDragging() with this inside the WindowsDesktop class
    setupWindowDragging() {
        // internal drag state
        this._dragState = {
            active: false,
            windowEl: null,
            offset: { x: 0, y: 0 },
            captureEl: null
        };

        // start dragging (attached to header/tab)
        const startPointerDrag = (e) => {
            // Prevent duplicate calls from both pointer and mouse events
            if (e.type === 'mousedown' && 'PointerEvent' in window) {
                // Skip mousedown if browser supports pointer events
                return;
            }

            // only left-button / primary pointer
            if (e.button && e.button !== 0) return;

            // the header/tab element that was clicked
            const clickable = e.currentTarget;
            const win = clickable.closest('.window');
            if (!win || win.classList.contains('maximized')) return;

            // don't start dragging when clicking controls or inputs
            if (e.target.closest('.window-controls') ||
                /BUTTON|INPUT|TEXTAREA|A/.test(e.target.tagName)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation(); // Prevent icon drag system from interfering

            const rect = win.getBoundingClientRect();
            this._dragState.active = true;
            this._dragState.windowEl = win;
            this._dragState.offset.x = e.clientX - rect.left;
            this._dragState.offset.y = e.clientY - rect.top;
            this._dragState.captureEl = clickable;

            // ensure the window will respond to left/top changes
            win.style.position = 'absolute';
            // reset moved flag
            this._dragState.moved = false;

            // visual debug: highlight clicked element briefly
            clickable.classList && clickable.classList.add('dragging-start');
            setTimeout(() => clickable.classList && clickable.classList.remove('dragging-start'), 1200);

            // ensure this window is on top
            win.style.zIndex = ++this.zIndex;

            // debug
            console.debug('start drag', { id: win.id, x: this._dragState.offset.x, y: this._dragState.offset.y });

            // keep receiving pointer events even if cursor leaves the header
            try { clickable.setPointerCapture && clickable.setPointerCapture(e.pointerId); } catch (err) { console.debug('setPointerCapture failed', err); }
        };

        // move
        const onPointerMove = (e) => {
            // Prevent duplicate calls from both pointer and mouse events
            if (e.type === 'mousemove' && 'PointerEvent' in window && this._dragState.captureEl) {
                // Skip mousemove if we're using pointer events
                return;
            }

            if (!this._dragState.active || !this._dragState.windowEl) return;

            // log the first move so we can confirm pointermove is firing
            if (!this._dragState.moved) {
                console.debug('pointermove detected for', this._dragState.windowEl && this._dragState.windowEl.id);
                this._dragState.moved = true;
            }

            const win = this._dragState.windowEl;
            let x = e.clientX - this._dragState.offset.x;
            let y = e.clientY - this._dragState.offset.y;

            // keep inside viewport (account for taskbar)
            const maxX = window.innerWidth - win.offsetWidth;
            const maxY = window.innerHeight - win.offsetHeight - 48;
            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));

            win.style.left = `${x}px`;
            win.style.top = `${y}px`;

            // debug (throttled by simple modulo of pointerId if available)
            if (typeof e.pointerId !== 'undefined' && (e.pointerId % 10) === 0) {
                console.debug('drag move', { id: win.id, left: x, top: y, pointerId: e.pointerId });
            }
        };

        // end dragging
        const endPointerDrag = (e) => {
            if (this._dragState.active && this._dragState.captureEl) {
                try {
                    this._dragState.captureEl.releasePointerCapture && this._dragState.captureEl.releasePointerCapture(e.pointerId);
                } catch (err) { console.debug('releasePointerCapture failed', err); }
            }
            this._dragState.active = false;
            this._dragState.windowEl = null;
            this._dragState.captureEl = null;
            // remove any visual highlight remaining
            document.querySelectorAll('.dragging-start').forEach(el => el.classList.remove('dragging-start'));
        };

        // attach to a single window's header + tab (and tab icon)
        const attachDragToWindow = (win) => {
            if (!win) return;
            const header = win.querySelector('.window-header');
            const tab = win.querySelector('.window-tab');

            // Only attach to header and tab, not their children
            // (children have pointer-events: none and will bubble up)
            [header, tab].forEach(el => {
                if (!el) return;
                // avoid double-attaching
                if (el._dragAttached) return;
                el._dragAttached = true;

                // pointerdown rather than mousedown — better for touch & robustness
                el.addEventListener('pointerdown', startPointerDrag);
                // also add mousedown fallback for older setups
                el.addEventListener('mousedown', startPointerDrag);

                // prevent default touch behaviours (pinch/scroll) while dragging
                el.style.touchAction = 'none';
                // nice cursor
                el.style.cursor = 'grab';
                // prevent accidental text selection
                el.style.userSelect = 'none';
                console.debug('attached drag listener', { el: el.className || el.nodeName, winId: win.id });
            });
        };

        // attach existing windows
        document.querySelectorAll('.window').forEach(attachDragToWindow);

        // global pointer listeners for move / up (with mouse fallbacks)
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', endPointerDrag);
        document.addEventListener('pointercancel', endPointerDrag);

        // mouse fallbacks
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', endPointerDrag);

        // observe DOM so dynamically-added windows get handlers too
        const mo = new MutationObserver((mutations) => {
            for (const m of mutations) {
                m.addedNodes.forEach(node => {
                    if (!(node instanceof HTMLElement)) return;
                    if (node.classList && node.classList.contains('window')) {
                        attachDragToWindow(node);
                    } else if (node.querySelector) {
                        node.querySelectorAll && node.querySelectorAll('.window').forEach(attachDragToWindow);
                    }
                });
            }
        });
        mo.observe(document.body, { childList: true, subtree: true });

        // store observer so it can be disconnected later if needed
        this._windowDragObserver = mo;
    }

    setupTaskbar() {
        // Start button functionality
        const startButton = document.querySelector('.start-button');
        startButton.addEventListener('click', () => {
            // You can implement a start menu here
            console.log('Start menu clicked');
        });

        // Taskbar icon clicks
        const taskbarIcons = document.querySelectorAll('.taskbar-icon');
        taskbarIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                const tooltip = icon.dataset.tooltip;
                console.log(`${tooltip} clicked`);
                // You can implement specific functionality for each taskbar icon
            });
        });
    }

    updateTime() {
        const timeElement = document.getElementById('current-time');
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        timeElement.textContent = timeString;
    }
}

// Initialize the desktop when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WindowsDesktop();
});

// Handle window resize
window.addEventListener('resize', () => {
    // Reposition windows if they're outside the viewport
    document.querySelectorAll('.window.active').forEach(window => {
        const rect = window.getBoundingClientRect();
        const maxX = window.innerWidth - window.offsetWidth;
        const maxY = window.innerHeight - window.offsetHeight - 48;

        if (rect.left > maxX) {
            window.style.left = `${maxX}px`;
        }
        if (rect.top > maxY) {
            window.style.top = `${maxY}px`;
        }
    });
});

// Prevent right-click context menu on desktop (optional)
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('desktop') || e.target.classList.contains('desktop-icon')) {
        e.preventDefault();
    }
});

// Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + F4 to close active window
    if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        const activeWindow = document.querySelector('.window.active');
        if (activeWindow) {
            const windowId = activeWindow.id.replace('-window', '');
            const desktop = new WindowsDesktop();
            desktop.closeWindow(windowId);
        }
    }

    // Windows key + D to show desktop (minimize all windows)
    if (e.metaKey && e.key === 'd') {
        e.preventDefault();
        document.querySelectorAll('.window.active').forEach(window => {
            window.classList.remove('active');
        });
    }
});
