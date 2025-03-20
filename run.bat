@echo off
REM Garuda 4.0 Launcher Script for Windows

SETLOCAL EnableDelayedExpansion

echo ===== Garuda 4.0 Launcher =====

REM Check Python version
echo Checking Python version...
python --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH.
    goto :error
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set python_version=%%i
for /f "tokens=1,2 delims=." %%a in ("!python_version!") do (
    set python_major=%%a
    set python_minor=%%b
)

if !python_major! LSS 3 (
    echo Error: Python 3.8 or higher is required. Found !python_version!
    goto :error
) else (
    if !python_major! EQU 3 (
        if !python_minor! LSS 8 (
            echo Error: Python 3.8 or higher is required. Found !python_version!
            goto :error
        )
    )
)

echo Python !python_version! is compatible.

REM Setup virtual environment
echo Setting up virtual environment...
if not exist venv (
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to create virtual environment.
        goto :error
    )
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to activate virtual environment.
    goto :error
)

echo Virtual environment activated.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies.
    goto :error
)

echo Dependencies installed.

REM Check and train models if needed
echo Checking ML models...
if not exist models\trained_models mkdir models\trained_models

if not exist models\trained_models\best_model.pkl (
    echo ML models not found. Training models (this may take a few minutes)...
    python models\train_models.py
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to train models.
        goto :error
    )
    echo Models trained successfully.
) else (
    echo ML models already trained and ready.
)

REM Run the application
echo Starting Garuda 4.0...
echo Application will be available at http://localhost:5000
python app.py
goto :end

:error
echo Garuda 4.0 setup failed.
exit /b 1

:end
echo Garuda 4.0 has been stopped.
exit /b 0 