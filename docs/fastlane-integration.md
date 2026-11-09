# Fastlane Integration

ASOCraft outputs files following standard Fastlane directory conventions for both `deliver` (iOS) and `supply` (Android).

## File organization

The standard Fastlane layout expected by store automation tools:

```
fastlane/
└── metadata/
    ├── android/
    │   ├── de-DE/
    │   │   ├── full_description.txt
    │   │   ├── short_description.txt
    │   │   └── title.txt
    │   ├── fr-FR/
    │   │   ├── full_description.txt
    │   │   ├── short_description.txt
    │   │   └── title.txt
    │   └── ...
    └── ios/
        ├── de-DE/
        │   ├── description.txt
        │   ├── keywords.txt
        │   ├── promotional_text.txt
        │   ├── subtitle.txt
        │   └── title.txt
        ├── fr-FR/
        │   └── ...
        └── ...
```

## Locale code differences

Apple App Store and Google Play use slightly different locale identifiers for some regions. ASOCraft automatically handles mapping between these schemas:

| Region | iOS locale identifier | Google Play locale identifier |
|---|---|---|
| German (Germany) | `de-DE` | `de-DE` |
| French (France) | `fr-FR` | `fr-FR` |
| Spanish (Spain) | `es-ES` | `es-ES` |
| Spanish (Latin America / US) | `es-MX` | `es-US` |
| Portuguese (Brazil) | `pt-BR` | `pt-BR` |
| Portuguese (Portugal) | `pt-PT` | `pt-PT` |
| Japanese | `ja` | `ja-JP` |
| Korean | `ko` | `ko-KR` |
| Chinese (Simplified) | `zh-Hans` | `zh-CN` |
| Chinese (Traditional) | `zh-Hant` | `zh-TW` |
| Russian | `ru` | `ru-RU` |
| Italian | `it` | `it-IT` |

## Deploying to stores

Once ASOCraft has localized the metadata, you deploy to the stores with standard Fastlane commands:

### Upload to Apple App Store (iOS)

```bash
# Upload metadata only
fastlane deliver --skip_binary_upload true --skip_screenshots true
```

### Upload to Google Play Console (Android)

```bash
# Upload metadata only
fastlane supply --skip_upload_apk true --skip_upload_aab true --skip_upload_images true --skip_upload_screenshots true
```
