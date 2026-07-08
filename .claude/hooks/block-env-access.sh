#!/usr/bin/env bash
# PreToolUse(Bash) hook: .env fayllarni o'qish/cat/commit qilishga urinishni bloklaydi.
# Sotuvchi Trainer qat'iy qoidasi: API kalitlar faqat .env dan, kodga/logga/commitga chiqmaydi.
#
# Kirish: Claude Code hook JSON'ni stdin orqali uzatadi (tool_input.command ichida bash buyrug'i).
# Chiqish: bloklansa exit code 2 (Claude'ga xabar stderr orqali), aks holda 0.

set -euo pipefail

# stdin dan JSON o'qib, bajariladigan buyruqni ol.
input="$(cat)"

# jq bo'lsa undan foydalanamiz, bo'lmasa xom JSON matnini tekshiramiz.
if command -v jq >/dev/null 2>&1; then
  command_str="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"
else
  command_str="$input"
fi

# Tekshiriladigan xavfli naqshlar: .env fayllarni o'qish/ko'rish/commit qilish.
# .env.example ruxsat etiladi (maxfiy emas).
if printf '%s' "$command_str" | grep -Eiq '(^|[^a-zA-Z0-9_./-])\.env(\.local|\.production|\.development)?([^a-zA-Z0-9_.-]|$)'; then
  # .env.example ni istisno qil: agar faqat .env.example bo'lsa, o'tkaz.
  if printf '%s' "$command_str" | grep -Eiq '\.env\.example'; then
    # .env.example dan tashqari boshqa .env ham bormi?
    if ! printf '%s' "$command_str" | grep -Eiq '(^|[^a-zA-Z0-9_./-])\.env(\.local|\.production|\.development)?([^a-zA-Z0-9_.eample-]|$)'; then
      exit 0
    fi
  fi

  # cat / less / head / tail / print / commit / add kabi risk buyruqlari .env bilan birga bo'lsa — blok.
  if printf '%s' "$command_str" | grep -Eiq '\b(cat|less|more|head|tail|bat|nl|cp|mv|git[[:space:]]+add|git[[:space:]]+commit|xxd|od|strings|printenv|env)\b'; then
    echo "BLOK: .env faylga tegish taqiqlanadi (API kalitlar maxfiy). .env.example dan foydalaning. Qoida: CLAUDE.md §3." >&2
    exit 2
  fi

  # Umumiy ehtiyot: .env yo'naltirish/echo bilan ko'rsatishga urinish.
  if printf '%s' "$command_str" | grep -Eiq '(>|>>|<)[[:space:]]*\.env|echo.*\.env'; then
    echo "BLOK: .env faylga yozish/o'qish taqiqlanadi. Qoida: CLAUDE.md §3." >&2
    exit 2
  fi
fi

exit 0
