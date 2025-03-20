#!/usr/bin/env python3
"""
Garuda 4.0 Launcher
This script helps set up and run the Garuda 4.0 application.
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required.")
        sys.exit(1)

def setup_virtual_environment():
    """Set up a virtual environment if it doesn't exist."""
    if not Path("venv").exists():
        print("Setting up virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
    
    # Activate virtual environment
    if sys.platform == "win32":
        python_exe = os.path.join("venv", "Scripts", "python.exe")
    else:
        python_exe = os.path.join("venv", "bin", "python")
    
    if not os.path.exists(python_exe):
        print(f"Error: Could not find Python executable at {python_exe}")
        sys.exit(1)
    
    return python_exe

def install_dependencies(python_exe):
    """Install required dependencies."""
    print("Installing dependencies...")
    subprocess.run([python_exe, "-m", "pip", "install", "-r", "requirements.txt"], check=True)

def check_models():
    """Check if ML models exist, train if needed."""
    models_dir = Path("models/trained_models")
    best_model = models_dir / "best_model.pkl"
    
    if not models_dir.exists():
        os.makedirs(models_dir, exist_ok=True)
    
    if not best_model.exists():
        print("Training ML models (this may take a few minutes)...")
        subprocess.run([python_exe, "models/train_models.py"], check=True)
    else:
        print("ML models already trained and ready.")

def run_application(python_exe, debug=False):
    """Run the Flask application."""
    env = os.environ.copy()
    if debug:
        env["FLASK_ENV"] = "development"
        env["FLASK_DEBUG"] = "1"
    
    print(f"Starting Garuda 4.0 {'in debug mode' if debug else ''}...")
    subprocess.run([python_exe, "app.py"], env=env)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Garuda 4.0 Launcher")
    parser.add_argument("--debug", action="store_true", help="Run in debug mode")
    parser.add_argument("--skip-deps", action="store_true", help="Skip dependency installation")
    args = parser.parse_args()
    
    # Check Python version
    check_python_version()
    
    # Setup environment
    python_exe = setup_virtual_environment()
    
    # Install dependencies
    if not args.skip_deps:
        install_dependencies(python_exe)
    
    # Check models
    check_models()
    
    # Run application
    run_application(python_exe, args.debug) 