# Push Service

Пока идея в том, чтобы просто собирать токены для Push-уведомлений в базу.

## Полезые ссылки

https://www.rustore.ru/help/sdk/push-notifications/send-push-notifications

Ссылка для подключения в Compass: `mongodb://demo:demo@localhost:27019/push`

https://yandex.cloud/ru/docs/notifications/concepts/push

## Сборка и Деплой

`ansible-playbook -i inventory.ini build.yml --ask-become-pass`

`ansible-playbook -i inventory.ini deploy.yml`

Пример inventory.ini:

```ini
[production]
my-hots ansible_connection=ssh ansible_host=100.200.400.400 ansible_user=username

[all:vars]
ansible_python_interpreter=/usr/bin/python3.9
```
