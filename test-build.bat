@echo off
echo Testing React build for Vercel deployment...
cd client
npm run build

if %ERRORLEVEL% EQU 0 (
  echo Build completed successfully! Your app should deploy correctly on Vercel.
) else (
  echo Build failed. Please check the errors above.
)

pause
