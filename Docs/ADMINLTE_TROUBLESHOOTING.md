# AdminLTE 4 - Guia de Solução de Problemas

## Problema: Layout quebrado / CSS não carregando

Se o layout estiver aparecendo sem estilos, siga estes passos:

### 1. Pare completamente o servidor Angular

```bash
# Pare todos os processos do Angular
pkill -9 node
pkill -9 ng

# Ou use Ctrl+C no terminal onde o servidor está rodando
```

### 2. Limpe o cache e node_modules

```bash
cd frontend

# Remova node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Limpe o cache do npm
npm cache clean --force
```

### 3. Reinstale as dependências

```bash
# Instale novamente
npm install
```

### 4. Verifique se os arquivos do AdminLTE estão instalados

```bash
# Deve mostrar os arquivos CSS e JS do AdminLTE
ls -la node_modules/admin-lte/dist/css/
ls -la node_modules/admin-lte/dist/js/
ls -la node_modules/bootstrap/dist/css/
ls -la node_modules/bootstrap/dist/js/
```

### 5. Inicie o servidor novamente

```bash
npm start
```

### 6. Limpe o cache do navegador

- **Chrome/Edge**: Ctrl + Shift + Delete → Limpar cache
- **Firefox**: Ctrl + Shift + Delete → Limpar cache
- Ou use navegação anônima: Ctrl + Shift + N

### 7. Acesse a aplicação

```
http://localhost:4200
```

## Verificações Importantes

### Arquivo `angular.json` deve conter:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "node_modules/admin-lte/dist/css/adminlte.min.css",
  "src/styles.scss"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
  "node_modules/admin-lte/dist/js/adminlte.min.js"
]
```

### Arquivo `index.html` deve conter:

```html
<body class="hold-transition sidebar-mini layout-fixed">
  <app-root></app-root>
</body>
```

### Versões corretas no `package.json`:

```json
{
  "admin-lte": "^4.0.0-rc4",
  "bootstrap": "^5.3.8",
  "@fortawesome/fontawesome-free": "^7.1.0"
}
```

## Problema: Submenu não abre/fecha

Se o submenu "Cadastros" não expandir, verifique:

1. O componente sidebar deve ter a lógica de toggle:

```typescript
cadastrosExpanded = false;

toggleCadastros(): void {
  this.cadastrosExpanded = !this.cadastrosExpanded;
}
```

2. O HTML deve ter:

```html
<li class="nav-item has-treeview" [class.menu-open]="cadastrosExpanded">
  <a href="#" class="nav-link" (click)="toggleCadastros(); $event.preventDefault()">
    ...
  </a>
  <ul class="nav nav-treeview" [style.display]="cadastrosExpanded ? 'block' : 'none'">
    ...
  </ul>
</li>
```

## Problema: Ícones não aparecem

Se os ícones do FontAwesome não aparecerem:

1. Verifique se está instalado:

```bash
npm list @fortawesome/fontawesome-free
```

2. Verifique se está no `angular.json`:

```json
"styles": [
  ...
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  ...
]
```

3. Use as classes corretas:

- `fas` para sólido: `<i class="fas fa-home"></i>`
- `far` para regular: `<i class="far fa-circle"></i>`
- `fab` para brands: `<i class="fab fa-whatsapp"></i>`

## Problema: JavaScript do AdminLTE não funciona

Se os widgets do AdminLTE não funcionarem (collapse, pushmenu, etc.):

1. Verifique se o Bootstrap Bundle está carregando:

```html
<!-- No angular.json scripts: -->
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
  "node_modules/admin-lte/dist/js/adminlte.min.js"
]
```

2. Reinicie o servidor após alterar `angular.json`

## Comandos Úteis de Debug

```bash
# Verificar se o servidor está rodando
lsof -i :4200

# Ver erros de compilação em tempo real
npm start

# Build de produção para testar
npm run build

# Limpar tudo e recomeçar
rm -rf node_modules package-lock.json && npm install && npm start
```

## Solução Rápida (Reset Completo)

Se nada funcionar, faça um reset completo:

```bash
cd frontend

# 1. Pare o servidor
pkill -9 node

# 2. Limpe tudo
rm -rf node_modules package-lock.json .angular

# 3. Reinstale
npm install

# 4. Inicie novamente
npm start

# 5. Limpe o cache do navegador e recarregue a página
```

## Contato e Suporte

Se o problema persistir após seguir todos os passos:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do terminal onde o Angular está rodando
3. Verifique o arquivo `ADMINLTE_MIGRATION.md` para documentação completa
