@echo off
chcp 65001 >nul
call npx staticrypt dist/docs/dev/secret/index.html -p sage123 -d dist/docs/dev/secret/ --short -t src/staticrypt-template.html --template-button 解密 --template-placeholder 输入密码 --template-error "密码错误，请重试" --template-instructions "此文档受密码保护"
