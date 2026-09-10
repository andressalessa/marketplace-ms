# 1. Remova a pasta .git interna do novo serviço
rm -rf checkout-service/.git

# 2. Atualize o índice do Git para que ele passe a enxergar os arquivos
git rm --cached checkout-service 2>/dev/null

# 3. Verifique o status novamente
git status
