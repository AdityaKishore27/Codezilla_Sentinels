#!/usr/bin/env python3
"""
Local development server runner for Fraud Detection System
"""

import os
import sys
import subprocess
import webbrowser
import time
import socket
from threading import Timer

def check_port(port):
    """Check if port is available"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) != 0

def open_browser():
    """Open browser after delay"""
    time.sleep(2)  # Give server time to start
    webbrowser.open('http://localhost:5000')

def main():
    """Main runner function"""
    print("🚀 Starting Fraud Detection Dashboard...")
    print("=" * 50)

    # Check if setup has been run
    if not os.path.exists('backend/data/trained_xgb_model.pkl'):
        print("⚠️  Models not found. Running setup first...")
        result = subprocess.run([sys.executable, 'setup.py'], cwd='.')
        if result.returncode != 0:
            print("❌ Setup failed. Please run setup.py manually.")
            return 1

    # Check if port 5000 is available
    if not check_port(5000):
        print("❌ Port 5000 is already in use.")
        print("💡 Try: lsof -ti:5000 | xargs kill -9")
        return 1

    # Change to backend directory
    os.chdir('backend')

    print("🌐 Starting Flask server on http://localhost:5000")
    print("📊 Dashboard will open automatically...")
    print("\n⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)

    # Open browser after delay
    Timer(3.0, open_browser).start()

    # Start Flask app
    try:
        subprocess.run([sys.executable, 'app.py'])
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Goodbye!")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
