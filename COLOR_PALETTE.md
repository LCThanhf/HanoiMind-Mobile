# Unified Color Palette

| Group | Token | Hex | Usage |
| --- | --- | --- | --- |
| Brand | primary | #2B8EF0 | Main CTA, active tab, selected icon |
| Brand | primaryStrong | #1D4ED8 | Emphasis links, stronger states |
| Brand | primarySoft | #EBF5FF | Soft highlighted backgrounds |
| Brand | primaryBorder | #BFDBFE | Informational border, timeline |
| Brand | secondary | #3B82F6 | Info and map route secondary blue |
| Brand | accent | #22C55E | Positive brand accent |
| Text | textPrimary | #111827 | Main headings and body text |
| Text | textSecondary | #374151 | Supporting text |
| Text | textTertiary | #6B7280 | Metadata and captions |
| Text | textMuted | #9CA3AF | Disabled and hint text |
| Surface | surfaceBase | #FFFFFF | Cards and elevated surfaces |
| Surface | surfacePage | #F8FAFC | App background |
| Surface | surfaceMuted | #F3F4F6 | Neutral chips and muted sections |
| Border | borderDefault | #E5E7EB | Standard border |
| Border | borderSoft | #D1D5DB | Inputs and soft separators |
| Status | success | #22C55E | Positive action and badges |
| Status | successSoft | #DCFCE7 | Success background |
| Status | successStrong | #16A34A | Success text emphasis |
| Status | warning | #F59E0B | Warning icon/text |
| Status | warningSoft | #FEF3C7 | Warning background |
| Status | warningStrong | #D97706 | Warning text emphasis |
| Status | danger | #EF4444 | Destructive action |
| Status | dangerSoft | #FEE2E2 | Destructive background |
| Status | dangerStrong | #DC2626 | Destructive text emphasis |
| Status | info | #3B82F6 | Info state |
| Status | infoSoft | #DBEAFE | Info background |
| Status | infoStrong | #1E3A8A | Info text emphasis |
| Map | mapStart | #0EA5E9 | Starting marker icon |
| Map | mapPin | #10B981 | Place marker icon |
| Map | mapRoute | #3B82F6 | Route polyline |
| Map | mapTimeline | #BFDBFE | Route timeline connector |

## Notes

- Blue-first identity is preserved, but duplicate blues are reduced.
- Existing legacy hex values are normalized through `LegacyColorMap` in `utils/theme.ts`.
- Icon colors should use `IconColors` tokens for active/inactive/success/warning/danger consistency.
