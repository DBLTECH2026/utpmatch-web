# Credenciales de prueba — UTP+Match

> Cuentas demo para que el equipo pruebe la plataforma.
> Se crean automáticamente al correr `php artisan migrate:fresh --seed`.

**Contraseña para TODAS las cuentas:** `Utp+Match2026!`

---

## Alumnos por carrera (para probar el match de cada carrera)

Cada uno arranca **sin rol objetivo**, así que al ingresar verán el módulo **Inicio**
con su resumen UTP (ciclo, cursos, skills) y podrán **elegir su meta** para que se
arme la ruta y el match.

| Carrera | Correo | Ciclo | Roles que puede elegir |
|---|---|---|---|
| **Ing. de Sistemas** | `diego.sistemas@utp.edu.pe` | 7 | Frontend Jr. · Backend Jr. · Data Analyst Jr. · QA/Testing Jr. |
| **Ing. Industrial** | `lucia.industrial@utp.edu.pe` | 8 | Analista de Procesos · Analista de Logística · Analista de Calidad · Trainee de Operaciones |
| **Derecho** | `andres.derecho@utp.edu.pe` | 9 | Asistente Legal · Abogado Jr. Corporativo · Analista Legal · Asistente Laboral/Tributario |
| **Contabilidad** | `camila.contabilidad@utp.edu.pe` | 6 | Asistente Contable · Analista Tributario · Auditor Jr. · Analista de Costos |

---

## Cuenta principal (alumna del prototipo)

| Rol | Correo | Notas |
|---|---|---|
| Alumna (Sistemas) | `maria@utp.edu.pe` | María Quispe, ciclo 8, la del prototipo/Figma |

## Cuentas de otros roles (RBAC)

| Rol | Correo | Para probar |
|---|---|---|
| Asesor | `asesor@utp.edu.pe` | Permisos de asesor |
| Admin | `admin@utp.edu.pe` | Permisos de administrador |

---

## Cómo probar el flujo completo

1. Entra a **http://localhost:3000** (frontend) — el backend debe correr en `http://localhost:8000`.
2. Inicia sesión con cualquier alumno de la tabla.
3. Caes en **Inicio**: revisa el resumen y **elige un rol objetivo** de tu carrera.
4. Se arma tu **Ruta & Brechas**, tu **match** en Empleos, y el **Dashboard** muestra tu viaje.
5. Explora: Perfil 360, CV Inteligente (genera tu CV + ATS), Asesores, Copiloto.

> Cada carrera tiene su propia demanda de skills, así que el % de match y la ruta
> cambian según el rol que elijas. Puedes cambiar de meta cuando quieras (se recalcula).

---

## Levantar el entorno

```bash
# Backend (Laravel)
cd utpmatch-api
php artisan migrate:fresh --seed   # crea BD + estas cuentas
php artisan serve                  # http://localhost:8000

# Frontend (Next.js)
cd utpmatch-web
npm install
npm run dev                        # http://localhost:3000
```
