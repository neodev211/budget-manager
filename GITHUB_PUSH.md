# Instrucciones para Subir a GitHub

## Prerequisitos

1. Tener Git instalado
2. Tener una cuenta en GitHub
3. Haber creado un repositorio en GitHub (vacío, sin README)

## Pasos para Subir el Proyecto

### 1. Navegar al directorio del proyecto
```bash
cd "c:\Proyectos\600_Claude\80_Code\01_platziflix"
```

### 2. Inicializar Git (si no está hecho)
```bash
git init
```

### 3. Agregar todos los archivos
```bash
git add .
```

### 4. Verificar que todo está correcto
```bash
git status
```

Deberías ver:
- ✓ `.gitignore` agregado
- ✓ `README.md` agregado
- ✓ `LICENSE` agregado
- ✗ `node_modules/` NO debería aparecer (excluido por .gitignore)
- ✗ `.env` NO debería aparecer (excluido por .gitignore)

### 5. Primer commit
```bash
git commit -m "Initial commit: Budget Manager - Full stack expense tracking application

- Complete backend with Express, TypeScript, and PostgreSQL
- Modern frontend with Next.js 15 and Tailwind CSS
- Docker containerization with docker-compose
- Comprehensive documentation and setup guides"
```

### 6. Cambiar nombre de rama a 'main' (si es necesario)
```bash
git branch -M main
```

### 7. Agregar remoto de GitHub
Reemplaza `TU_USUARIO` y `TU_REPO` con tus datos:
```bash
git remote add origin https://github.com/TU_USUARIO/budget-manager.git
```

O si usas SSH:
```bash
git remote add origin git@github.com:TU_USUARIO/budget-manager.git
```

### 8. Hacer push al repositorio
```bash
git push -u origin main
```

Si pidepidecontraseña, usa tu GitHub token (no password):
1. Ve a https://github.com/settings/tokens
2. Crea un nuevo token con permisos `repo`
3. Usa el token como contraseña

## Verificación en GitHub

1. **Ingresa a tu repositorio**
   ```
   https://github.com/TU_USUARIO/budget-manager
   ```

2. **Verifica que todo está presente**
   - [ ] README.md se ve correctamente
   - [ ] LICENSE está presente
   - [ ] Archivos backend y frontend están presentes
   - [ ] .gitignore está aplicado (node_modules NO aparece)

3. **Verifica que está seguro**
   - [ ] No hay archivos `.env` públicos
   - [ ] No hay carpetas `node_modules`
   - [ ] No hay archivos de credenciales

## Configuración Adicional en GitHub (Opcional)

### 1. Agregar descripción
Ir a Settings > Description y agregar:
```
Full-stack expense tracking application with budget management,
provisioning, and real-time validations.
```

### 2. Agregar Topics
Ir a Settings > Topics y agregar:
- budget-management
- expense-tracking
- next-js
- express
- typescript
- tailwindcss
- postgresql
- docker

### 3. Proteger rama main
Ir a Settings > Branches > Branch protection rules:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

## Comandos Útiles Después

### Ver estado de Git
```bash
git status
```

### Ver historial de commits
```bash
git log --oneline
```

### Agregar cambios futuros
```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

### Crear rama de desarrollo
```bash
git checkout -b develop
git push -u origin develop
```

## Solución de Problemas

### Error: "fatal: not a git repository"
```bash
git init
git add .
git commit -m "message"
```

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/usuario/repo.git
```

### Error: "permission denied"
- Verificar que tienes permisos en el repositorio
- Usar SSH key o GitHub token
- Verificar que el repositorio es tuyo

### Error: "Please configure your email and name"
```bash
git config --global user.email "tu@email.com"
git config --global user.name "Tu Nombre"
```

---

**¡Listo! Tu proyecto está en GitHub** 🎉

Para continuar con Claude Code en la nube, clonar desde GitHub:
```bash
git clone https://github.com/TU_USUARIO/budget-manager.git
cd budget-manager
docker-compose up --build
```
