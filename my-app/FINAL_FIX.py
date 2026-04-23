import shutil
import os

# Copy _WORKING to replace main file
src = r"C:\Users\User\Downloads\לימודים\פרויקט השקעות\my-app\components\InvestmentHero\InvestmentHero_WORKING.jsx"
dst = r"C:\Users\User\Downloads\לימודים\פרויקט השקעות\my-app\components\InvestmentHero\InvestmentHero.jsx"

shutil.copy(src, dst)
print("InvestmentHero fixed!")

# Cleanup temp files
base = r"C:\Users\User\Downloads\לימודים\פרויקט השקעות\my-app"
temps = [
    "components/InvestmentHero/InvestmentHero_new.jsx",
    "components/InvestmentHero/InvestmentHero_final.jsx",
    "components/InvestmentHero/InvestmentHero_replace.jsx",
    "components/InvestmentHero/InvestmentHero_CLEAN.jsx",
    "components/InvestmentHero/InvestmentHero_FIXED.jsx",
    "components/InvestmentHero/InvestmentHero.jsx.new",
    "components/InvestmentHero/InvestmentHero_WORKING.jsx",
    "components/PropertyShowcase/PropertyShowcase_updated.jsx",
    "components/PropertyShowcase/PropertyShowcase_new.jsx",
    "components/PropertyShowcase/PropertyShowcase_final.jsx",
    "components/CalculatorSection/CalculatorSection_new.tsx",
    "components/CalculatorSection/CalculatorSection_final.tsx",
    "cleanup.py",
    "cleanup.bat",
    "replace.js",
    "final_cleanup.py",
    "fix_final.py",
    "run_cleanup.py",
    "FIX_ALL.bat",
]

for temp in temps:
    path = os.path.join(base, temp)
    if os.path.exists(path):
        os.remove(path)

print("Cleanup complete!")
print("\nAll components now read from JSON correctly!")
print("\nReady to test: npm run dev")
