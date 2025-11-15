@echo off
setlocal enabledelayedexpansion

cls
echo.
echo ============================================================
echo     DATABASE CONFIGURATION SWITCHER - BUDGET MANAGER
echo ============================================================
echo.
echo This tool helps you switch between different database setups
echo ============================================================
echo.

:MENU
cls
echo.
echo ============================================================
echo      DATABASE OPTIONS
echo ============================================================
echo.
echo 1. Docker PostgreSQL (Local Development) - RECOMMENDED
echo 2. Supabase (Cloud Database)
echo 3. Local PostgreSQL (Standalone)
echo 4. View current configuration
echo 5. Exit
echo.
set /p choice="Select an option (1-5): "

if "%choice%"=="1" goto DOCKER_CONFIG
if "%choice%"=="2" goto SUPABASE_CONFIG
if "%choice%"=="3" goto LOCAL_POSTGRES_CONFIG
if "%choice%"=="4" goto VIEW_CONFIG
if "%choice%"=="5" goto END
echo Invalid option. Please try again.
timeout /t 2 /nobreak > nul
goto MENU

:DOCKER_CONFIG
echo.
echo ============================================================
echo DOCKER POSTGRESQL CONFIGURATION
echo ============================================================
echo.
echo Setting up for local Docker development...
echo.

cd backend
if not exist .env (
    echo Creating .env file...
    copy .env.example .env > nul
)

REM Update the .env file with Docker configuration
(
    echo # Database Configuration - Docker ^(LOCAL^)
    echo # Set on %date% %time%
    echo DATABASE_URL=postgresql://postgres:postgres@db:5432/budget_management?schema=public
    echo PORT=3000
    echo NODE_ENV=development
) > .env

echo.
echo [SUCCESS] Docker PostgreSQL configuration saved to backend\.env
echo.
echo Next steps:
echo 1. Make sure Docker Desktop is running
echo 2. Run: docker-compose up --build -d
echo 3. Wait 20 seconds for PostgreSQL to be ready
echo 4. Run: docker exec 01_budgetmanager-backend-1 npx prisma migrate deploy
echo 5. Run: npm run dev (in the backend folder)
echo.
pause
cd ..
goto MENU

:SUPABASE_CONFIG
echo.
echo ============================================================
echo SUPABASE CLOUD DATABASE CONFIGURATION
echo ============================================================
echo.
echo Step 1: Go to https://supabase.com and create a new project
echo Step 2: Note your credentials:
echo.
set /p project_id="Enter your Supabase Project ID (from project URL): "
set /p db_password="Enter your Supabase Database Password: "
echo.

if "%project_id%"=="" (
    echo [ERROR] Project ID cannot be empty
    pause
    goto MENU
)

if "%db_password%"=="" (
    echo [ERROR] Database Password cannot be empty
    pause
    goto MENU
)

echo.
echo [IMPORTANT] Before continuing:
echo 1. Open SUPABASE_SETUP.sql in a text editor
echo 2. Go to https://supabase.com/dashboard (your project)
echo 3. Click on "SQL Editor" in the left sidebar
echo 4. Click "New Query"
echo 5. Copy and paste the entire SUPABASE_SETUP.sql content
echo 6. Click "Run" to execute all queries
echo.
pause

REM Create the connection string
set "db_url=postgresql://postgres:!db_password!@db.!project_id!.supabase.co:5432/postgres?schema=public"

cd backend
if not exist .env (
    echo Creating .env file...
    copy .env.example .env > nul
)

REM Update the .env file with Supabase configuration
(
    echo # Database Configuration - Supabase ^(CLOUD^)
    echo # Set on %date% %time%
    echo DATABASE_URL=!db_url!
    echo PORT=3000
    echo NODE_ENV=production
) > .env

echo.
echo [SUCCESS] Supabase configuration saved to backend\.env
echo.
echo Connection details:
echo Project ID: %project_id%
echo Host: db.%project_id%.supabase.co
echo Port: 5432
echo Database: postgres
echo.
echo Next steps:
echo 1. Verify SQL setup script was executed in Supabase SQL Editor
echo 2. Run: npx prisma db push
echo 3. Run: npx prisma generate
echo 4. Run: npm run dev
echo.
pause
cd ..
goto MENU

:LOCAL_POSTGRES_CONFIG
echo.
echo ============================================================
echo LOCAL POSTGRESQL CONFIGURATION
echo ============================================================
echo.
echo This assumes you have PostgreSQL installed locally
echo.
set /p host="Enter database host ^(default: localhost^): "
if "%host%"=="" set "host=localhost"

set /p port="Enter database port ^(default: 5432^): "
if "%port%"=="" set "port=5432"

set /p user="Enter database user ^(default: postgres^): "
if "%user%"=="" set "user=postgres"

set /p password="Enter database password: "
if "%password%"=="" (
    echo [WARNING] Empty password - make sure your database allows connections without password
)

set /p database="Enter database name ^(default: budget_management^): "
if "%database%"=="" set "database=budget_management"

echo.
echo Before continuing:
echo 1. Make sure PostgreSQL is running
echo 2. Create the database if it doesn't exist:
echo    createdb %database% -U %user%
echo 3. Test connection:
echo    psql -h %host% -p %port% -U %user% -d %database%
echo.
pause

REM Create the connection string
if "%password%"=="" (
    set "db_url=postgresql://%user%@%host%:%port%/%database%?schema=public"
) else (
    set "db_url=postgresql://%user%:%password%@%host%:%port%/%database%?schema=public"
)

cd backend
if not exist .env (
    echo Creating .env file...
    copy .env.example .env > nul
)

REM Update the .env file with local PostgreSQL configuration
(
    echo # Database Configuration - Local PostgreSQL
    echo # Set on %date% %time%
    echo DATABASE_URL=!db_url!
    echo PORT=3000
    echo NODE_ENV=development
) > .env

echo.
echo [SUCCESS] Local PostgreSQL configuration saved to backend\.env
echo.
echo Connection details:
echo Host: %host%
echo Port: %port%
echo User: %user%
echo Database: %database%
echo.
echo Next steps:
echo 1. Run: npx prisma migrate dev --name init
echo 2. Run: npm run dev
echo.
pause
cd ..
goto MENU

:VIEW_CONFIG
echo.
echo ============================================================
echo CURRENT DATABASE CONFIGURATION
echo ============================================================
echo.

if exist backend\.env (
    echo Contents of backend\.env:
    echo.
    type backend\.env
    echo.
) else (
    echo [WARNING] backend\.env not found
    echo Please configure a database first using options 1-3
    echo.
)

pause
goto MENU

:END
echo.
echo Exiting Database Configuration Tool...
echo.
exit /b 0
