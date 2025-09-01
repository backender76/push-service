# Push Service

Пока идея в том, чтобы просто собирать токены для Push-уведомлений в базу.

## Полезые ссылки

https://www.rustore.ru/help/sdk/push-notifications/send-push-notifications

Ссылка для подключения в Compass: `mongodb://demo:demo@localhost:27019/push`

https://yandex.cloud/ru/docs/notifications/concepts/push

## Зависимости

1) Docker
2) Ansible

## After git clone

1) Создать файл `.env` по образу и подобию `default.env`. Он испрользуется в шаблоне `services.j2` для генерации конфига linux-сервиса.

2) Создать файл `.vault-pass` содержащий пароль для кошелька Ansible.

3) Создать инвентари (inventory.ini) для Ansible. Пример:

```ini
[production]
production-1 ansible_connection=ssh ansible_host=100.200.400.400 ansible_user=username

[all:vars]
ansible_python_interpreter=/usr/bin/python3.9
```

4) Выполнить `npm ci`.

5) Конфиг хоста:

```
server {
    server_name api.my-site.ru;

    gzip on;
    gzip_types text/plain application/json;
    gzip_comp_level 2;

    access_log /var/log/nginx/api.my-site.ru.access.log;
    error_log /var/log/nginx/api.my-site.ru.error.log error;

    location ~ ^/api/(auth|push-token) {
        proxy_pass http://127.0.0.1:8801;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location ~ ^/api/score {
        proxy_pass http://127.0.0.1:8810;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.my-site.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.my-site.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = api.my-site.ru) {
        return 301 https://$host$request_uri;
    }
    server_name api.my-site.ru;
    listen 80;
    return 404;
}
```

## Сборка и Деплой

`export ANSIBLE_VAULT_PASSWORD_FILE="./.vault-pass"`

`ansible-playbook -i inventory.ini build.yml --ask-become-pass`

`ansible-playbook -i inventory.ini deploy.yml`
