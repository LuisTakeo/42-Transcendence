FROM ngrok/ngrok:latest

# Criar diretório para configuração
WORKDIR /app

# Copiar arquivo de configuração
COPY --chmod=644 ngrok.yml /etc/ngrok.yml

# Expor porta da API
EXPOSE 4040

# Comando padrão
CMD ["start", "--all", "--config", "/etc/ngrok.yml"]