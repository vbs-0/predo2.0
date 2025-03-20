#!/bin/bash
# Garuda 4.0 Launcher Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check Python version
check_python() {
  echo -e "${BLUE}Checking Python version...${NC}"
  
  if ! command_exists python3; then
    echo -e "${RED}Error: Python 3 is not installed.${NC}"
    exit 1
  fi
  
  python_version=$(python3 --version | cut -d " " -f 2)
  python_major=$(echo $python_version | cut -d. -f1)
  python_minor=$(echo $python_version | cut -d. -f2)
  
  if [ "$python_major" -lt 3 ] || ([ "$python_major" -eq 3 ] && [ "$python_minor" -lt 8 ]); then
    echo -e "${RED}Error: Python 3.8 or higher is required. Found $python_version${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Python $python_version is compatible.${NC}"
}

# Setup virtual environment
setup_venv() {
  echo -e "${BLUE}Setting up virtual environment...${NC}"
  
  if [ ! -d "venv" ]; then
    python3 -m venv venv
    if [ $? -ne 0 ]; then
      echo -e "${RED}Error: Failed to create virtual environment.${NC}"
      exit 1
    fi
    echo -e "${GREEN}Virtual environment created.${NC}"
  else
    echo -e "${YELLOW}Virtual environment already exists.${NC}"
  fi
  
  # Activate virtual environment
  source venv/bin/activate
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to activate virtual environment.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Virtual environment activated.${NC}"
}

# Install dependencies
install_deps() {
  echo -e "${BLUE}Installing dependencies...${NC}"
  pip install -r requirements.txt
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install dependencies.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Dependencies installed.${NC}"
}

# Check and train models if needed
check_models() {
  echo -e "${BLUE}Checking ML models...${NC}"
  
  if [ ! -d "models/trained_models" ]; then
    mkdir -p models/trained_models
  fi
  
  if [ ! -f "models/trained_models/best_model.pkl" ]; then
    echo -e "${YELLOW}ML models not found. Training models (this may take a few minutes)...${NC}"
    python models/train_models.py
    if [ $? -ne 0 ]; then
      echo -e "${RED}Error: Failed to train models.${NC}"
      exit 1
    fi
    echo -e "${GREEN}Models trained successfully.${NC}"
  else
    echo -e "${GREEN}ML models already trained and ready.${NC}"
  fi
}

# Run the application
run_app() {
  echo -e "${BLUE}Starting Garuda 4.0...${NC}"
  echo -e "${GREEN}Application will be available at http://localhost:5000${NC}"
  python app.py
}

# Main execution
echo -e "${BLUE}==== Garuda 4.0 Launcher ====${NC}"
check_python
setup_venv
install_deps
check_models
run_app 