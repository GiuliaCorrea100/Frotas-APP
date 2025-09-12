FROM nginx:stable-alpine

ENV TZ="America/Porto_Velho"
RUN apk add --no-cache tzdata

COPY dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
