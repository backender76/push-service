# Push Service

Пока идея в том, чтобы просто собирать токены для Push-уведомлений в базу.

## Полезые ссылки

https://www.rustore.ru/help/sdk/push-notifications/send-push-notifications

Ссылка для подключения в Compass: `mongodb://demo:demo@localhost:27019/api`

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

5) Выполнить `docker volume create mongo` и `docker volume create mongo-config`.

## Сборка и Деплой

`export ANSIBLE_VAULT_PASSWORD_FILE="./.vault-pass"`

`ansible-playbook -i inventory.ini build.yml --ask-become-pass`

`ansible-playbook -i inventory.ini deploy.yml`


`sudo journalctl -u push-service.service -f`
`sudo systemctl status push-service.service`
