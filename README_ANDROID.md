# Life Engine Uz - APK yaratish qo'llanmasi

Ushbu loyihani APK (Android) faylga aylantirish uchun quyidagi qadamlarni bajaring:

## 1. Tayyorgarlik
Kompyuteringizda quyidagilar o'rnatilgan bo'lishi kerak:
- **Node.js** (LTS versiyasi)
- **Android Studio**
- **Java JDK 17** (yoki undan yuqori)

## 2. Loyihani qurish (Building)
Terminalda (loyihaning ichida) quyidagi buyruqlarni bering:

```bash
# 1. Kutubxonalarni o'rnatish
npm install

# 2. Veb loyihani tayyorlash
npm run build

# 3. Capacitor-ni sinxronizatsiya qilish
npx cap sync
```

## 3. Android platformasini qo'shish
Agar `android` papkasi loyihada bo'lmasa, uni yarating:

```bash
npx cap add android
```

## 4. Android Studio'da ochish
Loyihani Android Studio dasturida ochish uchun:

```bash
npx cap open android
```

## 5. APK / AAB chiqarish
Android Studio ochilgandan keyin:
1. Loyiha yuklanishini kuting (Gradle build).
2. Yuqoridagi menyuda: **Build > Build Bundle(s) / APK(s) > Build APK(s)** ni bosing.
3. Agar Play Marketga qo'ymoqchi bo'lsangiz: **Build > Generate Signed Bundle / APK...** ni tanlang (Bunda sizga ruxsatnoma kaliti - KeyStore kerak bo'ladi).

---

**Muhim:** Capacitor loyihasi `dist` papkasidagi fayllardan foydalanadi. Har safar kodni o'zgartirganingizda `npm run build` va `npx cap sync` buyruqlarini berishni unutmang.
