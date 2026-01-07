# Project Status & Todo

## ✅ Resolved Issues

- **[FIXED] Proxy 404 Errors**: Added `/proxy` route in `proxy.conf.json` to forward requests to `papihairdesign.sk`.
- **[FIXED] OpenAI Image Upload Error**: Implemented `base64ToBlob` in `openai.service.ts` to convert any image format to PNG and auto-resize to <4MB.
- **[FIXED] Chatbot Response Time**: Optimized with FAQ cache, GPT-3.5-turbo, and reduced tokens.
- **[FIXED] Code Quality**: Fixed `PushNotificationService` injection, accessibility in `hair-styler.html`, and missing imports in `SalonDataService`.
- **[FIXED] Deployment Script**: Fixed `log_error` order in `deploy-ultimate.sh`.

## ⚠️ Known Dev Mode Behaviors

- **Service Worker Push**: "Service Worker Push is not enabled" is expected in `npm run dev` (HTTP). Requires HTTPS/Production.

## 🔍 Diagnosis & Pending Tasks

### Code Quality (Linting Issues)

- [x] **ImageService**: Remove unused `map` import and unnecessary type annotations in `src/app/core/services/image.service.ts`.
- [x] **ChatbotComponent**: Convert `UiMsg` type to interface in `src/app/features/chatbot/chatbot.component.ts`.
- [x] **VirtualSalon HTML**: Add `for` attribute or nest control within label in `src/app/features/virtual-salon/virtual-salon.component.html`.
- [x] **VirtualSalon TS**: Remove empty lifecycle method `ngOnInit` in `src/app/features/virtual-salon/virtual-salon.component.ts`.

### Security & Best Practices

- [ ] **Secrets**: Ensure `OPENAI_API_KEY` is not committed to repo (check .gitignore).
- [ ] **Error Handling**: Verify global error handler catches async pipe errors in templates.

### Optimization Opportunities

- [ ] **Lazy Loading**: Verify all feature modules are lazy loaded (check `app.routes.ts`).
- [ ] **Bundle Size**: Monitor `main.js` size (currently ~4MB dev, check prod build size).
