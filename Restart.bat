@echo off
setlocal enabledelayedexpansion

REM Colores para la consola (simulados con caracteres)
cls
echo.
echo ============================================================
echo      GESTOR DE DOCKER - BUDGET MANAGER
echo ============================================================
echo.

REM Verificar si Docker está corriendo
echo [VERIFICACION] Comprobando si Docker está corriendo...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker Desktop no está ejecutándose
    echo.
    echo Abre Docker Desktop desde el menú Inicio y luego vuelve a ejecutar este script.
    echo.
    pause
    exit /b 1
)
echo [OK] Docker está activo
echo.

:MENU
cls
echo ============================================================
echo      MENÚ DE OPCIONES - BUDGET MANAGER
echo ============================================================
echo.
echo 1. Reiniciar todo (down + build + up + migraciones)
echo 2. Levantar contenedores sin reconstruir
echo 3. Detener contenedores
echo 4. Ver estado de contenedores
echo 5. Ver logs en tiempo real
echo 6. Acceder a Prisma Studio
echo 7. Resetear base de datos (elimina todos los datos)
echo 8. Ejecutar migraciones nuevas
echo 9. Salir
echo.
set /p choice="Selecciona una opcion (1-9): "

if "%choice%"=="1" goto RESTART_FULL
if "%choice%"=="2" goto START_CONTAINERS
if "%choice%"=="3" goto STOP_CONTAINERS
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" goto LOGS
if "%choice%"=="6" goto PRISMA_STUDIO
if "%choice%"=="7" goto RESET_DB
if "%choice%"=="8" goto NEW_MIGRATION
if "%choice%"=="9" goto END
goto MENU

:RESTART_FULL
echo.
echo ============================================================
echo [1/5] Deteniendo contenedores...
echo ============================================================
docker-compose down
if %errorlevel% neq 0 (
    echo [ERROR] No se pudieron detener los contenedores
    pause
    goto MENU
)
echo [OK] Contenedores detenidos
echo.

echo ============================================================
echo [2/5] Limpiando volúmenes (datos previos)...
echo ============================================================
docker-compose down -v
echo [OK] Volúmenes limpiados
echo.

echo ============================================================
echo [3/5] Construyendo y levantando contenedores...
echo ============================================================
docker-compose up --build -d
if %errorlevel% neq 0 (
    echo [ERROR] No se pudieron levantar los contenedores
    pause
    goto MENU
)
echo [OK] Contenedores levantados
echo.

echo ============================================================
echo [4/5] Esperando que los servicios estén listos...
echo ============================================================
echo Esperando 20 segundos para que PostgreSQL esté listo...
timeout /t 20 /nobreak > nul
echo [OK] Servicios listos
echo.

echo ============================================================
echo [5/5] Ejecutando migraciones de Prisma...
echo ============================================================
for /f "tokens=2 delims=_" %%i in ('docker ps --filter "ancestor=01_budgetmanager-backend" --format "{{.Names}}"') do (
    set container_name=%%i
)
if not defined container_name (
    set container_name=01_budgetmanager-backend-1
)
docker exec !container_name! npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [WARNING] Las migraciones fallaron. Continuando...
)
echo [OK] Migraciones ejecutadas
echo.

echo ============================================================
echo ¡PROCESO COMPLETADO EXITOSAMENTE!
echo ============================================================
echo.
echo URLs de acceso:
echo - Frontend:  http://localhost:3001
echo - Backend:   http://localhost:3000/api
echo - Health:    http://localhost:3000/health
echo.
pause
goto MENU

:START_CONTAINERS
echo.
echo ============================================================
echo Levantando contenedores...
echo ============================================================
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] No se pudieron levantar los contenedores
    pause
    goto MENU
)
echo [OK] Contenedores levantados
echo.
timeout /t 5 /nobreak > nul
goto MENU

:STOP_CONTAINERS
echo.
echo ============================================================
echo Deteniendo contenedores...
echo ============================================================
docker-compose down
if %errorlevel% neq 0 (
    echo [ERROR] No se pudieron detener los contenedores
    pause
    goto MENU
)
echo [OK] Contenedores detenidos
echo.
pause
goto MENU

:STATUS
echo.
echo ============================================================
echo Estado actual de contenedores
echo ============================================================
docker-compose ps
echo.
pause
goto MENU

:LOGS
echo.
echo ============================================================
echo Logs en tiempo real (Ctrl+C para salir)
echo ============================================================
echo.
set /p service="¿Qué servicio? (backend/frontend/db) o presiona Enter para todos: "
if "%service%"=="backend" (
    docker-compose logs -f backend
) else if "%service%"=="frontend" (
    docker-compose logs -f frontend
) else if "%service%"=="db" (
    docker-compose logs -f db
) else (
    docker-compose logs -f
)
goto MENU

:PRISMA_STUDIO
echo.
echo ============================================================
echo Abriendo Prisma Studio...
echo ============================================================
echo.
echo Prisma Studio se abrirá en http://localhost:5555
echo Presiona Ctrl+C para detener (en la consola Docker)
echo.
for /f "tokens=2 delims=_" %%i in ('docker ps --filter "ancestor=01_budgetmanager-backend" --format "{{.Names}}"') do (
    set container_name=%%i
)
if not defined container_name (
    set container_name=01_budgetmanager-backend-1
)
docker exec -it !container_name! npx prisma studio
goto MENU

:RESET_DB
echo.
echo ============================================================
echo ADVERTENCIA: Resetear base de datos
echo ============================================================
echo.
echo Esta acción eliminará TODOS los datos de la base de datos
set /p confirm="¿Estás seguro? (s/n): "
if /i "%confirm%"=="s" (
    echo.
    echo Deteniendo contenedores...
    docker-compose down -v
    echo [OK] Base de datos reseteada
    echo.
    timeout /t 3 /nobreak > nul
) else (
    echo Operación cancelada
)
echo.
pause
goto MENU

:NEW_MIGRATION
echo.
echo ============================================================
echo Crear nueva migración
echo ============================================================
echo.
set /p migration_name="Nombre de la migración: "
for /f "tokens=2 delims=_" %%i in ('docker ps --filter "ancestor=01_budgetmanager-backend" --format "{{.Names}}"') do (
    set container_name=%%i
)
if not defined container_name (
    set container_name=01_budgetmanager-backend-1
)
docker exec -it !container_name! npx prisma migrate dev --name !migration_name!
echo.
pause
goto MENU

:END
echo.
echo Saliendo...
exit /b 0