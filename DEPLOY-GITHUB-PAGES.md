# استقرار هم‌سنج روی GitHub Pages

این راهنما برای انتشار پروژهٔ Vite از پوشهٔ `ham-sanj` به‌صورت یک ریپوی جدا روی GitHub Pages است.

## ۱) ساخت ریپو در GitHub

1. وارد [github.com/new](https://github.com/new) شوید.
2. نام ریپو را دقیقاً **`ham-sanj`** بگذارید.
3. Public انتخاب کنید.
4. گزینهٔ «Add a README» را **تیک نزنید** (ریپو خالی باشد).
5. Create repository را بزنید.

## ۲) اولین push از پوشهٔ ham-sanj

در PowerShell داخل پوشهٔ پروژه:

```powershell
cd C:\Users\WALLEX\.cursor\interview\ham-sanj

git init
git branch -M main
git add .
git commit -m "Initial commit: HamSanj for GitHub Pages"

# USERNAME را با نام کاربری GitHub خود عوض کنید
git remote add origin https://github.com/USERNAME/ham-sanj.git
git push -u origin main
```

اگر GitHub از شما لاگین خواست، با مرورگر یا Personal Access Token وارد شوید.

## ۳) فعال‌کردن Pages با GitHub Actions

1. در ریپو: **Settings → Pages**
2. در بخش **Build and deployment → Source** گزینهٔ **GitHub Actions** را انتخاب کنید.
3. بعد از push به `main`، ورک‌فلو `Deploy to GitHub Pages` اجرا می‌شود.

مسیر ورک‌فلو در پروژه: `.github/workflows/deploy.yml`

## ۴) آدرس نهایی

بعد از موفق بودن deploy:

```text
https://USERNAME.github.io/ham-sanj/
```

جای `USERNAME` را با نام کاربری GitHub خود بگذارید.

> **نکته:** اولین استقرار معمولاً ۱ تا ۲ دقیقه طول می‌کشد. اگر صفحه ۴۰۴ بود، چند دقیقه صبر کنید و Actions را در تب **Actions** چک کنید.

## ۵) به‌روزرسانی بعدی

هر بار که به `main` پوش کنید، سایت دوباره بیلد و دیپلوی می‌شود:

```powershell
git add .
git commit -m "Update HamSanj"
git push
```
