FROM nginx:1.25-alpine

# Remove default nginx configuration
RUN rm /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create log directories
RUN mkdir -p /var/log/nginx

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
