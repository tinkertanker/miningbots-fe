FROM nginx:1.27.1
EXPOSE 9000 9001 9002 9003 9004 9005

WORKDIR /usr/
COPY ./ /usr/share/nginx/html/
