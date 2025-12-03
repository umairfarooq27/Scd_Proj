   # SCD Project - Vault Application with Docker
   
   ## Features
   - CRUD Operations
   - Search Functionality
   - Sort Records
   - Export Data to Text File
   - Automatic Backup System
   - Vault Statistics
   - MongoDB Integration
   
   ## Prerequisites
   - Docker
   - Docker Compose
   
   ## Quick Start
   
   1. Clone the repository:
```bash
   git clone https://github.com/umairfarooq27/Scd_Proj.git
   cd Scd_Proj
```
   
   2. Create `.env` file:
```
   MONGODB_URI=mongodb://mongodb:27017/vaultdb
   PORT=3000
```
   
   3. Run with Docker Compose:
```bash
   docker-compose up --build
```
   
   4. Access the application:
```bash
   docker exec -it backend node main.js
```
   
   ## Docker Deployment
   
   ### Manual Deployment
   See `manual-deployment-commands.txt` for step-by-step Docker CLI commands.
   
   ### Docker Compose Deployment
   See `DOCKER_COMPOSE_BENEFITS.md` for advantages of using Docker Compose.
   
   ## Project Structure
   - `main.js` - Main application file
   - `Dockerfile` - Docker configuration
   - `docker-compose.yml` - Multi-container orchestration
   - `db/` - Database utilities
   - `data/` - Data storage
   
   ## Author
   Umair Farooq
