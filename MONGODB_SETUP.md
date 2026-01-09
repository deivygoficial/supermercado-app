# MongoDB Atlas Setup Guide

## 1. Crear Cuenta MongoDB Atlas
1. Ve a: https://cloud.mongodb.com/
2. Click "Try Free"
3. Regístrate con Google o email
4. Verifica tu email

## 2. Crear Cluster Gratuito
1. Click "Build a Database"
2. Selecciona "M0 Sandbox" (GRATIS)
3. Elige región más cercana (ej: AWS us-east-1)
4. Nombre del cluster: "supermercado"
5. Click "Create Cluster"

## 3. Configurar Acceso
1. En "Database Access", click "Add New Database User"
2. Username: "admin"
3. Password: "Supermercado123!" (anótala)
4. Click "Add User"

## 4. Configurar IP
1. En "Network Access", click "Add IP Address"
2. Selecciona "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)
3. Click "Confirm"

## 5. Obtener Connection String
1. En "Database", click "Connect"
2. Selecciona "Drivers"
3. Copia el connection string
4. Reemplaza <password> con tu contraseña
