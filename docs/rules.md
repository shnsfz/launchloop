# LaunchLoop Readiness Rules

LaunchLoop v0.1 uses a 100-point readiness score.

| Rule | Weight |
|---|---:|
| README exists | 8 |
| Value proposition is detectable | 8 |
| Pricing or billing path exists | 10 |
| Auth path exists | 8 |
| Onboarding path exists | 7 |
| Environment variables are documented | 10 |
| Deployment path is documented or configured | 7 |
| Analytics is present | 8 |
| Error monitoring is present | 6 |
| Support or feedback channel exists | 6 |
| Legal basics exist | 6 |
| No local .env files detected in project root | 8 |
| Test command exists | 4 |
| Build command exists | 4 |

A project is ready when score >= readinessThreshold and no blocker remains.
