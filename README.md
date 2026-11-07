# 🐾 Adopta y transforma en Arapata

## 1. Descripción del proyecto

El proyecto consiste en desarrollar una aplicación web que utiliza métodos numéricos para simular la disminución de la cantidad de perros sin hogar o pendientes de adopción en la población de Arapata, municipio de Coripata, departamento de La Paz, Bolivia.

Su propósito es mostrar cómo las matemáticas pueden ayudar a comprender un problema de interés comunitario y promover la adopción responsable.

**Nota:** Los valores numéricos utilizados son hipotéticos y tienen fines académicos. No representan un censo real de Arapata.

## 2. Problema y pregunta del desafío

Se busca estudiar cómo podría disminuir la cantidad de perros sin hogar o pendientes de adopción durante una campaña de adopción responsable.

**Pregunta:** ¿Cómo podría cambiar, durante un periodo de 30 días, la cantidad de perros pendientes de adopción si se desarrolla una campaña con una tasa de adopción proporcional constante?

## 3. Modelo matemático

Se utiliza la ecuación diferencial:

\[
\frac{dP}{dt}=-kP
\]

Con condición inicial:

\[
P(0)=P_0=100
\]

Parámetros:
- P(t): cantidad estimada de perros pendientes de adopción.
- t: tiempo en días.
- P₀: población inicial de 100 perros (valor hipotético).
- k: constante de disminución de 0.05 día⁻¹.
- Intervalo: de 0 a 30 días.

## 4. Métodos implementados

- Solución analítica exacta.
- Método de Heun (Runge-Kutta de orden 2).
- Método clásico de Runge-Kutta de orden 4 (RK4).

Se comparan los resultados mediante tablas, gráficas, error absoluto y error relativo porcentual.

## 5. Tecnologías utilizadas

- HTML
- CSS
- JavaScript

## 6. Instrucciones de ejecución

1. Descargar o clonar este repositorio.
2. Mantener los archivos index.html, styles.css y script.js en la misma carpeta.
3. Abrir index.html en un navegador web.
4. Modificar los parámetros y presionar el botón de cálculo.
5. Consultar los procedimientos paso a paso, las gráficas y las tablas.

## 7. Integrantes

Agregar aquí los nombres de los integrantes del equipo.

## 8. Materia

Métodos Numéricos.
