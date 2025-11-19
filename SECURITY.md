# Security Guidelines

## 🔒 Confidential Files

The following files contain sensitive information and should **NEVER** be committed to git:

### Environment Files
- `.env` - Production/development environment variables
- `.env.local` - Local overrides
- `.env.*.local` - Environment-specific local overrides

### What's in `.env`?
- API URLs and endpoints
- Stripe publishable keys (while technically "publishable", it's best practice to keep them private)
- Any other API keys or tokens

## ✅ Safe to Share

- `.env.example` - Template showing required variables (without real values)
- Source code files (`.tsx`, `.ts`, `.css`, etc.)
- Configuration files (`vite.config.ts`, `tsconfig.json`, etc.)

## 🛡️ Best Practices

1. **Never commit secrets**
   - Always check `.gitignore` includes `.env` files
   - Use `.env.example` for documentation only

2. **Use different keys for different environments**
   - Development: `pk_test_...` (Stripe test keys)
   - Production: `pk_live_...` (Stripe live keys)

3. **Rotate keys if exposed**
   - If you accidentally commit a secret, rotate it immediately
   - Remove it from git history using `git filter-branch` or BFG Repo-Cleaner

4. **Environment-specific configuration**
   - Development: `http://localhost:3000`
   - Production: `https://api.yourdomain.com`

## 🚨 If You Accidentally Commit Secrets

1. **Immediately rotate the exposed credentials**
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push (⚠️ warning - this rewrites history):**
   ```bash
   git push origin --force --all
   ```

## 📞 Contact

If you discover a security vulnerability, please report it to the maintainers immediately.
