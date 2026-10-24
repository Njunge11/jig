---
type: regex
pattern: '^(?![ \t]*[-\/*])(?!const STAGE_LABEL = \{ longlisted: "Longlisted", shortlisted: "Shortlisted" \} as const;)[^\n]*?(?:\b(?!label\b)\w+\s*:\s*"(?:Longlisted|Shortlisted|Not a match)"|>\s*(?:Longlisted|Shortlisted|Not a match)\s*<|\[\s*"(?:Longlisted|Shortlisted|Not a match)")'
flags: m
match: not_contains
---
